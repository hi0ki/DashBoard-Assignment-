# 🚀 MyDashboardApp

A modern, high-performance dashboard application built with **Next.js 16**, **Clerk Authentication**, and **Prisma**.

🔗 **Live Demo**: [mydashboard-hi0ki.vercel.app](https://mydashboard-hi0ki.vercel.app)

## ✨ Features

- **🔐 Secure Authentication**: Integrated with Clerk for seamless Login/Register flows.
- **🎨 "Pro" Aesthetic**: Clean Interface with Zinc/Dark themes and premium gradients.
- **📊 Real-time Dashboard**: Track agencies, contacts, and daily credit usage.
- **👥 Contact Management**: View recently unlocked profiles with smart "Recently Viewed" sorting.
- **⚡ Modern Tech Stack**: Fast, responsive, and type-safe.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + Lucide Icons
- **Auth**: Clerk (Custom Auth Pages)
- **Database**: PostgreSQL with Prisma ORM

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory. Here is an example configuration:

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
   Generate the client and seed the database with initial data:
   ```bash
   npx prisma generate
   npx tsx scripts/import-data.ts
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it.

## 📜 Useful Commands

- `npm run dev` - Start the development server
- `npx prisma studio` - Open the database GUI to view/edit data