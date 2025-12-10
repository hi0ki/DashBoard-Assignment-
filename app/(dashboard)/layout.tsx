'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  UserCircle, 
  LogOut, 
  Sun, 
  Moon,
  Menu,
  X
} from 'lucide-react';
import { APP_NAME } from '../../constants';

const SidebarItem = ({ href, icon: Icon, label, onClick }: { href: string, icon: any, label: string, onClick?: () => void }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-medium' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [dbProfileImage, setDbProfileImage] = useState<string>('');

  // Handle Dark Mode - MUST be before conditional returns
  useEffect(() => {
    // Check system or saved preference
    const stored = localStorage.getItem('theme');
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (stored === 'dark' || (!stored && isSystemDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Clear any cached user data
      setHasCheckedAuth(false);
      // Force redirect to auth page
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback redirect
      window.location.href = '/auth/register';
    }
  };

  // Better authentication check with proper timing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoaded) {
      if (isSignedIn && user) {
        // User is authenticated, proceed
        setHasCheckedAuth(true);
        setIsInitializing(false);
      } else if (!isSignedIn && !hasCheckedAuth) {
        // Give extra time for authentication to complete (especially for new users)
        timeoutId = setTimeout(() => {
          if (!isSignedIn) {
            setHasCheckedAuth(true);
            setIsInitializing(false);
              router.replace('/auth/register');
          }
        }, 5000); // Extended to 5 seconds
      } else if (!isSignedIn && hasCheckedAuth) {
        // User is definitely not authenticated
        router.replace('/auth/register');
      }
    } else {
      // Still loading Clerk
      setIsInitializing(true);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoaded, isSignedIn, user, hasCheckedAuth, router]);

  // Additional safety check for user changes
  useEffect(() => {
    if (isLoaded && hasCheckedAuth) {
      if (user) {
        setIsInitializing(false);
      } else if (!isSignedIn) {
        router.replace('/auth/register');
      }
    }
  }, [user, isLoaded, isSignedIn, hasCheckedAuth, router]);

  // Load profile image from database
  useEffect(() => {
    const loadProfileImage = async () => {
      if (user) {
        try {
          const response = await fetch('/api/profile');
          if (response.ok) {
            const profile = await response.json();
            if (profile?.imageUrl) {
              setDbProfileImage(profile.imageUrl);
            }
          }
        } catch (error) {
          console.error('Error loading profile image:', error);
        }
      }
    };

    loadProfileImage();
  }, [user]);

  // Show loading while checking authentication
  if (!isLoaded || isInitializing || (!user && !hasCheckedAuth)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {!isLoaded ? 'Loading authentication...' : 'Setting up your dashboard...'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            This may take a few moments. Thank you for your patience.
          </p>
        </div>
      </div>
    );
  }

  // Final check - if we reach here without a user, something went wrong
  if (!user || !isSignedIn) {
    // Avoid calling router.replace during render (can be undefined during SSR
    // and causes runtime errors). A redirect is already handled in the
    // authentication useEffect above. Render a spinner while auth settles.
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {/* Logo Icon */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">∞</span>
            </div>
            {/* Brand Text */}
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                MyDashboard
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                Dashboard
              </span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setSidebarOpen(false)} />
          <SidebarItem href="/agencies" icon={Building2} label="Agencies" onClick={() => setSidebarOpen(false)} />
          <SidebarItem href="/contacts" icon={Users} label="Contacts" onClick={() => setSidebarOpen(false)} />
          <SidebarItem href="/profile" icon={UserCircle} label="Profile" onClick={() => setSidebarOpen(false)} />
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-8"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <Menu size={24} />
          </button>

          <div className="ml-auto flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.firstName || user?.username || 'User'}
              </span>
              <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/50 overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-sm">
                {dbProfileImage ? (
                   <img src={dbProfileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : user?.imageUrl ? (
                   <img src={user.imageUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg">
                    {user?.firstName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}