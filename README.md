# EquipSync

This is a full-stack equipment maintenance scheduler website.

## Stack

- Frontend: React + Vite + Tailwind CSS + Lucide
- Backend: Node.js + Express
- Database: Prisma + MySQL

## One-time setup (Windows)

1. Install [Node.js](https://nodejs.org/) 20+ and MySQL.
2. Create the database:

```sql
CREATE DATABASE IF NOT EXISTS equipsync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Copy env and set your MySQL user/password:

```powershell
copy .env.example server\.env
```

Edit `server\.env`:

```
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/equipsync"
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

4. Install, migrate, seed, start:

```powershell
cd server
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

5. Check the API: [http://localhost:5000/api/health](http://localhost:5000/api/health)

6. In a **second** PowerShell window, start the website:

```powershell
cd D:\Equipment_Maintenance_Scheduler\client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in Brave, Chrome, or Edge. Keep the server running while you use the site.

## Role headers (no login)

Send these on every request:

| Header | Values |
|---|---|
| `X-Role` | `Admin`, `Manager`, or `Technician` |
| `X-Technician-Name` | Technician display name, required in Technician mode |

- Admin: full access, including delete equipment
- Manager: add/edit equipment, complete any task
- Technician: see assigned equipment/tasks, complete only assigned tasks

## Useful endpoints

- `GET /api/equipment`
- `POST /api/equipment` (Admin, Manager)
- `PUT /api/equipment/:id` (Admin, Manager)
- `DELETE /api/equipment/:id` (Admin)
- `GET /api/maintenance?upcoming=true`
- `PATCH /api/maintenance/:id/complete`
- `GET /api/dashboard/stats`
- `GET /api/search?q=cnc`
- `GET /api/technicians`

When `fixedInterval` is true, completing a task recalculates `nextMaintenanceDate` and creates the next scheduled record. Expiry dates only add `isExpired` / `isExpiringSoon` flags — status is not auto-changed.
