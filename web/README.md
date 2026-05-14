# TaskForge Enterprise — Frontend (`web/`)

This package is the **Next.js 15** client for TaskForge Enterprise: a team task-management UI that talks to the Express API in [`../api/`](../api/) over **REST (JSON + JWT)** and **Socket.IO** for org-scoped chat.

**Full-stack context** (data model, API routes, security, deployment): **[`../README.md`](../README.md)** — treat that document as the source of truth for the monorepo.

---

## What this frontend implements

| Area | Implementation |
|------|------------------|
| **Routing** | **App Router** (`src/app/`): public marketing + auth; nested `/dashboard/*` behind an auth gate |
| **Auth UX** | Register / login; JWT access + refresh in `localStorage` (`tf_access_token`, `tf_refresh_token`); `AuthProvider` wires session + `logout` |
| **API access** | `apiFetch` / `apiJson` inject `Authorization: Bearer`, refresh once on **401**, then retry (`src/lib/api.ts`) |
| **Workspace shell** | `DashboardShell`: sidebar / mobile nav, project selector, logout; **`DashboardProjectProvider`**: loads `/projects`, persists `selectedProjectId` in `localStorage` (`tf_selected_project`) |
| **Tasks & projects** | Overview: project cards, task table, CRUD subset aligned with API roles (`MEMBER` cannot create projects) |
| **Kanban** | **@dnd-kit** — drag tasks across status columns; updates via `PATCH /tasks/:id` |
| **Calendar** | Month grid from task due dates (fallback: created date) |
| **Analytics** | **Recharts** over `GET /analytics/overview` |
| **Notifications** | Inbox + read / read-all against notification endpoints |
| **Chat** | **socket.io-client** singleton (`src/lib/chat-socket.ts`) to `NEXT_PUBLIC_API_URL` + `/socket.io/` with JWT in handshake |
| **Settings** | Display name via `PATCH /users/me` + session refresh |
| **Styling** | **Tailwind CSS** + **Geist** fonts (`src/app/layout.tsx`) |

---

## Technology stack

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 15.3** (App Router) |
| UI | **React 19**, **TypeScript** |
| Styling | **Tailwind CSS 3.4** |
| Drag-and-drop | **@dnd-kit** (core, sortable, utilities) |
| Charts | **Recharts** |
| Realtime | **socket.io-client** |

---

## Source layout

```text
web/
├── README.md                 # This file
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── vercel.json               # Framework hint for Vercel
└── src/
    ├── app/
    │   ├── layout.tsx        # Root layout, fonts, metadata
    │   ├── providers.tsx     # App-level providers (e.g. AuthProvider)
    │   ├── globals.css
    │   ├── page.tsx          # Public landing
    │   ├── login/page.tsx
    │   ├── signup/page.tsx
    │   └── dashboard/
    │       ├── layout.tsx    # DashboardAuth → ProjectProvider → Shell
    │       ├── page.tsx      # Overview
    │       ├── kanban/page.tsx
    │       ├── calendar/page.tsx
    │       ├── analytics/page.tsx
    │       ├── notifications/page.tsx
    │       ├── chat/page.tsx
    │       └── settings/page.tsx
    ├── components/           # dashboard-auth, dashboard-shell
    ├── contexts/             # auth-context, dashboard-project-context
    └── lib/                  # config, auth-storage, api, chat-socket
```

Path alias **`@/`** → `src/` (see `tsconfig.json`).

---

## Configuration

| Variable | Role |
|----------|------|
| `NEXT_PUBLIC_API_URL` | Public API origin **without** trailing slash. Default in code: `http://localhost:4000` when unset (`src/lib/config.ts`). Copy from [`.env.example`](./.env.example) to `.env.local` for overrides. |

Production CORS / Socket.IO require the API’s `WEB_ORIGIN` to match this app’s browser origin — see **[`../README.md` §11–19](../README.md#11-environment-variables)**.

---

## Local development

From the **repository root**:

```bash
npm install
cp api/.env.example api/.env
# edit api/.env — JWT secrets; optional: cp web/.env.example web/.env.local
cd api && npx prisma db push && npx prisma db seed && cd ..
npm run dev
```

- **Web:** http://localhost:3000  
- **API:** http://localhost:4000  

### Package-only commands

```bash
npm run build -w web
npm run lint -w web
```

---

## Deployment (Vercel)

1. Import the monorepo; set **Root Directory** to `web`.  
2. Set **`NEXT_PUBLIC_API_URL`** to your deployed API origin (no trailing slash).  
3. On the API host, set **`WEB_ORIGIN`** to the exact Vercel production URL (scheme + host only).

Step-by-step checklist: **[`../README.md` §19.3](../README.md#193-web-on-vercel-step-by-step)** · [Next.js deploying](https://nextjs.org/docs/app/building-your-application/deploying).

---

## Related documentation

| Document | Contents |
|----------|----------|
| [`../README.md`](../README.md) | Monorepo overview, live demo, Prisma model, HTTP API (**§14**), backend implementation (**§7**), auth (**§9**), Socket.IO (**§10**), env vars, troubleshooting, deployment |
| [`../api/`](../api/) | Express + Prisma source; no separate `README` — use root README for API behavior |
