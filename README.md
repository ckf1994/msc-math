# MSC Math

Math learning platform for Munsang College (F.1–F.6), built with Next.js and Supabase.

## What's included now

- Next.js 16 + Tailwind + TypeScript foundation
- School Google login hook + password test accounts
- Role-based student / teacher / admin areas
- Admin tools:
  - users & classes
  - question bank with image upload
  - quizzes, homework, mini games
  - badges with image upload
- Teacher tools:
  - class roster view
  - assignment creation
  - assignment analytics
- Student tools:
  - assignments
  - practice generator
  - instant quiz generator
  - mini games
  - results, report, leaderboard, badges

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy `.env.local.example` → `.env.local` and add your URL + anon key

### 3. Run database migrations

In Supabase Dashboard → **SQL Editor**, run in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_question_assets_storage.sql`
3. `supabase/migrations/003_optional_question_metadata.sql`
4. `supabase/migrations/004_badge_assets_storage.sql`
5. `supabase/seed.sql`

### 4. Create test accounts

In Supabase Dashboard → **Authentication** → **Users** → **Add user**:

| Email | Password | Role (set in step 5) |
|-------|----------|----------------------|
| `admin@test.msc.edu.hk` | choose a password | admin |
| `teacher@test.msc.edu.hk` | choose a password | teacher |
| `student@test.msc.edu.hk` | choose a password | student |

Then run this SQL (profiles are auto-created on signup):

```sql
update public.profiles set role = 'admin', is_test_account = true, full_name = 'Test Admin'
  where email = 'admin@test.msc.edu.hk';

update public.profiles set role = 'teacher', is_test_account = true, full_name = 'Test Teacher'
  where email = 'teacher@test.msc.edu.hk';

update public.profiles set role = 'student', is_test_account = true, full_name = 'Test Student'
  where email = 'student@test.msc.edu.hk';

insert into public.class_members (class_id, user_id, role_in_class)
select c.id, p.id, 'teacher'
from public.classes c, public.profiles p
where c.name = '1A' and p.email = 'teacher@test.msc.edu.hk';

insert into public.class_members (class_id, user_id, role_in_class)
select c.id, p.id, 'student'
from public.classes c, public.profiles p
where c.name = '1A' and p.email = 'student@test.msc.edu.hk';
```

### 5. (Later) Enable Google SSO

Ask school IT to create a Google OAuth client (Internal, `@msc.edu.hk` only) and add credentials in:

**Supabase → Authentication → Providers → Google**

Redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build roadmap status

| Section | Scope |
|---------|-------|
| **1** ✅ | Foundation, auth, login, DB schema |
| **2** ✅ | App shell (nav, sidebar), loading quotes from DB |
| **3** ✅ | Admin: users & classes |
| **4** ✅ | Admin: question bank |
| **5** ✅ | Admin: quizzes, games, badges |
| **6** ✅ | Teacher: assign work, analytics |
| **7** ✅ | Student: practice, assignments, instant quiz |
| **8** ✅ | Gamification: streaks, leaderboards, badges |
| **9** ✅ | Reports & analytics |
| **10** ✅ | Deploy prep via GitHub + Vercel checklist |

## Deploy to Vercel

1. Push this repo to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Update Supabase Auth redirect URLs to include your Vercel domain

### Recommended deployment checklist

1. Create a GitHub repository named `msc-math`
2. Push the local project:

```bash
git init
git add .
git commit -m "Initial MSC Math platform"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

3. In Vercel:
   - Import the GitHub repo
   - Framework preset should auto-detect as `Next.js`
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. In Supabase Authentication settings:
   - add your Vercel URL to **Site URL**
   - add redirect URLs for:
     - `https://<your-vercel-domain>/auth/callback`
     - `http://localhost:3000/auth/callback`
5. In Supabase Google provider settings later:
   - keep redirect URI:
     - `https://<your-project>.supabase.co/auth/v1/callback`

### Before first public deploy

- Run all SQL migration files
- Create the three test accounts
- Verify admin image uploads for questions and badges
- Verify at least one quiz, one game, and one assignment flow
- Confirm your school IT will provide Google OAuth credentials later
