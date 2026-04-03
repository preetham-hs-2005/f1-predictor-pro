import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold uppercase tracking-[0.18em] ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,rgba(255,115,77,1),rgba(255,168,76,0.95))] text-primary-foreground shadow-[0_18px_45px_rgba(255,107,62,0.38)] hover:-translate-y-0.5 hover:shadow-[0_26px_55px_rgba(255,107,62,0.46)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 hover:-translate-y-0.5 hover:bg-destructive/90",
        outline:
          "border border-white/12 bg-white/[0.04] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-0.5 hover:border-primary/45 hover:bg-white/[0.08]",
        secondary: "bg-white/[0.06] text-secondary-foreground hover:-translate-y-0.5 hover:bg-white/[0.1]",
        ghost: "text-white/72 hover:bg-white/[0.06] hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
        glass:
          "border border-white/10 bg-white/[0.05] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl hover:-translate-y-0.5 hover:bg-white/[0.08] hover:border-white/20",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-xl px-3 text-[0.68rem]",
        lg: "h-12 rounded-2xl px-8 text-sm",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
