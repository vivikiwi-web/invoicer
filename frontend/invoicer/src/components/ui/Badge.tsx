import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { isEffectiveStatus } from "@shared/types";
import type { EffectiveStatus } from "@shared/types";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-tight tabular",
  {
    variants: {
      tone: {
        neutral:
          "bg-[var(--surface-2)] text-[var(--ink-muted)] border border-[var(--border)]",
        accent: "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
        success: "bg-[var(--success)]/12 text-[var(--success)]",
        warning: "bg-[var(--warning)]/14 text-[var(--warning)]",
        danger: "bg-[var(--danger)]/12 text-[var(--danger)]",
        ink: "bg-[var(--ink)] text-[var(--bg)]",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export const INVOICE_STATUS: Record<
  EffectiveStatus,
  { tone: NonNullable<VariantProps<typeof badgeVariants>["tone"]>; label: string }
> = {
  draft: { tone: "neutral", label: "Draft" },
  sent: { tone: "accent", label: "Sent" },
  paid: { tone: "success", label: "Paid" },
  overdue: { tone: "danger", label: "Overdue" },
};

export function StatusBadge({
  status,
  className,
}: {
  status?: string;
  className?: string;
}) {
  const { t } = useTranslation("common");
  const key: EffectiveStatus =
    status && isEffectiveStatus(status) ? status : "draft";
  const s = INVOICE_STATUS[key];
  return (
    <Badge tone={s.tone} className={className}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {t(`status.${key}`)}
    </Badge>
  );
}

export { badgeVariants };
