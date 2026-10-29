import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { query, runOr } from "@/lib/effect/query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
type Row = { id: string; date: string; kind: string; title: string; status: string };

export default async function Week() {
  const supabase = await createClient();
  const from = new Date().toISOString().slice(0, 10);
  const rows = await runOr(
    query<Row[]>(() => supabase.from("workout_sessions").select("id,date,kind,title,status").gte("date", from).order("date").limit(14) as never),
    [] as Row[],
  );
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-black tracking-tight">Semaine</h1>
      {rows.map((r) => (
        <Link key={r.id} href="/today"><Card className="mb-3 flex items-center justify-between">
          <div><div className="text-xs uppercase tracking-widest text-muted-foreground">{new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" }).format(new Date(r.date))}</div><div className="font-bold">{r.title}</div></div>
          <Badge variant={r.status === "done" ? "primary" : "default"}>{r.kind}</Badge>
        </Card></Link>
      ))}
      {rows.length === 0 && <Card className="text-muted-foreground">Rien de planifié.</Card>}
    </div>
  );
}
