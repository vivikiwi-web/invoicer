import { useEffect, useMemo, useState, type ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";

export interface ComboboxItem {
  value: string;
  label: string;
  keywords?: string;
  hint?: string;
  disabled?: boolean;
  group?: string;
}

function useIsCompact() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return compact;
}

function ComboboxList({
  items,
  value,
  onSelect,
  isLoading,
  emptyMessage,
  searchPlaceholder,
  query,
  onQueryChange,
}: {
  items: ComboboxItem[];
  value: string;
  onSelect: (value: string) => void;
  isLoading?: boolean;
  emptyMessage: string;
  searchPlaceholder: string;
  query: string;
  onQueryChange: (q: string) => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, ComboboxItem[]>();
    for (const item of items) {
      const key = item.group || "";
      const list = map.get(key) || [];
      list.push(item);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [items]);

  return (
    <Command shouldFilter={false} className="flex flex-col">
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-3">
        <Search size={14} className="text-[var(--ink-muted)]" />
        <Command.Input
          value={query}
          onValueChange={onQueryChange}
          placeholder={searchPlaceholder}
          className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-[var(--ink-muted)]"
        />
      </div>
      <Command.List className="max-h-64 overflow-y-auto p-1.5">
        {isLoading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-8 w-full rounded-xl" />
            <Skeleton className="h-8 w-full rounded-xl" />
            <Skeleton className="h-8 w-3/4 rounded-xl" />
          </div>
        ) : (
          <>
            <Command.Empty className="px-3 py-6 text-center text-sm text-[var(--ink-muted)]">
              {emptyMessage}
            </Command.Empty>
            {groups.map(([group, groupItems]) => (
              <Command.Group key={group || "default"} heading={group || undefined} className="text-[var(--ink)]">
                {groupItems.map((item) => (
                  <Command.Item
                    key={item.value}
                    value={`${item.label} ${item.keywords || ""} ${item.hint || ""}`}
                    disabled={item.disabled}
                    onSelect={() => onSelect(item.value)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm data-[selected=true]:bg-[var(--surface-2)] data-[disabled=true]:opacity-50",
                      item.value === value && "bg-[var(--surface-2)]",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{item.label}</span>
                      {item.hint ? (
                        <span className="block truncate text-[11px] text-[var(--ink-muted)]">{item.hint}</span>
                      ) : null}
                    </span>
                    {item.value === value ? (
                      <Check size={14} className="shrink-0 text-[var(--accent-strong)]" />
                    ) : null}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </>
        )}
      </Command.List>
    </Command>
  );
}

export function Combobox({
  value,
  onValueChange,
  items,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  isLoading,
  onSearchChange,
  footer,
  disabled,
}: {
  value: string;
  onValueChange: (value: string) => void;
  items: ComboboxItem[];
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  isLoading?: boolean;
  onSearchChange?: (query: string) => void;
  footer?: ReactNode;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const compact = useIsCompact();
  const selected = items.find((it) => it.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      `${it.label} ${it.keywords || ""} ${it.hint || ""}`.toLowerCase().includes(q),
    );
  }, [items, query]);

  function onQueryChange(next: string) {
    setQuery(next);
    onSearchChange?.(next);
  }

  function onSelect(next: string) {
    onValueChange(next);
    setOpen(false);
    setQuery("");
  }

  const trigger = (
    <button
      type="button"
      disabled={disabled}
      aria-expanded={open}
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-left text-sm outline-none transition-colors",
        "focus-visible:border-[var(--accent)]/50 focus-visible:ring-2 focus-visible:ring-[var(--accent)]/15",
        "disabled:opacity-50",
        !selected && "text-[var(--ink-muted)]",
      )}
    >
      <span className="truncate">{selected ? selected.label : placeholder}</span>
      <ChevronsUpDown size={14} className="shrink-0 text-[var(--ink-muted)]" />
    </button>
  );

  const body = (
    <>
      <ComboboxList
        items={filtered}
        value={value}
        onSelect={onSelect}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        searchPlaceholder={searchPlaceholder}
        query={query}
        onQueryChange={onQueryChange}
      />
      {footer ? <div className="border-t border-[var(--border)] p-1.5">{footer}</div> : null}
    </>
  );

  if (compact) {
    return (
      <>
        <div onClick={() => !disabled && setOpen(true)}>{trigger}</div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="top-auto bottom-0 left-0 right-0 max-w-none w-full translate-x-0 translate-y-0 rounded-t-3xl rounded-b-none p-0">
            <DialogTitle className="sr-only">{placeholder}</DialogTitle>
            {body}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[260px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-hover"
        >
          {body}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
