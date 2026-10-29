import { createClient } from "@/lib/supabase/server";
import { query, runOr } from "@/lib/effect/query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
type Phase = { id: string; name: string; goal: string | null; starts_on: string; ends_on: string };
type Ev = { id: string; title: string; starts_on: string; ends_on: string };
const fmt = (d: string) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(d));

export default async function Plan() {
  const supabase = await createClient();
  const [phases, events] = await Promise.all([
    runOr(query<Phase[]>(() => supabase.from("plan_phases").select("*").order("starts_on") as never), [] as Phase[]),
    runOr(query<Ev[]>(() => supabase.from("plan_events").select("*").order("starts_on") as never), [] as Ev[]),
  ]);
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-black tracking-tight">Plan</h1>
      {events.map((e) => (
        <Card key={e.id} className="flex items-center justify-between border-primary/30">
          <span className="font-bold">{e.title}</span><Badge variant="primary">{fmt(e.starts_on)} → {fmt(e.ends_on)}</Badge>
        </Card>
      ))}
      {phases.map((p) => (
        <Card key={p.id}>
          <div className="flex items-center justify-between"><h2 className="font-bold">{p.name}</h2><Badge>{fmt(p.starts_on)} → {fmt(p.ends_on)}</Badge></div>
          {p.goal && <p className="mt-2 text-sm text-muted-foreground">{p.goal}</p>}
        </Card>
      ))}
    </div>
  );
}
