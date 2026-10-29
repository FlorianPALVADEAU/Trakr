import { Data, Effect } from "effect";
import type { PostgrestError } from "@supabase/supabase-js";

/** Typed error for any failed Supabase call. */
export class DbError extends Data.TaggedError("DbError")<{ message: string; code?: string }> {}

/** Wrap a Supabase query in an Effect: failures become typed DbError, data is non-null. */
export const query = <T>(
  run: () => PromiseLike<{ data: T | null; error: PostgrestError | null }>,
): Effect.Effect<T, DbError> =>
  Effect.tryPromise({
    try: async () => {
      const { data, error } = await run();
      if (error) throw error;
      return data as T;
    },
    catch: (e) => {
      const err = e as Partial<PostgrestError>;
      return new DbError({ message: err.message ?? "Database error", code: err.code });
    },
  });

/** Run an effect on the server and fall back to a value when it fails (UI never crashes on a query). */
export const runOr = <A, E>(eff: Effect.Effect<A, E>, fallback: A) =>
  Effect.runPromise(eff.pipe(Effect.orElseSucceed(() => fallback)));
