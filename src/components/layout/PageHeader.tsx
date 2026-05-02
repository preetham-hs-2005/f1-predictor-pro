import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: string;
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  badge?: string;
  actions?: ReactNode;
  stats?: StatItem[];
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
  actions,
  stats,
  className,
}: PageHeaderProps) {
  return (
    <section className={cn("hero-panel", className)}>
      <div className="checker absolute right-0 top-0 h-40 w-40 opacity-[0.06]" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="page-title">{title}</h1>
              {badge && <Badge className="badge-signal">{badge}</Badge>}
            </div>
            {description && <p className="page-subtitle">{description}</p>}
          </div>
        </div>

        {actions && <div className="flex max-sm:w-full shrink-0 flex-wrap items-stretch gap-3">{actions}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="panel-subtle">
              <p className="label-eyebrow">{stat.label}</p>
              <p className="data-mono mt-2 text-xl font-bold text-white sm:text-2xl">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
