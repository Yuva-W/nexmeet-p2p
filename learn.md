# NextMeet — Learn Guide

> Video conferencing app (NextMeet) — MERN + Socket.io + WebRTC. This document describes folder structure, tech stack, and end-to-end flow for learning/onboarding.

---

## 1. Project Overview

**NextMeet** is a simple, secure video calling app to connect with loved ones. Landing marketing page + auth (register/login) + real-time meeting rooms via Socket.io signaling + WebRTC (planned).

- **Repo root:** `C:\Users\wyuva\Desktop\NextMeet`
- **Architecture:** Monorepo with two independent apps → `backend/` (Express API + Socket.io) and `frontend/` (Vite + React SPA)
- **No root workspace** — each has own `package.json` and `node_modules/`

---

## 2. Tech Stack

| Layer | Tech | Version | Purpose |
|-------|------|---------|---------|
| **Backend Runtime** | Node.js + Express | `5.2.1` | REST API (`backend/app.js:1`) |
| **Realtime** | Socket.io | `4.8.3` | Signaling for WebRTC, chat, presence (`backend/src/controllers/socketManager.js:1`) |
| **DB** | MongoDB + Mongoose | `9.9.3` | User & Meeting persistence (`backend/src/config/db.js:1`) |
| **Auth** | bcrypt `6.0.0` + jsonwebtoken `9.0.3` | — | Hash + JWT 1h expiry (`backend/src/controllers/authController.js:1`) |
| **Config** | dotenv `17.4.2` | — | `PORT`, `MONGO_URI`, `JWT_SECRET` (`backend/server.js:1`) |
| **Frontend Build** | Vite `8.2.2` + @vitejs/plugin-react `6.1.0` | — | Dev server & build (`frontend/vite.config.js:1`) |
| **Frontend UI** | React `19.2.8` + React DOM `19.2.8` + React Router `7.18.2` | — | SPA routing (`frontend/src/App.jsx:1`) |
| **Styling** | Tailwind CSS `4.3.3` + @tailwindcss/vite `4.3.3` | — | Utility styling (`frontend/src/App.css`, `frontend/src/pages/LandingPage.jsx:5`) |
| **HTTP Client** | Axios `1.20.0` | — | API calls (`frontend/src/services/api.js:1`) |
| **Frontend Realtime** | socket.io-client `4.8.3` | — | Join call signaling (planned) |

---

## 3. Folder Structure

```
NextMeet/
├── .git/                           # git history
├── .gitignore                      # ignores .env, node_modules/
├── learn.md                        # this file
│
├── backend/                        # Express 5 + Socket.io 4 + Mongoose 9 (type: module)
│   ├── .env                        # PORT=8000, MONGO_URI, JWT_SECRET  (not committed)
│   ├── app.js                      # express app factory, cors, http server, socket, routes
│   ├── server.js                   # entry point — connectDB() then app.listen()
│   ├── package.json                # scripts: dev (nodemon server.js), start (node server.js)
│   ├── package-lock.json
│   └── src/
│       ├── config/
│       │   └── db.js               # mongoose.connect(MONGO_URI)
│       ├── controllers/
│       │   ├── authController.js   # register + login logic
│       │   └── socketManager.js    # Socket.io connection handlers
│       ├── models/
│       │   ├── userModel.js        # User schema
│       │   └── meetingModel.js     # Meeting schema
│       └── routes/
│           ├── authRouter.js       # POST /auth/register, POST /auth/login
│           └── userRouter.js       # stub: /add_to_activity, /get_all_activity
│
└── frontend/                       # Vite 8 + React 19 + React Router 7 + Tailwind 4
    ├── index.html                  # <div id="root">, script /src/main.jsx
    ├── vite.config.js              # plugins: react(), tailwindcss()
    ├── eslint.config.js
    ├── package.json                # scripts: dev, build, lint, preview
    ├── package-lock.json
    ├── public/                     # static assets
    └── src/
        ├── main.jsx                # ReactDOM.createRoot → <App />
        ├── App.jsx                 # BrowserRouter + AuthProvider + Routes
        ├── App.css
        ├── assets/
        │   └── bg.png
        ├── context/
        │   └── authContext.jsx     # AuthContext + handleRegister/handleLogin
        ├── services/
        │   └── api.js              # axios instance baseURL http://localhost:8000/
        └── pages/
            ├── LandingPage.jsx     # marketing landing page
            └── AuthController.jsx  # login/register form
```

### 3.1 File Responsibilities

| File | Lines | Responsibility |
|------|-------|---------------|
| `backend/app.js` | 25 | Create `express()` app, `createServer(app)`, attach `connectToSocket(server)`, middlewares `json(40kb)`, `urlencoded`, `cors()`, mount `/auth`, `GET /` health check, `export default app` |
| `backend/server.js` | 16 | `import "dotenv/config"`, set `app.set("port", PORT||8000)`, `await connectDB()` then `app.listen(PORT)` |
| `backend/src/config/db.js` | 14 | `mongoose.connect(process.env.MONGO_URI)` with try/catch + `process.exit(1)` on fail |
| `backend/src/models/userModel.js` | 34 | `User { name, username (unique, lowercase), password, role: user|admin }` timestamps |
| `backend/src/models/meetingModel.js` | 20 | `Meeting { user_id: String, meetingCode }` timestamps |
| `backend/src/controllers/authController.js` | 97 | `register` (check duplicate → bcrypt hash → User.create → 200) and `login` (find → bcrypt.compare → jwt.sign 1h → 200) |
| `backend/src/controllers/socketManager.js` | 107 | `connectToSocket(server)` returns `io`; handles `join-call`, `signal`, `chat-message`, `disconnect` with in-memory `connections`, `messages`, `timeOnline` |
| `backend/src/routes/authRouter.js` | 12 | `router.post("/register", register)`, `router.post("/login", login)` |
| `backend/src/routes/userRouter.js` | 8 | Stub — `router.route("/add_to_activity")`, `router.route("/get_all_activity")` (no handlers) |
| `frontend/src/main.jsx` | 9 | `createRoot(root).render(<StrictMode><App/></StrictMode>)` |
| `frontend/src/App.jsx` | 25 | `BrowserRouter > AuthProvider > Routes: / → LandingPage, /auth → AuthController` |
| `frontend/src/services/api.js` | 7 | `axios.create({ baseURL: "http://localhost:8000/" })` |
| `frontend/src/context/authContext.jsx` | 49 | `createContext`, `handleRegister` (POST /auth/register), `handleLogin` (POST /auth/login → localStorage token → navigate /home) |
| `frontend/src/pages/LandingPage.jsx` | 220 | Navbar (Join as Guest, Register, Login) + Hero (Connect with Loved Ones) + Features (Easy Video Calls, Real-Time, Secure) + How it works (3 steps) + CTA + Footer |
| `frontend/src/pages/AuthController.jsx` | 374 | Toggle `formState` 0=Login/1=Register, validate username/name/password≥6, call context handlers, show error/success, social buttons |

---

## 4. Content & UI Flow

### 4.1 Landing Page Content (`frontend/src/pages/LandingPage.jsx:3`)

1. **Navbar** (`:7`) — Brand `NextMeet` left, links right: `Join as Guest → /guest`, `Register → /auth`, `Login (yellow CTA) → /auth`
2. **Hero** (`:35`) — Headline `Connect with your Loved Ones` (yellow accent), subtext about secure reliable video calls, CTAs `Get Started → /auth` + `Join as Guest → /guest`
3. **Features** (`:67`) — `Why NextMeet?` → 3 cards: `Easy Video Calls`, `Real-Time Connection (WebRTC)`, `Secure & Private`
4. **How it works** (`:128`) — 3 steps numbered yellow circles: `1 Create account → 2 Join a meeting → 3 Start talking`
5. **CTA** (`:187`) — `Ready to connect?` dark card with `Get Started → /auth`
6. **Footer** (`:207`) — `© 2026 NextMeet`

### 4.2 Auth Page Content (`frontend/src/pages/AuthController.jsx:5`)

- **Layout:** Navbar with `Back to home`, left marketing copy (desktop) + right auth card
- **Toggle:** `formState 0=Login / 1=Register` (`:8`, `:88`) — pill switch Login↔Register, heading/subheading changes
- **Form fields:** `Full name` (register only), `Username`, `Password` (placeholder ••••), validation: required + password ≥6 (`:61`)
- **Submit:** `handleSubmit → handleAuth → handleLogin/handleRegister` (`:23`, `:55`) — shows `error` (red) or `message` (green), on register success auto-switch to Login
- **Extras:** Divider `OR CONTINUE WITH` + `Google`/`GitHub` buttons (UI only), bottom link toggle `Don't have account? Create one`

---

## 5. Application Flow (End-to-End)

### 5.1 Startup Flow

```
[frontend]  npm run dev  →  Vite :5173  →  index.html → main.jsx → App.jsx → Routes
[backend]   npm run dev  →  nodemon server.js → dotenv → connectDB() → app.listen(PORT)
                                      ↓
                              mongoose.connect(MONGO_URI)
                                      ↓
                              Server listening at http://localhost:8000
                              Socket.io attached via connectToSocket(server)
```

**Note:** `backend/app.js:9` creates `server = createServer(app)` and `io = connectToSocket(server)` but `backend/server.js:11` calls `app.listen` not `server.listen` — socket will not receive HTTP. Fix: `server.listen(PORT)` and export `{app, server}`.

### 5.2 Routing Flow (Frontend)

```
"/"          → LandingPage.jsx          (public)
"/auth"      → AuthController.jsx       (public, login/register)
"/guest"     → (planned) guest join page — links exist in LandingPage.jsx:13 but no Route in App.jsx:17
"/home"      → (planned) dashboard — navigated from authContext.jsx:32 but no Route defined
```

`frontend/src/App.jsx:16` only defines `/` and `/auth`. Add missing routes for `/guest`, `/home`, `/:meetingCode`.

### 5.3 Auth Flow (Register)

```
AuthController.jsx:33 handleRegister(name,username,password)
        ↓
authContext.jsx:12 api.post("/auth/register", {name,username,password})
        ↓
api.js:4 baseURL http://localhost:8000/ → POST http://localhost:8000/auth/register
        ↓
app.js:16 authRouter → authRouter.js:9 → authController.js:6 register
        ↓
User.findOne({username}) → if exists 409 "User already exists"
        ↓
bcrypt.hash(password,10) → User.create({name,username,password:hashed})
        ↓
200 { success:true, message:"User Registered", user:{id,name,username,role} }
        ↓
AuthController.jsx:38 setMessage → switch to Login form
```

### 5.4 Auth Flow (Login)

```
AuthController.jsx:29 handleLogin(username,password)
        ↓
authContext.jsx:22 api.post("/auth/login", {username,password})
        ↓
POST http://localhost:8000/auth/login
        ↓
authController.js:45 login → User.findOne({username}) → 401 if not found
        ↓
bcrypt.compare(password, user.password) → 401 if mismatch
        ↓
jwt.sign({id:user._id, role:user.role}, JWT_SECRET, {expiresIn:"1h"})
        ↓
200 { success:true, message:"Logged in", user:{id,name,username, token} }
        ↓
authContext.jsx:28 localStorage.setItem("token", response.data.token)  // BUG: should be response.data.user.token
authContext.jsx:30 setUserData(response.data)
authContext.jsx:32 navigate("/home")
```

### 5.5 Meeting / Socket Flow (Signaling)

```
Client A                                    Server (socketManager.js:3)                     Client B
  |  socket.emit("join-call", path)  →        connections[path].push(socket.id)                |
  |  ← io.to(all).emit("user-joined", socket.id, connections[path])  →                        |
  |  ← replay messages[path] as "chat-message"                                                 |
  |                                           |  ← socket.emit("join-call", same path)        |
  |  ← "user-joined" (B joined)              |  connections[path]=[A,B]                      |  ← "user-joined"
  |  socket.emit("signal", toId, sdp)  →      io.to(toId).emit("signal", fromId, sdp)  →      |  on "signal" → WebRTC RTCPeerConnection
  |  socket.emit("chat-message", data) →      find matchingRoom via connections → push to messages[room] → broadcast to room
  |  socket disconnect →                      timeOnline diff → emit "user-left" → splice connections → delete if empty
```

In-memory stores: `connections = { path: [socketId] }`, `messages = { path: [{data,sender,socket-id-sender}] }`, `timeOnline = { socketId: Date }` — not persisted, lost on restart.

### 5.6 Data Model Flow

```
User (userModel.js:3) ──< Meeting (meetingModel.js:3)
  _id (ObjectId)            user_id: String (should ref User._id)
  name                      meetingCode: String (required)
  username (unique)         timestamps
  password (hashed)
  role: user|admin
  timestamps
```

`Meeting` not yet wired — `userRouter.js:5` stubs `add_to_activity` / `get_all_activity` should create/list meetings for authenticated user.

---

## 6. API Contracts

| Method | URL | Body | Success | Error |
|--------|-----|------|---------|-------|
| `GET` | `/` (`app.js:18`) | — | `200 {success:true, message:"this is home directory"}` | — |
| `POST` | `/auth/register` | `{name, username, password}` | `200 {success:true, message, user}` | `409 User already exists`, `500` |
| `POST` | `/auth/login` | `{username, password}` | `200 {success:true, message, user:{..., token}}` | `401 Invalid credentials` |
| `WS` | `join-call` | `path` (meeting code) | `user-joined` broadcast + chat replay | — |
| `WS` | `signal` | `toId, sdp/candidate` | forwarded to `toId` | — |
| `WS` | `chat-message` | `data, sender` | broadcast to room | — |
| `WS` | `disconnect` | — | `user-left` broadcast + cleanup | — |

Axios base: `frontend/src/services/api.js:4` → `http://localhost:8000/` (no trailing `/` handling, no interceptors for token).

---

## 7. Environment & Scripts

**Backend `.env`** (required):
```
PORT=8000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
```

**Run:**
```bash
# backend
cd backend && npm install && npm run dev   # nodemon server.js → http://localhost:8000

# frontend
cd frontend && npm install && npm run dev  # vite → http://localhost:5173
```

---

## 8. Known Gaps / Next Steps (for learning)

1. **Missing deps:** `backend/package.json:14` lacks `cors`, `dotenv` is used but `cors` not installed — `npm i cors`
2. **Socket not listening:** `backend/server.js:11` should be `server.listen` not `app.listen`; export `server` from `app.js`
3. **Undefined globals:** `socketManager.js:18` needs `let connections={}, messages={}, timeOnline={}` at top; fix typo `connactions`→`connections` (`:90`) and `key` declaration (`:82`)
4. **Auth token path:** `authContext.jsx:28` should read `response.data.user.token`; add axios interceptor to attach `Authorization: Bearer <token>`
5. **Missing routes:** `App.jsx:17` add `/home`, `/guest`, `/meet/:code` + protected route wrapper checking `localStorage.token`
6. **Validation:** `authController.js:40,88` catch logs but never sends response — add `res.status(500).json(...)`
7. **Meeting feature:** Implement `userRouter.js` handlers using `meetingModel.js` + auth middleware `jwt.verify`
8. **WebRTC client:** Create `frontend/src/pages/VideoMeet.jsx` using `socket.io-client` + `RTCPeerConnection` consuming `signal`/`user-joined` events

---

## 9. Learning Path (suggested order)

1. Read `backend/src/models` → `authController` → `authRouter` → `app.js` → `server.js` → test with Postman
2. Read `frontend/src/services/api` → `context/authContext` → `pages/AuthController` → `App.jsx` routing
3. Trace register/login flow end-to-end with browser Network tab
4. Study `socketManager.js` signaling, then build minimal WebRTC peer connection
5. Implement missing pieces in order listed in §8

