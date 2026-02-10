# DFlow

A simple, multi-tenant SaaS for companies to manage employees, shipments, stores, and events.

## Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Next.js API routes, Node.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT, bcrypt, cookie-based sessions

## Setup

1. Copy `.env.example` to `.env.local` and set:
   - `MONGODB_URI` – your MongoDB connection string
   - `DATABASE_NAME` – database name (e.g. `enterpriseapp`)
   - `JWT_SECRET` – secret for signing JWTs (use a long random string in production)
   - **Optional (for sending emails):** `RESEND_API_KEY` from [Resend](https://resend.com/api-keys), and `FROM_EMAIL` (e.g. `DFlow <onboarding@resend.dev>`). Without these, in-app email from Chat will show a configuration error.

2. Install and run:

```bash
npm install
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000). Sign up to create a company and start using the dashboard.

## Deploying to Railway

1. **Create a project** on [Railway](https://railway.app) and connect this repo (or push to a repo Railway can access).

2. **Set environment variables** in the Railway service (Variables tab). Use the same names as `.env.example`:
   - `MONGODB_URI` – MongoDB Atlas (or other) connection string
   - `DATABASE_NAME` – e.g. `enterpriseapp`
   - `JWT_SECRET` – long random string (e.g. 32+ chars) for production
   - **Optional (email):** `RESEND_API_KEY`, `FROM_EMAIL` (e.g. `DFlow <noreply@yourdomain.com>`)

3. **Node version** – The app needs Node 20+ (Next.js 16 requirement). The repo has `engines.node` in `package.json` and a `.nvmrc` with `20`. If the build still uses Node 18, add a **Variable** in Railway: `NIXPACKS_NODE_VERSION` = `20`.

4. **Deploy** – Railway runs `npm run build` then the start command from `railway.toml` (`next start -p ${PORT:-3000}`). The app listens on the `PORT` Railway sets.

5. **Domain** – In your service go to **Settings → Networking**, add a **Public domain** (e.g. `yourapp.up.railway.app`).

**If the app doesn’t start:** ensure all required variables are set (`MONGODB_URI`, `DATABASE_NAME`, `JWT_SECRET`). Check the **Deployments** tab logs for build or runtime errors.

## Features (MVP)

- **Auth:** Sign up (creates company + owner), login, logout
- **Dashboard:** Employee count, active shipments, stores, upcoming events, **recent activity timeline**, setup checklist, quick actions
- **Tasks:** Create task, assign to employee, due date, status (todo / in progress / done). Examples: “Check shipment”, “Prepare event booth”, “Train new staff”
- **Employees:** Add/edit/delete, assign to store, role, status
- **Shipments:** Log shipments with tracking, carrier, vendor, destination store, status (created → received)
- **Stores:** Add/edit/delete stores, assign manager
- **Events:** Create events with date, location, store, staff assignments
- **Chat:** In-app chat with team members; **send emails** to employees (HubSpot-style compose in app, sent via Resend)
- **Activity:** Timeline feed of company activity (e.g. “John added a shipment”, “Store A received shipment”, “New employee joined”, “Event created”)
- **Roles & permissions:** Owner (full access), Admin (manage company), Manager (manage store/events), Staff (limited). Settings and Metrics only for Owner/Admin.

All data is isolated by `companyId` (multi-tenant).

## Routes

- `/` – redirects to dashboard or login
- `/login`, `/signup` – auth
- `/dashboard` – main dashboard
- `/employees`, `/shipments`, `/stores`, `/events` – CRUD and lists

## API

- `POST /api/auth/signup` – body: `{ email, password, name, companyName }`
- `POST /api/auth/login` – body: `{ email, password }`
- `GET /api/auth/me` – current user (cookie)
- `POST /api/auth/logout`
- `GET/POST /api/employees`, `GET/PATCH/DELETE /api/employees/[id]`
- `GET/POST /api/stores`, `GET/PATCH/DELETE /api/stores/[id]`
- `GET/POST /api/shipments`, `GET/PATCH/DELETE /api/shipments/[id]`
- `GET/POST /api/events`, `GET/PATCH/DELETE /api/events/[id]`
- `GET /api/dashboard` – stats and recent data

All authenticated API routes require the session cookie (set on login/signup).
# enterprise
