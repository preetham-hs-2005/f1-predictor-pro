import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CockpitPanelProps {
  title?: string;
  code?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  corners?: boolean;
}

export function CockpitPanel({
  title,
  code,
  action,
  children,
  className,
  bodyClassName,
  corners,
}: CockpitPanelProps) {
  return (
    <section className={cn("panel", corners && "panel-corners", className)}>
      {(title || code || action) && (
        <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            {code && <span className="data-mono text-[10px] font-bold text-signal">{code}</span>}
            {title && <h2 className="display truncate text-sm font-semibold uppercase text-foreground">{title}</h2>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function CockpitStat({
  label,
  value,
  delta,
  unit,
  className,
}: {
  label: string;
  value: string | number;
  delta?: string;
  unit?: string;
  className?: string;
}) {
  const down = delta?.startsWith("-");

  return (
    <div className={cn("panel p-4 transition-colors hover:border-signal/50", className)}>
      <div className="label-eyebrow">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="data-mono text-3xl font-bold text-foreground">{value}</span>
        {unit && <span className="data-mono text-xs text-muted-foreground">{unit}</span>}
      </div>
      {delta && (
        <div className={cn("data-mono mt-2 text-[11px] font-semibold", down ? "text-danger" : "text-signal")}>
          {delta}
        </div>
      )}
    </div>
  );
}
