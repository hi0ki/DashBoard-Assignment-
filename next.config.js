/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@clerk/nextjs']
  },
  env: {
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/auth/register',
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/auth/login'
  }
}

module.exports = nextConfig