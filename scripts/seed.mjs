// Usage: node --env-file=.env.local scripts/seed.mjs you@gmail.com [path/to/Coaching/data]
// Requires SUPABASE_SERVICE_ROLE_KEY (server only). Idempotent: upserts on natural keys.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const [email, dataDir] = process.argv.slice(2);
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: users } = await sb.auth.admin.listUsers({ perPage: 200 });
const user = users.users.find((u) => u.email === email);
if (!user) throw new Error(`No user ${email}. Sign in once with Google first.`);
const uid = user.id;

const csv = (path) => {
  const [head, ...rows] = readFileSync(path, "utf8").trim().split("\n");
  const cols = head.split(",");
  return rows.map((r) => Object.fromEntries(r.split(",").map((v, i) => [cols[i], v === "" ? null : v])));
};
const num = (v) => (v == null ? null : Number(v));
const must = ({ error }) => { if (error) throw error; };

// Plan
const plan = JSON.parse(readFileSync("supabase/seed/plan.json", "utf8"));
await sb.from("plan_phases").delete().eq("user_id", uid);
await sb.from("plan_events").delete().eq("user_id", uid);
must(await sb.from("plan_phases").insert(plan.phases.map((p) => ({ ...p, user_id: uid }))));
must(await sb.from("plan_events").insert(plan.events.map((e) => ({ ...e, user_id: uid }))));

// Sessions
for (const s of JSON.parse(readFileSync("supabase/seed/sessions.json", "utf8"))) {
  const { data: row, error } = await sb.from("workout_sessions").upsert(
    { user_id: uid, date: s.date, kind: s.kind, title: s.title, starts_at: s.time?.slice(0, 5), program_week: s.week, note: s.note },
    { onConflict: "user_id,date" },
  ).select("id").single();
  if (error) throw error;
  await sb.from("session_exercises").delete().eq("session_id", row.id);
  must(await sb.from("session_exercises").insert(
    s.exercises.map((e, i) => ({ user_id: uid, session_id: row.id, name: e.name, position: i, target: e.target, tip: e.tip ?? null })),
  ));
}

if (dataDir) {
  const daily = csv(`${dataDir}/daily-metrics.csv`).map((r) => ({
    user_id: uid, date: r.date, sleep_start: r.sleep_start, sleep_end: r.sleep_end, sleep_hours: num(r.sleep_hours),
    sleep_score: num(r.sleep_score), deep_min: num(r.deep_min), rem_min: num(r.rem_min), resting_hr: num(r.resting_hr),
    hrv_ms: num(r.hrv_ms), hrv_status: r.hrv_status, body_battery_morning: num(r.body_battery_morning),
    stress_avg: num(r.stress_avg), steps: num(r.steps), training_readiness: num(r.training_readiness),
  }));
  must(await sb.from("garmin_daily").upsert(daily, { onConflict: "user_id,date" }));
  const acts = csv(`${dataDir}/activities.csv`).map((r) => ({
    user_id: uid, activity_id: Number(r.activity_id), date: r.date, type: r.type, name: r.name,
    duration_min: num(r.duration_min), distance_km: num(r.distance_km), avg_hr: num(r.avg_hr), max_hr: num(r.max_hr),
    calories: num(r.calories), training_effect: num(r.training_effect),
  }));
  must(await sb.from("garmin_activities").upsert(acts, { onConflict: "user_id,activity_id" }));
}

must(await sb.from("body_measures").upsert({
  user_id: uid, date: "2026-10-29", weight_kg: 78, waist_navel_cm: 82, waist_below_navel_cm: 84, shoulders_cm: 126,
  chest_cm: 108, neck_cm: 39, arm_relaxed_cm: 32, arm_flexed_cm: 36, thigh_cm: 58, thigh_above_knee_cm: 42,
  calf_cm: 39, forearm_cm: 29, wrist_cm: 16, note: "baseline",
}, { onConflict: "user_id,date" }));
console.log("seed ok for", email);
