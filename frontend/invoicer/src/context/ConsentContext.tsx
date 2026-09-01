import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultConsent,
  readConsent,
  writeConsent,
  type ConsentState,
} from "@/lib/consent";
import { analytics, initAnalytics } from "@/lib/analytics";

interface ConsentContextValue {
  consent: ConsentState | null;
  decided: boolean;
  prefsOpen: boolean;
  openPrefs: () => void;
  closePrefs: () => void;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  save: (analyticsOn: boolean) => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    setHydrated(true);
    initAnalytics();
    analytics.setAllowed(Boolean(stored?.analytics));
  }, []);

  const persist = useCallback((analyticsOn: boolean) => {
    const next: ConsentState = {
      ...defaultConsent(),
      analytics: analyticsOn,
      updatedAt: new Date().toISOString(),
    };
    writeConsent(next);
    setConsent(next);
    analytics.setAllowed(analyticsOn);
    setPrefsOpen(false);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      decided: hydrated && consent !== null,
      prefsOpen,
      openPrefs: () => setPrefsOpen(true),
      closePrefs: () => setPrefsOpen(false),
      acceptAll: () => persist(true),
      rejectNonEssential: () => persist(false),
      save: persist,
    }),
    [consent, hydrated, prefsOpen, persist],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used inside ConsentProvider");
  return ctx;
}
