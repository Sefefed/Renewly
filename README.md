# 📊 Renewly — Smart Finance & AI Copilot

Renewly is a full‑stack web platform that helps teams keep recurring software and finance subscriptions under control **with an embedded AI copilot**. Alongside the polished landing page, production-ready authentication, and modular analytics dashboard, Renewly now streams AI-generated briefings for every subscription and bill through a pluggable LLM provider (hosted AI service by default) with graceful fallbacks when an external model is unavailable.

---

## ✨ Features

- Elegant hero experience with animated CTAs and responsive background imagery
- Email/password authentication with protected routes and persistent sessions
- Context-driven auth state (React context + localStorage sync)
- Modular dashboard with reusable cards (KPIs, comparisons, recommendations, quick actions)
- Interactive spending visualizations (line + doughnut charts) with time-range filters
- **AI command center** that streams conversational guidance, action plans, and follow-up prompts
- Predictive alerts that hand off directly to the AI assistant for deeper guidance
- AI-powered briefings for subscription and bill detail pages (with typing animation + rotating analysis angles)
- Enhanced insights API aggregating subscriptions, bills, and budgets
- Refreshed notification center with light styling and contextual actions
- Structured backend with JWT, MongoDB, modular controllers, and a configurable LLM provider
- Ready-to-extend services/hooks for APIs, automation, analytics, and AI experimentation

---

## 🚀 Tech Stack

**Frontend**

- React + Vite
- React Router
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- Context API (for auth state)
- Chart.js + react-chartjs-2 for data visualization
- PropTypes for runtime contracts
- AI-ready hooks (`useAiBriefing`, `useSubscriptionDetails`, `useBillDetails`) and modular prompt builders for streaming briefings

**Backend**

- Node.js (ESM) + Express
- MongoDB & Mongoose
- JWT authentication
- Nodemailer (email workflows)
- dotenv-based configuration
- Pluggable LLM provider (default AI service configurable via environment) with structured fallback builders

---

## 📂 Directory Layout

```text
renewly/
├─ client/                         # React frontend (Vite + Tailwind)
│  ├─ package.json
│  └─ src/
│     ├─ components/
│     │  ├─ Charts/                # Shared chart wrappers (Line, Pie, etc.)
│     │  ├─ dashboard/             # Modular dashboard cards & header
│     │  └─ Navigation.jsx
│     ├─ contexts/                 # AuthProvider and related hooks
│     ├─ hooks/                    # Shared hooks (AI briefing, currency, insights)
│     ├─ pages/                    # Landing, auth, dashboard, settings, ...
│     │  ├─ subscriptions/         # Modular detail view + AI prompts/metrics/risk calc
│     │  └─ bills/                 # Modular detail view + AI prompts/timelines/risk calc
│     ├─ routes/                   # Application routing
│     ├─ styles/                   # Tailwind entry points & extras
│     ├─ utils/                    # API client, formatters, error helpers
│     ├─ services/                 # External integrations (placeholder)
│     ├─ App.jsx
│     ├─ index.css
│     └─ main.jsx
│
├─ server/                         # Node/Express backend
│  ├─ package.json
│  └─ src/
│     ├─ app.js
│     ├─ config/                   # env, email, queue, and third-party wiring
│     ├─ controllers/              # auth, bill, budget, calendar, insights, subscription, user, workflow
│     ├─ database/                 # Mongo connection helpers
│     ├─ middleware/               # Arcjet, auth, error handling
│     ├─ models/                   # action, bill, budget, subscription, user schemas
│     ├─ routes/                   # REST routers (incl. /api/v1/insights/enhanced)
│     ├─ services/
│     │  └─ assistant/             # Financial assistant orchestration + LLM providers
│     └─ utils/                    # email templating helpers
│
└─ README.md
```

---

## ⚙️ Getting Started

### 1. Backend API

```bash
cd server
npm install
```

Create `server/.env.development.local` (or `.env`) with:

```env
PORT=3000
NODE_ENV=development
DB_URI=mongodb://localhost:27017/renewly
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
SERVER_URL=http://localhost:3000
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-app-password
GEMINI_API_KEY=your-google-generative-ai-key
LLM_PROVIDER=gemini
AI_ASSISTANT_MODEL=gemini-2.5-pro
```

Run the API:

```bash
npm run dev
```

Health check:

```
GET http://localhost:3000/ → "Welcome to the Renewly API!"
```

Base routes (see `server/src/app.js`):

| Feature       | Path                               | AI Surface                            |
| ------------- | ---------------------------------- | ------------------------------------- |
| Auth          | `/api/v1/auth`                     | –                                     |
| Users         | `/api/v1/users`                    | –                                     |
| Subscriptions | `/api/v1/subscriptions`            | ✅ contextual briefings + risk scores |
| Bills         | `/api/v1/bills`                    | ✅ urgency guidance + automation tips |
| Budgets       | `/api/v1/budgets`                  | –                                     |
| Insights      | `/api/v1/insights` (+ `/enhanced`) | ✅ feeds dashboard & prompt seeds     |
| Calendar      | `/api/v1/calendar`                 | –                                     |
| Workflows     | `/api/v1/workflows`                | –                                     |
| Assistant     | `/api/v1/assistant/query`          | ✅ Gemini / fallback responses        |

The backend permits `http://localhost:5173` for local development CORS.

### 2. Frontend App

```bash
cd client
npm install
```

Create `client/.env.development` with:

```env
VITE_API_URL=http://localhost:3000
```

Start the Vite dev server:

```bash
npm run dev
```

Open http://localhost:5173 to access the UI.

Available routes:

- `/` — landing experience (public)
- `/signin`, `/signup` — auth flows (public)
- `/dashboard` — protected (requires auth context state)

---

## 🧭 System Blueprint

| Layer         | Highlights                                                                                                                                                                                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Client**    | React + Vite SPA with Tailwind design tokens, dark/light-aware components, and modular feature folders. Detail pages now rely on `useSubscriptionDetails`, `useBillDetails`, and `useAiBriefing` to unify data fetching, risk scoring, prompt generation, typing effects, and refresh cycles.         |
| **Server**    | Express API in ESM mode with MongoDB/Mongoose, JWT auth, and service-driven controllers across auth, subscriptions, bills, budgets, insights, workflows, notifications, and assistant interactions. The assistant service wraps a pluggable `GeminiProvider` with structured fallback builders.       |
| **Data Flow** | Insights endpoints aggregate subscription + billing data, hydrate chart-ready payloads, and feed the dashboard via `useSmartInsights`/`useDashboardInsights`. Page utilities assemble prompts, post them to `/api/v1/assistant/query`, and render streaming replies or fallback narratives instantly. |

### Dashboard Experience

- **Enhanced Insights API** — `GET /api/v1/insights/enhanced?timeRange=monthly|quarterly|yearly`
  - Provides spending trend aggregates, category breakdown (percentage + currency), month-over-month deltas, and anomaly clusters
  - Backed by indexed Mongo queries with caching-friendly projections
- **Modular cards** (KPIs, Smart Recommendations, Habits, Renewal Clusters, Quick Actions) surface insights in reusable layouts
- **Analytics surface**
  - Tabbed charts (spending, categories, forecast, anomalies, savings) with drilldown modals
  - Timeframe controls with optimistic refresh and loading skeletons
- **Predictive alerts**
  - Each alert badge highlights priority (high/medium/low) with tone-matched color tokens
  - “View details” now launches the AI assistant with a pre-filled prompt describing the alert, reducing investigation time
- **Notification center**
  - Light-themed sliding panel with bulk actions, pagination, and stateful loading indicators
  - Designed for future deep links into subscriptions/budgets without altering the assistant focus

### AI Assistant Handoff

```
PredictiveAlerts → AnalyticsDashboard → DashboardMainGrid → Dashboard → FinancialAssistant
```

- Alerts invoke `onViewDetails` → queue a prompt → open the assistant panel automatically
- `FinancialAssistant` consumes queued prompts once, pushes them through `useAssistantConversation`, and renders the response with playback-ready speech
- Speech module narrates the latest assistant reply unless muted, maintaining accessibility for hands-free review
- Proactive insights widget (`ProactiveInsights`) also feeds alert counts into assistant unread badges to signal new guidance
- Detail page briefings reuse the assistant infrastructure through `useAiBriefing`, so subscriptions and bills inherit streaming narratives, rotating lenses, and risk callouts.

---

## 🤖 AI Integration Deep Dive

| Layer                  | What changed                                                                                                                                                           | Why it matters                                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Frontend hooks**     | Added `useAiBriefing`, `useSubscriptionDetails`, and `useBillDetails` to consolidate data loading, pricing math, risk scoring, and AI orchestration.                   | Keeps `SubscriptionDetails.jsx` and `BillDetails.jsx` lightweight while making AI briefings reusable for future entities. |
| **Prompt utilities**   | Dedicated builders in `client/src/pages/*/utils/prompts.js` plus angle constants to rotate perspectives (renewal runway, cash-flow impact, compliance controls, etc.). | Ensures AI conversations stay consistent and editable without touching UI components.                                     |
| **LLM provider**       | `server/src/services/assistant/llmProvider.js` now delegates to `GeminiProvider` and rich fallback builders.                                                           | Swapping to another vendor becomes a one-file change, and the assistant still responds when the provider is offline.      |
| **Fallback responses** | Structured narratives for subscriptions and bills that mirror AI tone when no external response is available.                                                          | Guarantees the AI panel always returns actionable guidance instead of silent failures.                                    |
| **Environment config** | Introduced `GEMINI_API_KEY`, `LLM_PROVIDER`, `AI_ASSISTANT_MODEL` in `.env`.                                                                                           | Keeps credentials and model selection per environment, enabling rapid experimentation.                                    |

### Quickstart: Running the AI Copilot Locally

1. Request a Google Generative AI key and save it as `GEMINI_API_KEY` in `server/.env.development.local`.
2. Optionally adjust `AI_ASSISTANT_MODEL` (defaults to `gemini-2.5-pro`) or point `LLM_PROVIDER` at a custom factory.
3. Start the backend (`npm run dev` inside `server/`) and the frontend (`npm run dev` inside `client/`).
4. Open any subscription or bill detail page—an AI briefing should stream within seconds, complete with rotating analysis lens badges.

If the key is missing or the upstream model times out, the fallback builders deliver detailed narratives, so the UX remains coherent.

---

## 🔐 Authentication Flow

- **Sign Up** — `POST ${VITE_API_URL}/api/v1/auth/signup`
- **Sign In** — `POST ${VITE_API_URL}/api/v1/auth/signin`
- On success, `{ token, user }` are persisted to `localStorage` and the app redirects to the dashboard.

Auth data is injected into the component tree via `AuthProvider`, making it easy to guard routes and access the current user.

---

## 🛠️ Development Tips

- Backend environment loader (`server/src/config/env.js`) resolves `.env.<NODE_ENV>.local` automatically.
- Global Tailwind styles live in `client/src/styles/global.css`; `client/src/index.css` simply re-exports the file for Vite.
- Custom component layers (e.g. landing page animations) can live beside features under `client/src/styles/`.
- Default ports:
  - API — http://localhost:3000
  - Client — http://localhost:5173
- To swap LLM vendors, add a factory under `server/src/services/assistant/llm/`, register it in `llmProvider.js`, and set `LLM_PROVIDER=<your-key>` in the environment.

---

## 🗺️ Roadmap

- ✅ Enhanced insights API + dashboard visualizations (spending trends, categories, comparisons)
- ✅ AI-powered subscription & bill briefings with modular hooks and prompt tooling
- ✅ Gemini-backed LLM provider with structured fallback copy
- 🔄 Subscription CRUD with billing schedule metadata & reminders
- 🔄 Budgets, limits, and proactive alerts
- 🔄 Calendar view + exportable email/SMS reminders
- 🔄 Typed API client (axios or fetch wrappers) with retry/refresh logic
- 🔄 Comprehensive test coverage (unit, integration, E2E)

---

## 🤝 Contributing

We welcome ideas! Open an issue with your feature request or bug report, or submit a PR following the structure above. Feel free to fork the repo and tailor Renewly to your stack.

---

Happy building! 🚀
