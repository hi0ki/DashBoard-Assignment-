# MyDashboardApp

MyDashboardApp is a modern dashboard built with Next.js 16, Clerk, and Prisma. It allows you to manage agencies and contacts efficiently with a clean, professional interface and daily credit tracking.

Live Demo: [mydashboard-hi0ki.vercel.app](https://mydashboard-hi0ki.vercel.app)

## Features

- **Authentication**: Integrated with Clerk for seamless Login/Register flows.
- **Design**: Clean "Pro" interface with Dark mode support.
- **Dashboard**: Track agencies, contacts, and usage stats in real-time.
- **Contact Management**: View unlocked profiles with smart sorting.

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS
- **Auth**: Clerk
- **Database**: PostgreSQL with Prisma

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   # Database (Neon/PostgreSQL)
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_EXAMPLE123..."
   CLERK_SECRET_KEY="sk_test_EXAMPLE123..."
   
   # Clerk Routes
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/register
   ```

3. **Database Setup**
   Generate the client and seed the database:
   ```bash
   npx prisma generate
   npx tsx scripts/import-data.ts
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it.

## Useful Commands

- `npm run dev` - Start the development server
- `npx prisma studio` - Open the database GUI