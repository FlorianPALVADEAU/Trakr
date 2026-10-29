"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Dumbbell, LineChart, Map } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/today", label: "Aujourd'hui", icon: Dumbbell },
  { href: "/week", label: "Semaine", icon: CalendarDays },
  { href: "/track", label: "Suivi", icon: LineChart },
  { href: "/plan", label: "Plan", icon: Map },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/90 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} className={cn("flex flex-col items-center gap-1 py-3 text-[11px] font-semibold", active ? "text-primary" : "text-muted-foreground")}>
                <Icon className="size-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
