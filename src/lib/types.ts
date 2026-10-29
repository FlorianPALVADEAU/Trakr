export type SessionKind = "push" | "pull" | "legs" | "upper" | "lower" | "cardio" | "rest";

export type SetLog = {
  id: string; session_exercise_id: string; set_no: number;
  reps: number | null; load_kg: number | null; rpe: number | null; pain: number | null;
};
export type SessionExercise = {
  id: string; name: string; position: number; target: string | null; tip: string | null;
  set_logs: SetLog[];
};
export type WorkoutSession = {
  id: string; date: string; kind: SessionKind; title: string; starts_at: string | null;
  program_week: number | null; note: string | null; status: "planned" | "done" | "skipped";
  session_exercises: SessionExercise[];
};
export type GarminDay = {
  date: string; sleep_hours: number | null; sleep_score: number | null; steps: number | null;
  resting_hr: number | null; hrv_ms: number | null; body_battery_morning: number | null;
  training_readiness: number | null; sleep_start: string | null;
};
