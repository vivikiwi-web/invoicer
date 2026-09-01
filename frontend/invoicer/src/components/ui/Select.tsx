import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--ink)] outline-none transition-colors",
        "focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/15",
        "disabled:opacity-50 data-[placeholder]:text-[var(--ink-muted)]",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown size={14} className="text-[var(--ink-muted)]" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: SelectPrimitive.SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={cn(
          "z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-hover",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1.5">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-xl py-2 pl-8 pr-3 text-sm text-[var(--ink)] outline-none",
        "data-[highlighted]:bg-[var(--surface-2)] data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="absolute left-2.5 inline-flex">
        <Check size={14} className="text-[var(--accent-strong)]" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function SelectSeparator({ className }: { className?: string }) {
  return <SelectPrimitive.Separator className={cn("my-1 h-px bg-[var(--border)]", className)} />;
}

export function SelectLabel({ className, ...props }: SelectPrimitive.SelectLabelProps) {
  return (
    <SelectPrimitive.Label
      className={cn("px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]", className)}
      {...props}
    />
  );
}
