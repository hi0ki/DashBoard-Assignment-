
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function Home() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (isLoaded && !hasRedirected) {
      setHasRedirected(true);
      
      if (isSignedIn && user) {
        // User is authenticated, go to dashboard
        router.replace('/dashboard');
      } else {
        // User is not authenticated, go to unified auth page
        router.replace('/auth');
      }
    }
  }, [isLoaded, isSignedIn, user, router, hasRedirected]);

  // Fallback redirect after 5 seconds if auth check takes too long
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasRedirected) {
        setHasRedirected(true);
        router.replace('/auth');
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [hasRedirected, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}

