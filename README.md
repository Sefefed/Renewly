# 📊 Renewly - Smart Finance Tracker

Renewly is a **full-stack web application** designed to help users **track, manage, and visualize their finances**.  
It provides an intuitive dashboard, subscription management, and workflow automation to make money management **simple and smart**.

---

## 🚀 Tech Stack

**Frontend**:  
- React (Vite)  
- React Router  
- Context API (for auth state)  
- TailwindCSS (styling)  

**Backend**:  
- Node.js  
- Express.js  
- MongoDB with Mongoose  
- JWT Authentication (stateless)  
- Middleware for errors & security  

---

## ✨ Features

- 🔐 **Authentication**: Sign up, sign in, sign out (JWT-based)  
- 👤 **User Dashboard**: Personalized overview of finances  
- 💳 **Subscription Management**: Track recurring payments  
- 📈 **Analytics & Workflows**: Visual insights and automation  
- 🎨 **Modern UI**: Mobile-first, responsive design with Tailwind  

---

## 📂 Project Structure

renewly/
├── client/ # React frontend
│ ├── src/
│ │ ├── components/ # UI components
│ │ ├── pages/ # SignIn, SignUp, Dashboard, etc.
│ │ ├── contexts/ # Auth context
│ │ ├── routes/ # AppRoutes (protected/public routes)
│ │ └── App.jsx
│ └── package.json
│
├── server/ # Node.js backend
│ ├── src/
│ │ ├── config/ # Environment configs
│ │ ├── controllers/ # Business logic (auth, user, subscription, workflow)
│ │ ├── database/ # MongoDB connection
│ │ ├── middleware/ # Auth, error, rate limiting
│ │ ├── models/ # Mongoose models
│ │ ├── routes/ # Express routes
│ │ └── utils/ # Helpers
│ ├── app.js # Express app entry
│ └── package.json
│
└── README.md

yaml
Copy code

---

## ⚙️ Installation & Setup

### 1. Clone the repo
```bash
git clone https://github.com/your-username/renewly.git
cd renewly
2. Setup backend (server)
bash
Copy code
cd server
npm install
Create an .env.development.local file:

env
Copy code
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/renewly
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
Run backend:

bash
Copy code
npm start
3. Setup frontend (client)
bash
Copy code
cd ../client
npm install
npm run dev
🔑 API Endpoints (Auth)
POST /signup → Register new user

POST /signin → Login existing user (returns token + user)

POST /signout → Sign out (client discards token)

🧑‍💻 Development Workflow
Start backend first (npm start in /server).

Start frontend (npm run dev in /client).

Visit app at http://localhost:5173.

🌟 Roadmap
 Add expense categories

 Add charts & graphs for better visualization

 Implement notifications/reminders

 Deploy on Vercel (frontend) + Render/Heroku (backend) + Mongo Atlas

🤝 Contributing
Pull requests are welcome! Please fork the repo and submit a PR with improvements.

📜 License
This project is licensed under the MIT License.

yaml
Copy code

---

✅ This will give your project a **professional GitHub presence** and make it crystal clear for anyone setting it up.  