# Subscription Tracker API

A Node.js/Express REST API for managing user authentication and subscriptions, backed by MongoDB via Mongoose.

## Features

- User signup, signin, and signout endpoints (`/api/v1/auth/*`)
- Secure password hashing with bcryptjs
- JWT-based authentication
- Mongoose models with validation and unique email constraint
- Centralized error handling middleware

## Tech Stack

- Node.js (ES Modules)
- Express
- MongoDB + Mongoose
- bcryptjs
- jsonwebtoken
- dotenv

## Project Structure

```
.
├─ config/
│  └─ env.js
├─ controllers/
│  └─ authController.js
├─ database/
│  └─ mongodb.js
├─ middleware/
│  └─ errorMiddleware.js
├─ models/
│  ├─ subscriptionModel.js
│  └─ userModel.js
├─ routes/
│  ├─ authRoutes.js
│  ├─ subscriptionRoutes.js
│  └─ userRoutes.js
├─ app.js
├─ package.json
└─ README.md
```

## Prerequisites

- Node.js 18+ recommended
- MongoDB 6+ running locally or accessible via URI

## Environment Variables

Environment is loaded from a file based on `NODE_ENV` using `config/env.js`:

- The loader reads: `.env.<NODE_ENV>.local`
- If `NODE_ENV` is not set, it defaults to `development`, so file should be `.env.development.local`

Required variables:

```
PORT=3000
NODE_ENV=development
DB_URI=mongodb://localhost:27017/subscription_tracker
JWT_SECRET=your-super-secret
JWT_EXPIRES_IN=7d
```

Create `config/.env.development.local` adjacent to `config/env.js` or at your project root (same directory as `app.js`) depending on your setup. With the current `env.js`, place the file at the project root.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create the env file `.env.development.local` with the variables above.
3. Ensure MongoDB is running and reachable at `DB_URI`.

## Running the App

- Development (with nodemon):
  ```bash
  npm run dev
  ```
- Production:
  ```bash
  npm start
  ```

The server logs which port and environment it’s running on. By default:
- Base URL: `http://localhost:3000`
- Health check: `GET /` returns a welcome message

## API Endpoints

Base path prefixes in `app.js`:
- Auth: `/api/v1/auth`
- Users: `/api/v1/users`
- Subscriptions: `/api/v1/subscriptions`

### Auth

- POST `/api/v1/auth/signup`
  - Body (JSON):
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "secret123"
    }
    ```
  - Response: `201 Created` with `{ token, user }`

- POST `/api/v1/auth/signin` (to be implemented)
  - Body (JSON): `{ "email": "...", "password": "..." }`
  - Response: `{ token, user }`

- POST `/api/v1/auth/signout` (optional behavior)

Note: For JSON requests, set `Content-Type: application/json`. If you plan to send URL-encoded forms, add `app.use(express.urlencoded({ extended: true }))` in `app.js`.

### Example cURL

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"secret123"}'
```

## Important Implementation Notes

- Mongoose connection is started in `database/mongodb.js` and awaited in `app.js` during server startup.
- `authController.signup` uses bcryptjs to salt and hash passwords and issues a JWT with `JWT_SECRET` and `JWT_EXPIRES_IN`.
- The `userModel.js` defines `email` with `unique: true`. Ensure the unique index exists in Mongo (in production, `autoIndex` can be disabled; create the index manually if needed).
- The signup flow currently uses a Mongoose session and starts a transaction. MongoDB transactions require a replica set (including single-node RS in development). If running a standalone server, either enable a replica set or remove the transaction from signup.

## Troubleshooting

- Error: `Illegal arguments: undefined, string` from bcryptjs
  - Cause: `password` missing in request body
  - Fix: Ensure `Content-Type: application/json` and include `password` in the JSON body

- Duplicate key error (code 11000) on `email`
  - Cause: Attempt to create user with an existing email
  - Fix: Handle error in middleware and return 400 with a clear message; ensure a unique index on `email`

- Session/transaction error: `Client must be connected before starting a session` or transaction not supported
  - Cause: DB connection not ready or MongoDB not a replica set
  - Fix: Connect before accepting requests; enable a single-node replica set for dev, or remove the transaction usage

- JWT errors
  - Cause: Missing `JWT_SECRET` or `JWT_EXPIRES_IN`
  - Fix: Confirm env variables are loaded; verify `.env.<NODE_ENV>.local` exists

## Scripts

- `npm run dev` – start with nodemon
- `npm start` – start with node

## Security

- Never commit `.env.*.local` files
- Use a strong `JWT_SECRET`
- Hash all passwords (already implemented)
- Validate input on all endpoints (additions recommended)

## Future Improvements

- Implement `signin` and `signout` controllers
- Add authentication middleware and protect subscription routes
- Add rate limiting and request validation
- Add tests (unit/integration)

## License

This project is provided as-is under no specific license. Add a LICENSE file if you intend to open-source it.
