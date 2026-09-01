import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "./CommandPalette";

const PAGE_EASE = [0.23, 1, 0.32, 1] as const;

export function AppShell() {
  const location = useLocation();
  const reduceMotion = useReducedMotion() === true;
  const [paletteOpen, setPaletteOpen] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      const isK = e.key === "k" || e.key === "K";
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setPaletteOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 px-6 md:px-8 py-6 max-w-[1600px] mx-auto w-full">
        <Topbar onOpenPalette={openPalette} />
        <motion.div
          key={location.pathname}
          className={reduceMotion ? undefined : "page-view"}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18, ease: PAGE_EASE }}
        >
          <Outlet />
        </motion.div>
      </main>
      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </div>
  );
}
