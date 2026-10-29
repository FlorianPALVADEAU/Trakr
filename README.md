# Trakr

Coaching privé : séance du jour, saisie des séries au pouce, récupération Garmin, mensurations, plan long terme.

**Stack** : Next.js 15 (App Router) · TypeScript · Tailwind v4 · shadcn/ui (composants dans `src/components/ui`) · Supabase (Postgres + Auth Google + RLS) · Effect (requêtes typées) · PWA mobile-first · Vercel.

## Démarrage
```bash
cp .env.example .env.local   # renseigner URL + clés Supabase
npm i && npm run dev
```

## Base de données
Les migrations sont dans `supabase/migrations`. Application : SQL Editor Supabase, ou `supabase db push`.
Toutes les tables ont une RLS (`user_id = auth.uid()`).

## Auth Google
Supabase → Authentication → Providers → Google (Client ID/Secret depuis Google Cloud).
Redirect URI Google : `https://<project-ref>.supabase.co/auth/v1/callback`.
Supabase → URL Configuration : Site URL = domaine Vercel, Redirect URLs = `https://<domaine>/auth/callback` et `http://localhost:3000/auth/callback`.

## Import des données existantes
Après la première connexion Google :
```bash
node --env-file=.env.local scripts/seed.mjs ton@gmail.com ~/Knowledge/05-Areas/Fitness/Coaching/data
```

## Garmin
`garmin_sync.py` (Mac, launchd) écrit les CSV ; `scripts/garmin_push.py` les envoie ensuite à Supabase
(variables : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TRAKR_USER_ID`, `TRAKR_DATA_DIR`).
