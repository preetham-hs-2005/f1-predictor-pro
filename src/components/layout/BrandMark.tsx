import { Flag, Orbit } from "lucide-react";
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
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:h-11 sm:w-11">
        <div className="absolute inset-[1px] rounded-[15px] bg-[linear-gradient(145deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_55%)]" />
        <Orbit className="absolute h-6 w-6 text-primary/30 sm:h-7 sm:w-7" />
        <Flag className="relative h-[17px] w-[17px] text-primary sm:h-[18px] sm:w-[18px]" />
      </div>
      <div className="min-w-0">
        <p className="font-heading text-sm uppercase tracking-[0.28em] text-white sm:text-base sm:tracking-[0.35em]">
          <span className="bg-[linear-gradient(135deg,#ff5a36,#ffb36b)] bg-clip-text text-transparent">F1</span>
          <span className="ml-2 text-white">Predict</span>
        </p>
        {!compact && <p className="hidden text-[0.7rem] uppercase tracking-[0.3em] text-white/45 sm:block">Prediction League</p>}
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="inline-flex items-center">
      {content}
    </Link>
  ) : (
    content
  );
}
