"use client";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function Login() {
  const signIn = () =>
    createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-8 px-6">
      <div>
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-3xl font-black text-primary-foreground">T</div>
        <h1 className="text-5xl font-black tracking-tight">Trakr</h1>
        <p className="mt-2 text-muted-foreground">Ta séance du jour, ta récupération, ta progression. Rien d&apos;autre.</p>
      </div>
      <Button size="lg" onClick={signIn}>Continuer avec Google</Button>
    </main>
  );
}
