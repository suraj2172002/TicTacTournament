# TicTacTournament

Full-stack Tic-Tac-Toe tournament where authenticated users face a 5-level AI gauntlet. Backend uses Express + MongoDB with JWT authentication, frontend uses Vite + React. Deploy the React client on Netlify and the API on Render (or any Node-friendly host).

## Project structure

- `server/` – Express API (`/api/auth`, `/api/user`, `/api/game`) with MongoDB persistence.
- `client/` – React application with authentication views, protected game dashboard, AI tournament logic, and saved history viewer.

## Prerequisites

- Node.js 18+ and npm installed locally.
- MongoDB Atlas cluster or local MongoDB instance.

## Environment variables

Create a `.env` file inside `server/` based on `server/.env`.

```
PORT=5000
MONGO_URI=your_connection_string
JWT_SECRET=super_long_random_string
CLIENT_ORIGIN=http://localhost:5173
```




## Local development

1. Install dependencies:

   ```bash
   cd server
   npm install

   cd ../client
   npm install
   ```

2. Start the backend API:

   ```bash
   (cd server && npm run dev)
   ```

3. In another terminal start the frontend:

   ```bash
   cd client
   npm run dev
   ```

4. Visit `http://localhost:5173` to register, log in, and play the tournament. Only authenticated users can access `/game`.

## Testing the flow

- Register a new account via the landing page.
- After logging in you will be redirected to `/game`.
- Play through the 5 AI levels; the tournament summary automatically persists to MongoDB.
- Refreshing the page pulls the authenticated profile and recent tournaments (last 10).

## Deployment

### Backend (Render)

1. Push this repository to GitHub.
2. Create a new **Web Service** on Render.
3. Set build command `npm install` and start command `npm run start` in the `server/` directory (Render supports the `root directory` option).
4. Add environment variables from `server/env.example`, setting `CLIENT_ORIGIN` to the Netlify URL once available.

### Frontend (Netlify)

1. Connect the repo to Netlify and set the base directory to `client/`.
2. Build command: `npm run build`. Publish directory: `dist`.
3. Add environment variable `VITE_API_BASE` pointing to your Render API URL (e.g. `https://your-api.onrender.com/api`).
4. After deployment, update `CLIENT_ORIGIN` on the backend to match the Netlify URL.

## API overview

- `POST /api/auth/register` – create user, returns JWT.
- `POST /api/auth/login` – authenticate user, returns JWT.
- `GET /api/user/me` – fetch profile (requires `Authorization: Bearer <token>`).
- `POST /api/game/result` – persist tournament outcome (requires auth).
- `GET /api/game/history` – fetch last 10 tournaments for the signed-in user.

## Notes

- The AI progresses from random play to perfect minimax strategy across 5 rounds.
- All JWT handling happens client-side via `AuthContext`, and protected routes guard the game page.
- `GameResult` documents keep per-level metadata, enabling leaderboard/analytics extensions later.

Enjoy hosting your own Tic-Tac-Toe tournament! 🎮
