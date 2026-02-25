# FindMyGym

A location-based web application that helps users discover, compare, and choose the best gyms nearby. Built with Next.js 14, TailwindCSS, Prisma, and SQLite.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)

---

## Features

### Core Discovery
- **Search** — Find gyms by name with real-time filtering
- **Filter** — By gym type (Commercial, CrossFit, Yoga, Women Only, 24/7, Budget) and price range
- **Sort** — By rating, name, price, or newest
- **Pagination** — Paginated results grid

### Gym Profiles
- **Photo Gallery** — Hero image with side thumbnails
- **Amenities** — Visual grid with check icons
- **Operating Hours** — Weekly schedule with today highlighted and open/closed status
- **Membership Plans** — Pricing cards with features and "Most Popular" badge
- **Group Classes** — Schedule table with instructor, day, time, capacity
- **Reviews & Ratings** — Star distribution chart, category breakdown (cleanliness, equipment, staff, value), full review list with verified badges
- **Directions** — Google Maps integration for navigation

### Compare
- **Side-by-Side** — Select up to 3 gyms and compare type, rating, price, and every amenity in a table
- **Best Value Highlighting** — Best rating and lowest price highlighted in green

### Auth (UI Ready)
- **Login** — Email/password + Google OAuth layout
- **Signup** — Registration form with validation

### Additional Pages
- **Favorites** — Placeholder (requires auth integration)
- **Landing Page** — Hero section, category browse, featured gyms, how-it-works, CTA

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | TailwindCSS |
| **Icons** | Lucide React |
| **Database** | SQLite (via Prisma ORM) |
| **ORM** | Prisma 5.22 |
| **Auth (UI)** | NextAuth.js (scaffolded) |

---

## Project Structure

```
seazero-workshop/
├── prisma/
│   ├── schema.prisma          # 16 models — full database schema
│   ├── seed.ts                # Seeds 20 gyms, 8 users, 100+ reviews, etc.
│   └── dev.db                 # SQLite database file
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout with Header + Footer
│   │   ├── globals.css        # Design system CSS variables
│   │   ├── gyms/
│   │   │   ├── page.tsx       # Gym listing with filters & search
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Gym detail page
│   │   ├── compare/
│   │   │   └── page.tsx       # Side-by-side gym comparison
│   │   ├── favorites/
│   │   │   └── page.tsx       # Favorites (auth-gated)
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   └── api/
│   │       └── gyms/
│   │           ├── route.ts          # GET /api/gyms (list + filters)
│   │           ├── featured/route.ts # GET /api/gyms/featured
│   │           └── [slug]/route.ts   # GET /api/gyms/:slug
│   ├── components/
│   │   ├── Header.tsx         # Sticky header with mobile menu
│   │   ├── Footer.tsx         # 4-column footer
│   │   ├── GymCard.tsx        # Reusable gym card component
│   │   └── StarRating.tsx     # Star rating display
│   └── lib/
│       ├── prisma.ts          # Prisma client singleton
│       └── utils.ts           # Helpers: cn, formatPrice, isGymOpen, etc.
├── mygym.json                 # Task database — 7 phases, 96 subtasks with tests
├── mygym-loader.ts            # CLI to query tasks and run tests
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

---

## Database Schema

16 Prisma models covering the full application:

| Model | Purpose |
|---|---|
| `User` | User profiles with fitness preferences |
| `Account` / `Session` / `VerificationToken` | NextAuth.js auth models |
| `Gym` | Core gym data (name, location, type, price range) |
| `GymHour` | Operating hours per day |
| `GymAmenity` | Amenities with icon names |
| `GymPhoto` | Photo gallery with ordering |
| `Membership` | Plans with pricing and features |
| `Review` | Ratings (overall + 4 categories) with text |
| `ReviewHelpful` / `ReviewReport` | Review interactions |
| `Favorite` | User-gym bookmarks |
| `Booking` | Trial visits and class bookings |
| `GymClass` | Group class schedule |
| `CheckIn` | GPS-verified gym visits |
| `Deal` | Promotional offers |
| `ProjectTask` | Development task tracker (meta) |

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **npm**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AftabOC/seazero-workshop.git
cd seazero-workshop

# 2. Install dependencies
npm install

# 3. Set up the database
npx prisma db push
npx prisma generate

# 4. Seed the database (20 gyms, 8 users, 100+ reviews, classes, etc.)
npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed.ts

# 5. Start the development server
npm run dev
```

Open **http://localhost:3000** to see the app.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/gyms` | List gyms — supports `q`, `type`, `priceRange`, `sort`, `page`, `limit` |
| `GET` | `/api/gyms/featured` | Top 6 rated gyms |
| `GET` | `/api/gyms/:slug` | Full gym detail with hours, amenities, photos, plans, reviews, classes |

### Example

```bash
# Search for yoga studios, sorted by rating
curl "http://localhost:3000/api/gyms?type=yoga&sort=rating"

# Get featured gyms
curl "http://localhost:3000/api/gyms/featured"

# Get gym detail
curl "http://localhost:3000/api/gyms/iron-paradise-fitness"
```

---

## Task Database (mygym.json)

The project includes a structured task database with **7 phases, 23 tasks, and 96 subtasks**, each with built-in test definitions. Use the CLI to track progress:

```bash
# View overall progress
npx ts-node --compiler-options '{"module":"commonjs"}' mygym-loader.ts summary

# View phase details
npx ts-node --compiler-options '{"module":"commonjs"}' mygym-loader.ts phase P1

# Get next task to implement
npx ts-node --compiler-options '{"module":"commonjs"}' mygym-loader.ts next

# Mark a subtask as done
npx ts-node --compiler-options '{"module":"commonjs"}' mygym-loader.ts update P1-T1-S1 done
```

### Phases

| Phase | Name | Sprint | Status |
|---|---|---|---|
| P1 | Foundation & Core Discovery | 1 | In Progress |
| P2 | Gym Profiles & Detail Pages | 2 | In Progress |
| P3 | Authentication & User Profiles | 2 | Scaffolded |
| P4 | Ratings & Reviews | 3 | Pending |
| P5 | Booking & Contact | 3 | Pending |
| P6 | Smart Compare & Ranking | 4 | Pending |
| P7 | Engagement & Growth | 4 | Pending |

---

## Seeded Data Summary

| Table | Records |
|---|---|
| Users | 8 |
| Gyms | 20 |
| Gym Hours | 140 |
| Amenities | 165 |
| Memberships | 80 |
| Photos | 83 |
| Reviews | 105 |
| Classes | 74 |
| Project Tasks | 96 |

---

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## License

MIT

---

Built with ❤️ for the SeaZero Workshop
