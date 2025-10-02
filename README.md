# 📊 Renewly — Smart Finance Tracker

Renewly is a full‑stack web platform that helps teams keep recurring software and finance subscriptions under control. It now ships with a polished landing page, production-ready authentication, and a modular insights dashboard powered by real subscription and billing analytics.

---

## ✨ Features

- Elegant hero experience with animated CTAs and responsive background imagery
- Email/password authentication with protected routes and persistent sessions
- Context-driven auth state (React context + localStorage sync)
- Modular dashboard with reusable cards (KPIs, comparisons, recommendations, quick actions)
- Interactive spending visualizations (line + doughnut charts) with time-range filters
- Predictive alerts that can be handed off directly to the AI assistant for deeper guidance
- Enhanced insights API aggregating subscriptions, bills, and budgets
- Refreshed notification center with light styling and contextual actions
- Structured backend with JWT, MongoDB, and modular controllers
- Ready-to-extend services/hooks for APIs, automation, and analytics

---

## 🚀 Tech Stack

**Frontend**

- React + Vite
- React Router
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- Context API (for auth state)
- Chart.js + react-chartjs-2 for data visualization
- PropTypes for runtime contracts

**Backend**

- Node.js (ESM) + Express
- MongoDB & Mongoose
- JWT authentication
- Nodemailer (email workflows)
- dotenv-based configuration

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
│     ├─ pages/                    # Landing, auth, dashboard, settings, ...
│     ├─ routes/                   # Application routing
│     ├─ styles/                   # Tailwind entry points & extras
│     ├─ utils/                    # API client, formatters, error helpers
│     ├─ hooks/                    # Custom React hooks (future expansion)
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

| Feature       | Path                               |
| ------------- | ---------------------------------- |
| Auth          | `/api/v1/auth`                     |
| Users         | `/api/v1/users`                    |
| Subscriptions | `/api/v1/subscriptions`            |
| Bills         | `/api/v1/bills`                    |
| Budgets       | `/api/v1/budgets`                  |
| Insights      | `/api/v1/insights` (+ `/enhanced`) |
| Calendar      | `/api/v1/calendar`                 |
| Workflows     | `/api/v1/workflows`                |

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

| Layer        | Highlights |
| ------------ | ---------- |
| **Client**   | React + Vite SPA with Tailwind design tokens, dark/light-aware components, and modular feature folders. Key bundles include `dashboard/` for analytics, `assistant/` for conversational UI, `Notifications/` for the command center, and shared utilities (`contexts`, `hooks`, `utils`). |
| **Server**   | Express API in ESM mode with MongoDB/Mongoose, JWT auth, and service-driven controllers across auth, subscriptions, bills, budgets, insights, workflows, notifications, and assistant interactions. Configuration is centralized under `src/config/` with per-environment loaders. |
| **Data Flow**| Insights endpoints aggregate subscription + billing data, hydrate chart-ready payloads, and feed the dashboard via `useSmartInsights`/`useDashboardInsights`. Assistant prompts are proxied through `/api/v1/assistant/query`, preserving conversation history for contextually relevant replies. |

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

---

## 🗺️ Roadmap

- ✅ Enhanced insights API + dashboard visualizations (spending trends, categories, comparisons)
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
