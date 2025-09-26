# 📊 Renewly — Smart Finance Tracker

Renewly is a full‑stack web platform that helps teams keep recurring software and finance subscriptions under control. It currently delivers a polished landing page with animated interactions, full authentication flows, and a protected dashboard shell ready for deeper spend insights.

---

## ✨ Features

- Elegant hero experience with animated CTAs and responsive background imagery
- Email/password authentication with protected routes and persistent sessions
- Context-driven auth state (React context + localStorage sync)
- Reusable card layouts for onboarding (Sign In / Sign Up)
- Structured backend with JWT, MongoDB, and modular controllers
- Ready-to-extend services/hooks for APIs, automation, and analytics

---

## 🚀 Tech Stack

**Frontend**

- React + Vite
- React Router
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- Context API (for auth state)

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
├─ client/                         # React frontend
│  ├─ index.html
│  ├─ vite.config.js
│  ├─ package.json
│  └─ src/
│     ├─ assets/
│     ├─ components/
│     ├─ contexts/
│     │  └─ AuthContext.jsx
│     ├─ pages/
│     │  ├─ landing/
│     │  │  └─ LandingPage.jsx
│     │  ├─ auth/
│     │  │  ├─ SignIn.jsx
│     │  │  └─ SignUp.jsx
│     │  └─ dashboard/
│     │     └─ Dashboard.jsx
│     ├─ routes/
│     │  └─ AppRoutes.jsx
│     ├─ styles/
│     │  ├─ global.css            # Global Tailwind entry point
│     │  └─ landing.css           # Landing specific layers (optional)
│     ├─ index.css                # Re-exports styles/global.css
│     ├─ App.jsx
│     └─ main.jsx
│
├─ server/                         # Node/Express backend
│  ├─ package.json
│  └─ src/
│     ├─ app.js
│     ├─ config/
│     │  ├─ env.js
│     │  ├─ arcjet.js
│     │  ├─ nodemailer.js
│     │  └─ upstash.js
│     ├─ controllers/
│     │  ├─ authController.js
│     │  ├─ subscriptionController.js
│     │  ├─ userController.js
│     │  └─ workflowController.js
│     ├─ database/
│     │  └─ mongodb.js
│     ├─ middleware/
│     │  ├─ ArcjetMiddleware.js
│     │  ├─ authMiddleware.js
│     │  └─ errorMiddleware.js
│     ├─ models/
│     │  ├─ subscriptionModel.js
│     │  └─ userModel.js
│     ├─ routes/
│     │  ├─ authRoutes.js
│     │  ├─ subscriptionRoutes.js
│     │  ├─ userRoutes.js
│     │  └─ workflowRoutes.js
│     └─ utils/
│        ├─ email-template.js
│        └─ send-email.js
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

| Feature       | Path                    |
| ------------- | ----------------------- |
| Auth          | `/api/v1/auth`          |
| Users         | `/api/v1/users`         |
| Subscriptions | `/api/v1/subscriptions` |
| Workflows     | `/api/v1/workflows`     |

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

- Subscription CRUD with billing schedule metadata
- Budgets, limits, and alerts
- Insights & savings recommendations
- Calendar view + email/SMS reminders
- Axios API client with interceptors and typed responses
- Unit, integration, and E2E coverage

---

## 🤝 Contributing

We welcome ideas! Open an issue with your feature request or bug report, or submit a PR following the structure above. Feel free to fork the repo and tailor Renewly to your stack.

---

Happy building! 🚀
