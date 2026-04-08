# 🌿 GoHigher — Kampala Sustainability Platform

A production-ready civic-tech web application for waste reporting, garbage collection scheduling, green marketplace, and environmental education — built for Kampala, Uganda.

## 🛠 Tech Stack

| Layer         | Technology                                   |
| ------------- | -------------------------------------------- |
| Frontend      | Next.js 14 (App Router) + TypeScript         |
| Styling       | Tailwind CSS + Google Fonts (Inter + Inter)  |
| Backend       | Appwrite (Auth, Database, Storage, Realtime) |
| Charts        | Recharts                                     |
| AI            | Claude API (Anthropic)                       |
| Notifications | react-hot-toast                              |

## 🎯 Features

- **Authentication** — Register/Login/Logout with role-based access (citizen, admin, vendor)
- **Waste Reports** — Create, view, delete reports with image upload + real-time status updates
- **Garbage Requests** — Schedule pickups with live status tracker
- **Hotspot Map** — Auto-aggregated waste hotspots by location with severity levels
- **Green Marketplace** — Vendors list eco products; citizens browse and contact
- **Education Hub** — Articles & guides; admins/vendors can publish
- **AI Assistant** — Powered by Claude API with sustainability context
- **Contact System** — Citizens submit messages; admins reply
- **Admin Dashboard** — Manage all reports, requests, and messages

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo>
cd gohigher
npm install
```

### 2. Set Up Appwrite

1. Create a free account at [cloud.appwrite.io](https://cloud.appwrite.io)
2. Create a new project (note the **Project ID**)
3. Create a **Web platform** for your domain (e.g. `localhost`)

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id-here
NEXT_PUBLIC_APPWRITE_DATABASE_ID=gohigher-db
NEXT_PUBLIC_APPWRITE_STORAGE_ID=gohigher-storage
```

### 4. Run the Database Setup Script

```bash
# Install node-appwrite for the script
npm install -D node-appwrite

# Set your API key (Server key from Appwrite console → Settings → API Keys)
APPWRITE_PROJECT_ID=your-project-id APPWRITE_API_KEY=your-server-key node scripts/setup-appwrite.js
```

This will automatically create:

- Database: `gohigher-db`
- Storage bucket: `gohigher-storage`
- All 7 collections with correct attributes

### 5. Create Admin User

1. Register normally via `/register`
2. In Appwrite Console → Databases → Users collection
3. Find your user document and change `role` from `citizen` to `admin`

### 6. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Main dashboard with charts
│   ├── report/             # Waste reporting (CRUD + image upload)
│   ├── requests/           # Garbage pickup scheduling
│   ├── hotspots/           # Waste hotspot rankings
│   ├── marketplace/        # Green product marketplace
│   ├── education/          # Articles & eco guides
│   ├── ai/                 # Claude AI chat assistant
│   ├── contact/            # Citizen → authority messaging
│   ├── admin/              # Admin management panel
│   ├── login/              # Authentication
│   └── register/           # Registration with role selection
├── components/
│   ├── layout/             # AppShell, Sidebar, AuthProvider
│   ├── ui/                 # Reusable Button, Input, Card, etc.
│   └── charts/             # Recharts dashboard visualizations
├── hooks/
│   ├── useAuth.ts          # Auth context + user state
│   ├── useReports.ts       # Reports with real-time subscription
│   └── useRequests.ts      # Garbage requests hook
└── lib/
    ├── appwrite.ts         # Client, DB, Storage setup
    ├── auth.ts             # Register, login, logout, getCurrentUser
    ├── reports.ts          # Report CRUD + file upload
    └── services.ts         # GarbageRequests, Hotspots, Products, Articles, Messages
```

## 🔐 User Roles

| Role      | Capabilities                                                                           |
| --------- | -------------------------------------------------------------------------------------- |
| `citizen` | Report waste, request pickups, browse marketplace, contact authorities                 |
| `vendor`  | All citizen features + list/manage products + publish articles                         |
| `admin`   | All features + update report/request statuses + reply to messages + access Admin Panel |

## ⚡ Real-Time Features

Reports use Appwrite Realtime subscriptions — when an admin updates a report status, all connected citizens see the change instantly without page refresh.

## 🗺️ Hotspot Logic

When a citizen submits a report with a location:

1. A hotspot record for that location is created or incremented
2. Severity is auto-calculated: `min(ceil(report_count / 3), 5)`
3. Level 1 = Low → Level 5 = Emergency

## 📊 Charts (Mock Data)

The dashboard includes 3 charts with representative Uganda waste data:

- Monthly waste volume by type (bar chart)
- Carbon emissions trend (line chart)
- Waste composition breakdown (pie chart)

Replace `src/components/charts/DashboardCharts.tsx` with real data from your backend or analytics APIs.

## 🤖 AI Assistant

The AI page connects to the Anthropic Claude API with a GoHigher-specific system prompt. The API key must be configured server-side for production. For the included implementation, requests go through the browser — for production, create a Next.js API route proxy.

## 🚢 Deployment

```bash
npm run build
npm start
```

Deploy to Vercel:

```bash
npx vercel --prod
```

Set environment variables in your Vercel dashboard.

## 📜 License

MIT — Built for Kampala 🇺🇬
# gohigher
# gohigher-kampala
