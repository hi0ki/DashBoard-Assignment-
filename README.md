# 🚀 InfinitiveByte Dashboard Assignment

This project is a full-stack dashboard application built with Next.js, TypeScript, and Tailwind CSS. It is designed to manage and display statistics related to agencies and contacts, featuring secure authentication via Clerk and data persistence using Prisma with a Neon PostgreSQL database.

## ✨ Features

* **Secure Authentication:** User sign-up and sign-in are handled securely using Clerk.
* **Data Import/Seeding:** Bulk import utility to seed the database with initial agency and contact data from CSV files.
* **Dashboard Statistics:** Displays key metrics like total contacts, tracked agencies, and daily API usage limits.
* **User Profile & Usage Tracking:** Stores and manages individual user profiles and tracks their daily credit consumption.
* **Daily Reset Cron Job:** Includes an API route to reset daily usage credits for all users.

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript, JavaScript, JSX
* **Database:** Neon (PostgreSQL)
* **ORM:** Prisma
* **Authentication:** Clerk
* **Styling:** Tailwind CSS

## 📋 Getting Started

### Prerequisites

1.  **Node.js:** (v18.x or later)
2.  **Neon Account:** Create a free account and get your PostgreSQL connection string.
3.  **Clerk Account:** Create a free account and obtain your Publishable and Secret Keys.

### Installation

1.  Clone the repository:
    ```bash
    git clone [repository URL]
    cd DashBoard-Assignment-
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Environment Variables

Create a file named `.env.local` in the root of the project and populate it with your credentials:

```env
# Database Connection String from Neon
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Clerk Keys (Use test keys for local development)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Required for local development with test keys
NEXT_PUBLIC_CLERK_API_URL="[https://api.clerk.dev](https://api.clerk.dev)" 
CLERK_TRUST_HOST=true
CLERK_COOKIE_DOMAIN="localhost"

# Optional: Custom sign-up/sign-in URLs
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/auth/register"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/auth/login"