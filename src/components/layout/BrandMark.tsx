import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

interface BrandMarkProps {
  to?: string;
  compact?: boolean;
  className?: string;
}

export function BrandMark({ to = "/", compact = false, className }: BrandMarkProps) {
  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-sm bg-signal text-signal-foreground sm:h-11 sm:w-11">
        <span className="display text-base font-black leading-none sm:text-lg">F1</span>
        <span className="absolute -inset-1 rounded-sm border border-signal/0 transition-colors group-hover:border-signal" />
      </div>
      <div className="min-w-0">
        <p className="display text-sm font-bold uppercase leading-none text-white sm:text-base">
          Predictor
        </p>
        {!compact && <p className="data-mono mt-1 hidden text-[9px] uppercase text-muted-foreground sm:block">Pro / race control</p>}
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="group inline-flex items-center">
      {content}
    </Link>
  ) : (
    content
  );
}
