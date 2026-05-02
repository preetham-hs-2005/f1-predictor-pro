import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageShellProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function PageShell({ children, className, contentClassName }: PageShellProps) {
  return (
    <div className={cn("page-shell", className)}>
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </div>
  );
}
