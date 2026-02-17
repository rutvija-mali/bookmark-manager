## Bookmark App (Supabase + Next.js)

This is a small bookmark manager built for the Abstrabit assignment. Users sign in with **Google only**, and can create, list, edit, and delete their own private bookmarks. The bookmark table updates in real-time across open tabs.

### Tech stack

- **Framework**: Next.js App Router (`src/app`)
- **Auth & Database**: Supabase (Google OAuth, Postgres, Realtime)
- **Styling**: Tailwind CSS (v4, via `@tailwindcss/postcss`)

### Running the project locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

### Supabase & Google OAuth setup (short)

1. **Create a Supabase project** and a table called `bookmarks` with columns:
   - `id` (uuid, primary key, default `uuid_generate_v4()`)
   - `user_id` (uuid, references `auth.users.id`)
   - `title` (text)
   - `url` (text)
   - `created_at` (timestamp with time zone, default `now()`)
2. **Enable Google provider** in Supabase Auth and configure the OAuth redirect URL to:
   - `https://your-vercel-domain.vercel.app/auth/callback` (for production)
   - `http://localhost:3000/auth/callback` (for local dev)
3. **Set environment variables** (locally in `.env.local` and on Vercel):
   - `NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>`

The Google OAuth + Supabase wiring for this app was implemented by following a Supabase/Next.js OAuth tutorial and then adapting it to match the assignment requirements.

### Problem faced – realtime updates

- **Problem**: Realtime updates were not working consistently; the UI didn’t update reliably when switching tabs or navigating between pages.
- **Cause**: Supabase realtime subscriptions were not cleaned up, which could leave duplicate or stale listeners active.
- **Solution**: Added a cleanup function in `useEffect` on the dashboard page to remove the channel with `supabase.removeChannel(channel)` when the component unmounts, so there is always a single, fresh subscription.

### Deployment

The app is intended to be deployed on **Vercel**. After setting the environment variables there, a `git push` to the main branch will trigger a build and you can use the provided Vercel URL as the live demo link.
