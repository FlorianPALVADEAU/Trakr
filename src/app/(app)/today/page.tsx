import { Effect } from "effect";
import { createClient } from "@/lib/supabase/server";
import { query, runOr } from "@/lib/effect/query";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SetRow } from "@/components/app/set-row";
import type { GarminDay, WorkoutSession } from "@/lib/types";

export const dynamic = "force-dynamic";

const todayISO = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" }).format(new Date());

export default async function Today() {
  const supabase = await createClient();
  const date = todayISO();

  const program = Effect.all({
    session: query<WorkoutSession | null>(() =>
      supabase.from("workout_sessions")
        .select("*, session_exercises(*, set_logs(*))")
        .eq("date", date).maybeSingle() as never),
    garmin: query<GarminDay[]>(() =>
      supabase.from("garmin_daily").select("*").lte("date", date).order("date", { ascending: false }).limit(1) as never),
  });
  const { session, garmin } = await runOr(program, { session: null, garmin: [] as GarminDay[] });
  const g = garmin[0];
  const exercises = [...(session?.session_exercises ?? [])].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" }).format(new Date())}
        </p>
        <h1 className="mt-1 text-4xl font-black tracking-tight">{session?.title ?? "Pas de séance"}</h1>
        {session && <div className="mt-2 flex gap-2"><Badge variant="primary">{session.kind}</Badge>{session.starts_at && <Badge>{session.starts_at.slice(0, 5)}</Badge>}{session.program_week && <Badge>Semaine {session.program_week}</Badge>}</div>}
      </header>

      {g && (
        <Card>
          <CardTitle>Récupération · {g.date}</CardTitle>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            {[["Sommeil", g.sleep_hours ? `${g.sleep_hours} h` : "–"], ["Score", g.sleep_score ?? "–"], ["VFC", g.hrv_ms ?? "–"], ["Batterie", g.body_battery_morning ?? "–"]].map(([k, val]) => (
              <div key={k as string}><div className="text-2xl font-black tabular-nums">{val}</div><div className="text-[11px] text-muted-foreground">{k}</div></div>
            ))}
          </div>
        </Card>
      )}

      {session?.note && <Card className="border-warning/40 text-sm text-warning">{session.note}</Card>}

      {exercises.map((ex) => (
        <Card key={ex.id} className="space-y-3">
          <div>
            <h2 className="text-lg font-bold">{ex.name}</h2>
            {ex.target && <p className="text-sm text-primary">{ex.target}</p>}
            {ex.tip && <p className="mt-1 text-xs text-muted-foreground">{ex.tip}</p>}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }, (_, i) => (
              <SetRow key={i} sessionExerciseId={ex.id} setNo={i + 1} initial={ex.set_logs.find((s) => s.set_no === i + 1)} />
            ))}
          </div>
        </Card>
      ))}
      {!session && <Card className="text-muted-foreground">Aucune séance prévue aujourd&apos;hui. Repos.</Card>}
    </div>
  );
}
