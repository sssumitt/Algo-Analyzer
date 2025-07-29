Algo Analyzer
AI-powered dashboard that helps you paste your own LeetCode / HackerRank solutions, get an instant Big-O analysis, store the results, and review them later – all in a sleek dark UI.

Tech	Details
Framework	Next.js 15 (App Router, React 18, TypeScript)
Styling	Tailwind + Chakra UI (dark-theme only)
DB	PostgreSQL (Prisma ORM)
Auth	next-auth (Credentials + Google OAuth)
AI	Google Gemini 2.5 Pro
Package mgr	pnpm
Deployment	Vercel + Neon Postgres (serverless)

<br/>
✨ Features
Upload a problem URL + your solution code

Gemini returns

json
Copy
Edit
{
  "name":        "Two Sum",
  "pseudoCode":  ["function twoSum(nums, target)…", …],
  "time":        "O(N)",
  "space":       "O(1)",
  "tags":        ["Array", "Hash Table"],
  "difficulty":  "Easy"
}
Stores the snapshot in Postgres (history kept)

Repository page groups by Domain / Key Algorithm and shows pretty cards

Google / email-password sign-in

Responsive dark UI

<br/>
🔧 Local development
bash
Copy
Edit
# 1. clone & install
git clone https://github.com/<you>/algo-analyzer.git
cd algo-analyzer
pnpm install

# 2. copy ENV template and fill in secrets
cp .env.example .env.local

# 3. DB: run migrations & generate Prisma client
pnpm prisma:migrate      # wrapper for `prisma migrate dev`

# 4. dev server
pnpm dev                 # http://localhost:3000
.env.local template
env
Copy
Edit
DATABASE_URL="postgresql://user:pass@localhost:5432/algo"
NEXTAUTH_SECRET="set-a-long-random-string"
GEMINI_API_KEY="AIza...your...key"

# Google OAuth
GOOGLE_CLIENT_ID="123.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="abc123"
Tip: for local DB use docker compose up -d with the provided file, or point
to your own Postgres instance.

Useful scripts
Script	What it does
pnpm dev	Next.js dev server + HMR
pnpm build	prisma migrate deploy && next build
pnpm prisma:migrate	Runs prisma migrate dev
pnpm prisma:studio	Opens Prisma Studio GUI
pnpm lint	Next.js ESLint + Type Checks

<br/>
🚀 Deploying to Vercel
Import the repo → Vercel dashboard

Build Command

bash
Copy
Edit
pnpm prisma:deploy && pnpm build
prisma:deploy is just prisma migrate deploy.

Leave Output Directory blank (Next.js default).

Install Command → pnpm install --frozen-lockfile (or leave blank).

Add the environment variables in Settings → Environment (Production & Preview).

Provision a Serverless Postgres on Vercel Storage or paste an external DATABASE_URL.

Every push to main triggers a production deploy; PR branches get preview URLs.

<br/>
🗂 Project structure (simplified)
css
Copy
Edit
src/
 ├ app/
 │  ├ (protected)/
 │  │   ├ dashboard/                 – secured dashboard
 │  │   └ repository/[domain]/[algo] – cards grid
 │  ├ api/
 │  │   ├ analyze/route.ts           – Gemini + Prisma logic
 │  │   └ auth/[...nextauth]/route.ts
 │  ├ components/
 │  │   ├ ProblemCard.tsx
 │  │   ├ Navbar.tsx / Footer.tsx
 │  │   └ ...
 │  └ sections/                      – landing-page sections
 ├ lib/
 │  ├ prisma.ts  – singleton client
 │  └ authOptions.ts
 └ prisma/
    ├ schema.prisma
    └ migrations/
<br/>
🪪 License
MIT – do whatever, just give credit.

