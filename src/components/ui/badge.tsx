import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide", {
  variants: {
    variant: {
      default: "bg-muted text-muted-foreground",
      primary: "bg-primary text-primary-foreground",
      warning: "bg-warning/15 text-warning",
      destructive: "bg-destructive/15 text-destructive",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
