# GigFlow — Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack and TypeScript. Track, filter, and manage your sales pipeline with role-based access control, real-time search, and CSV export.

---

## Features

- **JWT Authentication** — secure register/login with bcrypt password hashing
- **Lead Management** — full CRUD with status tracking (New → Contacted → Qualified → Lost)
- **Advanced Filtering** — filter by status, source, search by name/email, sort by date; all filters combinable
- **Debounced Search** — 400ms debounce to avoid API spam
- **Backend Pagination** — 10 records per page with full metadata
- **Role-Based Access Control** — Admin sees all leads; Sales users manage only their own
- **CSV Export** — export filtered leads as a downloadable CSV
- **Dark Mode** — full dark theme support via Tailwind's class strategy
- **Docker Support** — one-command local setup with Docker Compose

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, React Query, Zustand |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| DevOps | Docker, Docker Compose, Nginx |

---

## Project Structure

```
gigflow/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── api/               # Axios instance + API call functions
│   │   ├── components/
│   │   │   ├── layout/        # Sidebar, Layout wrapper
│   │   │   ├── leads/         # LeadsTable, LeadForm, FiltersBar, LeadDetail
│   │   │   └── ui/            # Badge, Modal, Pagination (reusable)
│   │   ├── hooks/             # useLeads (React Query), useDebounce
│   │   ├── pages/             # LoginPage, RegisterPage, DashboardPage
│   │   ├── store/             # Zustand auth store
│   │   └── types/             # Shared TypeScript interfaces
│   ├── Dockerfile
│   └── nginx.conf
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── config/            # MongoDB connection
│   │   ├── controllers/       # authController, leadController
│   │   ├── middleware/        # auth (JWT), errorHandler, validate
│   │   ├── models/            # User, Lead (Mongoose schemas)
│   │   ├── routes/            # /api/auth, /api/leads
│   │   └── types/             # Shared TS interfaces + enums
│   └── Dockerfile
│
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Option A — Local Development

**1. Clone and install**

```bash
git clone https://github.com/your-username/gigflow.git
cd gigflow
```

**2. Set up the backend**

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

```bash
npm install
npm run dev
```

Server runs at `http://localhost:5000`

**3. Set up the frontend**

```bash
cd ../client
cp .env.example .env
npm install
npm run dev
```

Client runs at `http://localhost:5173`

The Vite dev server proxies `/api` requests to `:5000` automatically.

---

### Option B — Docker Compose

```bash
git clone https://github.com/your-username/gigflow.git
cd gigflow

# Set your JWT secret
export JWT_SECRET=your_long_random_secret_here

docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- MongoDB: `localhost:27017`

---

## API Reference

Base URL: `http://localhost:5000/api`

All lead endpoints require `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login and get JWT | No |
| GET | `/auth/me` | Get current user | Yes |

**Register / Login request body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "secret123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": "...",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "role": "sales"
    }
  }
}
```

---

### Leads

| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/leads` | List leads (paginated + filtered) | All |
| GET | `/leads/:id` | Get single lead | All (own only for sales) |
| POST | `/leads` | Create a lead | All |
| PATCH | `/leads/:id` | Update a lead | All (own only for sales) |
| DELETE | `/leads/:id` | Delete a lead | All (own only for sales) |
| GET | `/leads/export/csv` | Export leads as CSV | All |

**Query parameters for GET `/leads`:**

| Param | Type | Options | Description |
|---|---|---|---|
| `status` | string | `New`, `Contacted`, `Qualified`, `Lost` | Filter by status |
| `source` | string | `Website`, `Instagram`, `Referral` | Filter by source |
| `search` | string | any | Search name or email (case-insensitive) |
| `sort` | string | `latest`, `oldest` | Sort by createdAt |
| `page` | number | default: 1 | Page number |
| `limit` | number | default: 10, max: 50 | Records per page |

**Example:**
```
GET /api/leads?status=Qualified&source=Instagram&search=rahul&sort=latest&page=1
```

**Paginated response format:**
```json
{
  "success": true,
  "data": [ ...leads ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Lead object:**
```json
{
  "_id": "...",
  "name": "Priya Singh",
  "email": "priya@example.com",
  "status": "Qualified",
  "source": "Instagram",
  "notes": "Interested in enterprise plan",
  "createdBy": { "_id": "...", "name": "Rahul", "email": "rahul@example.com" },
  "createdAt": "2026-05-15T10:30:00.000Z",
  "updatedAt": "2026-05-16T08:00:00.000Z"
}
```

---

## Role-Based Access

| Action | Admin | Sales User |
|---|---|---|
| View all leads | ✅ | ❌ (own only) |
| Create leads | ✅ | ✅ |
| Edit any lead | ✅ | ❌ (own only) |
| Delete any lead | ✅ | ❌ (own only) |
| Export CSV (all) | ✅ | ❌ (own only) |

> **To make a user admin:** After registering, update the role directly in MongoDB:
> ```js
> db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
> ```

---

## Environment Variables

### Server (`server/.env`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)

```env
# Leave empty in development — Vite proxy handles it
# In production, set to your deployed backend URL:
# VITE_API_URL=https://gigflow-api.onrender.com/api
VITE_API_URL=
```

---

## Deployment

### Backend — Render / Railway

1. Push code to GitHub
2. Create a new Web Service on Render
3. Set build command: `cd server && npm install && npm run build`
4. Set start command: `node server/dist/index.js`
5. Add environment variables (use MongoDB Atlas URI)

### Frontend — Vercel

1. Import GitHub repo on Vercel
2. Set root directory to `client`
3. Add env variable: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy

### Database — MongoDB Atlas

1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Whitelist `0.0.0.0/0` in Network Access
3. Create a database user and copy the connection string

---

## Scripts

### Server

```bash
npm run dev      # development with hot reload (ts-node-dev)
npm run build    # compile TypeScript to dist/
npm run start    # run compiled production build
```

### Client

```bash
npm run dev      # Vite dev server
npm run build    # production build
npm run preview  # preview production build locally
```

---

## Git Commit Style

This project uses conventional commits:

```
feat: add CSV export endpoint
fix: handle 401 token expiry in axios interceptor
chore: add docker-compose setup
refactor: extract filter logic into buildFilter helper
```

---

*Built for the ServiceHive Full Stack Internship Assignment.*
