# Video recording guide — TaskForge Enterprise (full project walkthrough)

Use this document while recording. Target length: **12–20 minutes** (portfolio) or **25–35 minutes** (deep technical). Adjust pace: **slow scroll**, **pause on code** for 2–3 seconds when showing files.

---

## 0. Before you record

| Check | Why |
|-------|-----|
| `npm run dev` — web + API both green | No “failed to fetch” on camera |
| Demo seed done (`npx prisma db seed` in `api`) | Admin/member login works |
| Browser zoom **100%**, resolution **1920×1080** or **1440×900** | Readable text in video |
| Close extra tabs; use **Incognito** once for “fresh login” demo | Cleaner story |
| **Mic test** 10 seconds; reduce room echo | Professional audio |
| Optional: **OBS** or **Win+G** Xbox Game Bar** screen record | |

**Opening line (example):**  
“Hi, I’m [name]. This is **TaskForge Enterprise** — a full-stack team task manager I built with Next.js, Express, Prisma, JWT auth, and realtime chat. I’ll walk architecture, features, and how everything connects.”

---

## 1. Suggested chapter structure (with rough timestamps)

| Time (approx) | Chapter | What viewer sees |
|----------------|---------|-------------------|
| 0:00–0:45 | **Hook + who you are** | Your face OR full-screen landing |
| 0:45–2:30 | **Problem & product pitch** | Landing scroll — hero, features, CTA |
| 2:30–4:30 | **High-level architecture** | README diagram OR simple whiteboard / Excalidraw slide |
| 4:30–6:00 | **Repo & monorepo** | VS Code: root `package.json` workspaces, `web/` vs `api/` |
| 6:00–8:30 | **Database & Prisma** | `api/prisma/schema.prisma` — User, Org, Project, Task, enums |
| 8:30–11:00 | **Backend: API + security** | `api/src/index.ts` — helmet, cors, routes; quick `routes/` folder |
| 11:00–13:00 | **Auth flow** | `auth.ts` / login in browser — tokens, `/auth/me` (Network tab optional) |
| 13:00–17:00 | **Dashboard live demo** | Sidebar: Overview → Kanban → Calendar → Analytics → Notifications → Chat → Settings |
| 17:00–18:30 | **Realtime** | Two windows side-by-side OR two browsers — chat message appears |
| 18:30–20:00 | **Deploy story** | README Vercel + API section OR Vercel dashboard screenshot |
| 20:00–20:45 | **Roadmap + close** | README roadmap; “thanks + GitHub link + LinkedIn” |

---

## 2. Detailed talking points (what to *say*)

### Chapter A — Hook (first 30–45 seconds)

**Points:**

- One line: **what** it is (team tasks + projects + org-scoped data).  
- One line: **why** it matters (portfolio shows full-stack + SaaS thinking, not a todo tutorial).  
- One line: **how** you’ll structure the video (architecture → code → live demo → deploy).

**Avoid:** long self-intro; jump to product in **15 seconds**.

---

### Chapter B — Product pitch on the landing (`/`)

**On screen:** Scroll slowly through landing — header, hero, stat strip, feature bento, stack pills, bottom CTA.

**Say:**

- “This is the **marketing surface** — glass-style dark UI, built with **Tailwind** in **Next.js 15 App Router**.”  
- “The hero explains the **value proposition**: one place for projects, tasks, and velocity.”  
- “These blocks map to **real modules** in the repo — Kanban, analytics, chat — not placeholder text only.”  
- “**Try demo** links go to auto-login so recruiters can enter the app in one click after clone.”

**Technical flex (one sentence):**  
“SSR-friendly public routes; authenticated area is under `/dashboard` with a client-side auth gate.”

---

### Chapter C — Architecture (2–3 minutes)

**On screen:** Either:

- README **Mermaid diagram** section, OR  
- A simple slide: `Browser → Next.js` | `Browser → Express API` | `API → Prisma → DB` | `Socket.IO same server`.

**Say:**

- “**Split stack**: **Next.js** for UI; **Express** for REST + **Socket.IO** on the **same Node HTTP server** — so one API port for both JSON and websockets.”  
- “**Prisma** is the single data access layer — schema-first, type-safe queries.”  
- “**JWT access + refresh** — access short-lived, refresh for silent renew; web client retries after 401.”  
- “**CORS**: production uses `WEB_ORIGIN`; dev allows localhost / 127.0.0.1 for convenience.”

**If interviewer-style:**  
“Trade-off: tokens in **localStorage** for speed; production would move toward **httpOnly cookies** or a BFF.”

---

### Chapter D — Monorepo & folders (1.5–2 minutes)

**On screen:** VS Code tree — expand `web/src/app`, `api/src/routes`, `api/prisma`.

**Say:**

- “**npm workspaces** — `npm run dev` runs **web** and **api** in parallel via `npm-run-all`.”  
- “`web/src/app` — **App Router**: `layout.tsx` wraps **AuthProvider**; `dashboard/layout` adds **project context** and **shell**.”  
- “`api/src` — Express routers per domain: `auth`, `projects`, `tasks`, `notifications`, `analytics`, `users`; `socket.ts` for chat.”

---

### Chapter E — Data model (2–3 minutes)

**On screen:** `api/prisma/schema.prisma` — scroll enums, then `User` → `Organization` → `Project` → `ProjectMember` → `Task` → `Notification`.

**Say:**

- “**Roles** enum — SUPER_ADMIN through MEMBER; seed uses PROJECT_ADMIN and MEMBER for demos.”  
- “**Organization** is the workspace; users get `organizationId`.”  
- “**Project** belongs to org; **ProjectMember** is M2M — access control checks admin OR membership.”  
- “**Task** has status, priority, optional assignee, JSON fields reserved for future comments/attachments.”  
- “**SQLite** locally for zero-config; **PostgreSQL** one env + provider flip for production — documented in README.”

---

### Chapter F — Backend deep dive (selective, 2–3 minutes)

**On screen:** `api/src/index.ts` (createServer + routes + attachSocketIO), then one route file e.g. `routes/tasks.ts` (PATCH + auth).

**Say:**

- “**Middleware chain**: Helmet, CORS, JSON limit, rate limit — baseline production hygiene.”  
- “**Zod** validates bodies — fewer 500s from bad input.”  
- “**Tasks** list requires `projectId`; **PATCH** checks `getProjectForUser` so you can’t mutate another org’s tasks.”  
- “**Analytics** aggregates only over **accessible project IDs** — same rule as list endpoints.”

---

### Chapter G — Frontend auth & API client (2 minutes)

**On screen:** `web/src/contexts/auth-context.tsx` (brief), `web/src/lib/api.ts` (refresh on 401), then `/login` in browser.

**Say:**

- “**AuthProvider** hydrates session from `localStorage`, calls `/auth/me` on load.”  
- “**apiFetch** attaches Bearer token; on **401** calls refresh once then retries — better UX than hard logout on every expiry.”  
- “**Login / signup** forms; **demo query params** for one-click portfolio demos.”

---

### Chapter H — Live dashboard walkthrough (core of video, 5–8 minutes)

**On screen:** Log in as **admin@demo.com** (demo button or form). Then go through **each sidebar item slowly**.

| Page | Show | Say (essence) |
|------|------|----------------|
| **Overview** | Project cards, create task, change status in table | “CRUD slice + table UX; project picker in header is **shared state** + `localStorage`.” |
| **Kanban** | Drag card to another column | “**DnD Kit**; drop triggers **PATCH** task status; list refetches.” |
| **Calendar** | Change month, point at days with tasks | “**Custom month grid** — due date or created date; no extra calendar dependency.” |
| **Analytics** | Bar + pie | “**Recharts**; numbers from **`/analytics/overview`** — server-side aggregation, not fake client-only charts.” |
| **Notifications** | List, mark read, mark all | “Backed by **Prisma Notification** model; matches task assignment story.” |
| **Chat** | Type message | “**Socket.IO**; JWT in handshake; **org-scoped room**; history in memory for demo.” |
| **Settings** | Change display name, show header updating | “**PATCH /users/me** then refresh session — proves authenticated mutations.” |

**Optional wow moment:** Open **second browser** (or incognito) as **member**, send chat — first window shows message in realtime.

---

### Chapter I — Deploy & production awareness (1.5–2 minutes)

**On screen:** README “Vercel” + “Railway/API” sections OR your real Vercel project page (blur secrets).

**Say:**

- “**Vercel** hosts the **Next.js** app; **Root Directory = `web`**.”  
- “**API** needs its own host because Express + long-lived WebSockets don’t map to pure serverless the same way.”  
- “**`NEXT_PUBLIC_API_URL`** points the browser to production API; **`WEB_ORIGIN`** on API must match the Vercel URL for CORS.”  
- “Production DB = **Postgres** + `prisma migrate deploy`.”

---

### Chapter J — Closing (30–45 seconds)

**Say:**

- One sentence: **hardest part** (e.g. “Socket auth + CORS + monorepo wiring”) or **what you learned**.  
- One sentence: **next steps** (OAuth, email queue, httpOnly cookies).  
- **CTA:** “Repo link in description — clone, `npm install`, `npm run dev`, seed, try demo.”  
- Thank you + **subscribe / connect** if YouTube/portfolio channel.

---

## 3. B-roll / cutaway ideas (optional)

- Terminal: `npm run build -w web` success line.  
- Prisma Studio: `npx prisma studio` — quick table peek (10 sec).  
- Network tab: single `GET /projects` 200 with JSON (blur tokens).

---

## 4. If you get nervous — minimal “must say” list

1. Monorepo: Next + Express.  
2. Prisma schema: org → project → task.  
3. JWT + refresh; protected dashboard.  
4. Features: Kanban, calendar, analytics, notifications, chat, settings.  
5. Realtime: Socket.IO + org room.  
6. Deploy: Vercel (web) + separate API + Postgres.

---

## 5. Thumbnail / title ideas (YouTube)

**Titles (pick one):**

- “I Built a Jira-Style Task Manager | Next.js + Express + Prisma + Socket.IO”  
- “Full-Stack SaaS in One Repo | Task Manager with Kanban + Realtime Chat”  

**Thumbnail text:** “FULL STACK” + “NEXT + NODE” + screenshot of Kanban or dashboard.

---

*Good luck with the recording — clarity beats length.*
