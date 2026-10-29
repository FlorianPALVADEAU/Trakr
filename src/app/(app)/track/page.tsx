import { createClient } from "@/lib/supabase/server";
import { query, runOr } from "@/lib/effect/query";
import { Card, CardTitle } from "@/components/ui/card";
import { TrendChart } from "@/components/app/trend-chart";

export const dynamic = "force-dynamic";
type G = { date: string; sleep_hours: number | null; steps: number | null; hrv_ms: number | null };
type M = { date: string; weight_kg: number | null; waist_navel_cm: number | null };

export default async function Track() {
  const supabase = await createClient();
  const [g, m] = await Promise.all([
    runOr(query<G[]>(() => supabase.from("garmin_daily").select("date,sleep_hours,steps,hrv_ms").order("date", { ascending: false }).limit(30) as never), [] as G[]),
    runOr(query<M[]>(() => supabase.from("body_measures").select("date,weight_kg,waist_navel_cm").order("date").limit(60) as never), [] as M[]),
  ]);
  const gs = [...g].reverse();
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-black tracking-tight">Suivi</h1>
      <Card><CardTitle>Sommeil (h) · 30 j</CardTitle><TrendChart data={gs.map((d) => ({ x: d.date.slice(5), y: d.sleep_hours }))} /></Card>
      <Card><CardTitle>Pas · 30 j</CardTitle><TrendChart data={gs.map((d) => ({ x: d.date.slice(5), y: d.steps }))} /></Card>
      <Card><CardTitle>VFC (ms) · 30 j</CardTitle><TrendChart data={gs.map((d) => ({ x: d.date.slice(5), y: d.hrv_ms }))} /></Card>
      <Card><CardTitle>Poids (kg)</CardTitle><TrendChart data={m.map((d) => ({ x: d.date.slice(5), y: d.weight_kg }))} /></Card>
    </div>
  );
}
