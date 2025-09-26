# 📊 Renewly — Smart Finance Tracker

Renewly is a full‑stack web application that helps you track, manage, and visualize recurring expenses (subscriptions and bills). It provides a clean landing experience, authentication, and a foundation for dashboards, reminders, and insights.

---

## 🚀 Tech Stack

- Frontend
  - React (Vite)
  - React Router
  - Context API (auth state)
  - Tailwind CSS v4 (@tailwindcss/vite)

- Backend
  - Node.js (ES Modules)
  - Express
  - MongoDB + Mongoose
  - JWT Authentication (stateless)
  - Nodemailer (email workflows)
  - dotenv

---

## 📂 Monorepo Structure

```text
renewly/
├─ client/                      # React frontend
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
│     │  └─ landing.css
│     ├─ index.css
│     ├─ App.jsx
│     └─ main.jsx
│
├─ server/                      # Node/Express backend
│  ├─ package.json
│  └─ src/
│     ├─ app.js
│     ├─ config/
│     │  └─ env.js
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
│        └─ ...
│
└─ README.md

⚙️ Setup
1) Backend (server)
From the server/ directory:

bash
npm install
Create server/.env.development.local with:

env
PORT=3000
NODE_ENV=development
DB_URI=mongodb://localhost:27017/renewly
JWT_SECRET=your-super-secret
JWT_EXPIRES_IN=7d
SERVER_URL=http://localhost:3000
EMAIL_PASSWORD=your-gmail-app-password
Run the API:

bash
npm run dev
Health check:

GET http://localhost:3000/ → “Welcome to the Renewly API!”
Base API paths (from 
server/src/app.js
):

Auth: /api/v1/auth
Users: /api/v1/users
Subscriptions: /api/v1/subscriptions
Workflows: /api/v1/workflows
Local dev CORS:

The server allows origin http://localhost:5173 (Vite) by default.
2) Frontend (client)
From the client/ directory:

bash
npm install
Create client/.env.development with:

env
VITE_API_URL=http://localhost:3000
Run the app:

bash
npm run dev
Open http://localhost:5173

Routes:

/ → Landing (public)
/signin, /signup → Auth (public)
/dashboard
 → Protected (requires auth context state)
🔐 Authentication (current)
Sign Up: POST ${VITE_API_URL}/api/v1/auth/signup
Sign In: POST ${VITE_API_URL}/api/v1/auth/signin
On success, the client stores { token, user } in localStorage and routes to 
/dashboard
.
🧩 Development Notes
Environment loading (backend)
server/src/config/env.js loads .env.<NODE_ENV>.local from the server/ working directory.
Tailwind v4 extracted styles (frontend)
Keep global Tailwind import only in 
client/src/index.css
:
@import "tailwindcss";
In any additional CSS using @apply, add a reference and use a layer (example 
client/src/styles/landing.css
):
css
@reference "tailwindcss";
@layer components {
  /* your component classes with @apply */
}
Ports (default)
API: http://localhost:3000
Client: http://localhost:5173
🗺️ Roadmap
Bills support and CRUD
Budgets and limits
Insights and recommendations
Calendar view and reminders
Axios API client with interceptors and robust error handling
E2E & integration tests