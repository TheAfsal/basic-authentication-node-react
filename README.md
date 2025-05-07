# Authentication Module

This project provides a reusable authentication module with:

- **Frontend**: React, Vite, TypeScript, Zustand, Axios
- **Backend**: Express, MongoDB, TypeScript, JWT

It supports user registration, login, logout, and token refresh using JWT access tokens and HttpOnly refresh token cookies.

---

## Project Structure

### Client (`client/`)

- `src/api/axiosInstance.ts`: Axios instance with interceptors for token refresh
- `src/store/authStore.ts`: Zustand store for authentication state
- `src/components/Login.tsx`: Login form
- `src/components/Register.tsx`: Registration form
- `src/App.tsx`: Routing and main app component

### Server (`server/`)

- `src/controllers/auth.ts`: Authentication controllers (login, register, logout, refresh)
- `src/models/User.ts`: Mongoose user schema
- `src/routes/auth.ts`: Authentication routes
- `src/index.ts`: Express server setup

---

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- MongoDB (local or cloud via MongoDB Atlas)

---

## Backend Setup

1. Navigate to the `server/` directory and install dependencies:

   ```bash
   cd server
   pnpm install
   ```

2. Create a `.env` file in `server/`:

   ```env
   MONGO_URI=mongodb://localhost:27017/auth-module
   PORT=5000
   JWT_SECRET=your_jwt_secret_here
   NODE_ENV=development
   ```

   - Replace `your_jwt_secret_here` with a secure string (e.g., run `openssl rand -base64 32`).
   - Update `MONGO_URI` for remote MongoDB instances.

3. Start the backend:

   ```bash
   pnpm dev
   ```

   The server runs at `http://localhost:5000`.

---

## Frontend Setup

1. Navigate to the `client/` directory and install dependencies:

   ```bash
   cd client
   pnpm install
   ```

2. Create a `.env` file in `client/`:

   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

3. Start the frontend:

   ```bash
   pnpm run dev
   ```

   The app runs at `http://localhost:5173`.

---

## Authentication Flow

- **Register**: POST `/api/auth/register` with `name`, `email`, `password`. Returns `accessToken` and sets HttpOnly `refreshToken` cookie.
- **Login**: POST `/api/auth/login` with `email`, `password`. Returns `accessToken` and sets HttpOnly `refreshToken` cookie.
- **Refresh**: POST `/api/auth/refresh` with `refreshToken` cookie. Returns new `accessToken`.
- **Logout**: POST `/api/auth/logout`. Clears `refreshToken` cookie and auth state.
- **Frontend State**: Managed by Zustand in `authStore.ts`. Stores `isAuthenticated`, `accessToken`, and `user` (name, email).
- **Token Handling**:
  - `accessToken`: Stored in-memory (Zustand), sent in `Authorization: Bearer` header.
  - `refreshToken`: HttpOnly cookie, sent with `withCredentials: true`.
- **Routing**:
  - `/login`: Login page. Redirects to `/` if authenticated.
  - `/register`: Registration page. Redirects to `/` if authenticated.
  - `/`: Protected route. Redirects to `/login` if unauthenticated.

---

## Integrating into Another Project

To use this auth module in another repository:

### Copy Backend

- Copy `server/src/` to your project’s backend directory.
- Merge `server/package.json` dependencies:

  ```json
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.14.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie-parser": "^1.4.7",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.10.7",
    "concurrently": "^8.2.2",
    "nodemon": "^3.1.10",
    "typescript": "^5.7.3"
  }
  ```

- Add `.env` configuration to your backend:

  ```env
  MONGO_URI=mongodb://localhost:27017/your-db
  PORT=5000
  JWT_SECRET=your_jwt_secret_here
  NODE_ENV=development
  ```

- Add routes to your Express app:

  ```typescript
  import authRoutes from './routes/auth.js';
  app.use('/api/auth', authRoutes);
  ```

### Copy Frontend

- Copy `client/src/api/`, `client/src/store/`, `client/src/components/Login.tsx`, and `client/src/components/Register.tsx` to your frontend.
- Merge `client/package.json` dependencies:

  ```json
  "dependencies": {
    "axios": "^1.7.7",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.2",
    "typescript": "^5.5.2",
    "vite": "^5.4.8"
  }
  ```

- Add `.env` to your frontend:

  ```env
  VITE_BACKEND_URL=http://localhost:5000
  ```

- Integrate routes in your `App.tsx`:

  ```typescript
  import { Routes, Route, Navigate } from 'react-router-dom';
  import Login from './components/Login';
  import Register from './components/Register';
  import { useAuthStore } from './store/authStore';

  function App() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return (
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/" element={isAuthenticated ? <YourProtectedComponent /> : <Navigate to="/login" replace />} />
      </Routes>
    );
  }
  ```

### Configure CORS

- Ensure backend CORS allows your frontend origin:

  ```typescript
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  ```

### Test Integration

- Run both backend and frontend:

  ```bash
  cd server && pnpm dev
  cd client && pnpm run dev
  ```

- Test `/login`, `/register`, `/api/auth/refresh`, and `/api/auth/logout`.

---

## Troubleshooting

### Axios Error (`undefined/api`)

- Verify `client/.env` has:

  ```env
  VITE_BACKEND_URL=http://localhost:5000
  ```

- Check `axiosInstance.ts` uses:

  ```typescript
  const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
  ```

- Inspect Network tab for incorrect URLs.

### CORS Issues

- Ensure `server/src/index.ts` has:

  ```typescript
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  ```

- Check console for CORS errors and verify `access-control-allow-credentials: true`.

### Cookie Issues

- Confirm `refreshToken` cookie is set (dev tools > Application > Cookies).
- Verify `withCredentials: true` in `axiosInstance.ts`:

  ```typescript
  withCredentials: true
  ```

- Check backend logs for:

  ```log
  Refresh parsed cookies:
  ```

### Authentication State

- Log `isAuthenticated` in `App.tsx` and `Login.tsx`:

  ```typescript
  console.log('isAuthenticated:', isAuthenticated);
  ```

- Ensure `/api/auth/refresh` returns 200 with `accessToken`.

### MongoDB

- Verify MongoDB is running and `MONGO_URI` is correct.
- Check user document:

  ```bash
  mongo
  use auth-module
  db.users.find({ email: "test@example.com" })
  ```

---

## Development Notes

- **Frontend**: Uses React 18, Vite, TypeScript, Zustand for state, Axios for API calls, and Tailwind CSS for styling.
- **Backend**: Uses Express, MongoDB (Mongoose), TypeScript, JWT for tokens, and `cookie-parser` for HttpOnly cookies.
- **Security**:
  - `accessToken`: In-memory (Zustand), short-lived (1 hour).
  - `refreshToken`: HttpOnly, secure (in production), 7-day expiry.
  - Passwords: Hashed with bcrypt.
- **Production**:
  - Set `NODE_ENV=production` and `secure: true` in `server/src/controllers/auth.ts`:

    ```typescript
    secure: process.env.NODE_ENV === 'production'
    ```

  - Update `VITE_BACKEND_URL` to your production backend URL.
