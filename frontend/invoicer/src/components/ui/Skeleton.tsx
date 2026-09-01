import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-full bg-[var(--surface-2)]", className)}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5" aria-busy="true">
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-8 w-32 rounded-xl" />
    </div>
  );
}

export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="space-y-4" aria-busy="true">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-28 mt-2" />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-5 max-w-[900px]" aria-busy="true">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9" />
        <div className="flex-1">
          <Skeleton className="h-7 w-48 mb-2 rounded-xl" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-3xl" />
      <Skeleton className="h-56 w-full rounded-3xl" />
    </div>
  );
}

export function InvoiceEditorSkeleton() {
  return (
    <div className="max-w-[1100px]" aria-busy="true">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-3xl" />
      </div>
    </div>
  );
}
