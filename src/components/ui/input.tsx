import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full min-w-0 rounded-md border border-input bg-muted px-3 text-center text-lg font-semibold tabular-nums outline-none placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
