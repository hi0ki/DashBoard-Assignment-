import { authMiddleware } from "@clerk/nextjs";

// This middleware runs before every request to protect your routes
export default authMiddleware({
  // Routes that don't require authentication
  publicRoutes: [
    "/",
    "/api/webhook",
    "/api/cron/reset-daily-usage"
  ],
  
  // Routes that are completely ignored by Clerk
  ignoredRoutes: [
    "/api/webhook",
    "/api/cron/reset-daily-usage"
  ],
  
  // After sign in, redirect to dashboard
  afterAuth(auth, req, evt) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/auth/login', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return Response.redirect(signInUrl);
    }
    
    // If the user is signed in and trying to access a protected route, allow them through
    return;
  },
});

export const config = {
  // Match all routes except static files and Next.js internals
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)", 
    "/", 
    "/(api|trpc)(.*)"
  ],
};