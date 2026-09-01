import { cn } from "@/lib/utils";

export function Spinner({
  size = 28,
  className,
  label = "Loading",
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("relative inline-flex text-[var(--accent)]", className)}
      style={{ width: size, height: size }}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border-2 border-[var(--accent-soft)]"
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--accent)] border-r-[var(--accent)] animate-spin motion-reduce:animate-none"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PageSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center py-24", className)}
      aria-busy="true"
    >
      <Spinner />
    </div>
  );
}
