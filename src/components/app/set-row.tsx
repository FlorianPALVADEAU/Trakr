"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import type { SetLog } from "@/lib/types";

type Props = { sessionExerciseId: string; setNo: number; initial?: SetLog };

export function SetRow({ sessionExerciseId, setNo, initial }: Props) {
  const [v, setV] = useState({
    load_kg: initial?.load_kg?.toString() ?? "",
    reps: initial?.reps?.toString() ?? "",
    pain: initial?.pain?.toString() ?? "",
  });
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(initial ? "saved" : "idle");

  async function save(next = v) {
    if (next.load_kg === "" && next.reps === "") return;
    setState("saving");
    const { error } = await createClient().from("set_logs").upsert(
      {
        session_exercise_id: sessionExerciseId,
        set_no: setNo,
        load_kg: next.load_kg === "" ? null : Number(next.load_kg),
        reps: next.reps === "" ? null : Number(next.reps),
        pain: next.pain === "" ? null : Number(next.pain),
      },
      { onConflict: "session_exercise_id,set_no" },
    );
    setState(error ? "error" : "saved");
  }
  const bind = (k: keyof typeof v) => ({
    value: v[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value }),
    onBlur: () => save(),
  });

  return (
    <div className="grid grid-cols-[1.5rem_1fr_1fr_1fr_0.75rem] items-center gap-2">
      <span className="text-sm font-bold text-muted-foreground">{setNo}</span>
      <Input inputMode="decimal" placeholder="kg" {...bind("load_kg")} />
      <Input inputMode="numeric" placeholder="reps" {...bind("reps")} />
      <Input inputMode="numeric" placeholder="mal /10" {...bind("pain")} />
      <span className={"size-2 rounded-full " + (state === "saved" ? "bg-primary" : state === "error" ? "bg-destructive" : state === "saving" ? "bg-warning" : "bg-border")} />
    </div>
  );
}
