import { BottomNav } from "@/components/app/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-28 pt-[max(1.25rem,env(safe-area-inset-top))]">
      {children}
      <BottomNav />
    </div>
  );
}
