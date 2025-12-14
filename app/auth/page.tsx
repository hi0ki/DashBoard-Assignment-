'use client';

import React, { useState, useEffect } from 'react';
import { APP_NAME } from '../../constants';
import { Sun, Moon, UserPlus, LogIn, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function Auth() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#09090b] relative transition-colors duration-300 overflow-hidden">
      {/* Background Pattern - Square Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] dark:opacity-[0.1]"
        style={{
          backgroundImage: `linear-gradient(#CCCFD6 1px, transparent 1px), linear-gradient(to right, #CCCFD6 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}>
      </div>

      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 shadow-md z-50"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="w-full max-w-md relative z-10 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-4 tracking-tight">
            {APP_NAME}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg font-medium">
            Welcome! Choose how to continue
          </p>
        </div>

        <div className="space-y-6">
          <Link href="/auth/register" className="block group">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <UserPlus size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Create Account</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                    New to {APP_NAME}? Join us and start your journey
                  </p>
                </div>
                <div className="text-green-500 group-hover:translate-x-1 transition-transform duration-300">
                  <ChevronRight size={24} />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/auth/login" className="block group">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <LogIn size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Sign In</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                    Welcome back! Access your dashboard
                  </p>
                </div>
                <div className="text-blue-500 group-hover:translate-x-1 transition-transform duration-300">
                  <ChevronRight size={24} />
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium tracking-wide uppercase">
            Secure authentication powered by Clerk
          </p>
        </div>
      </div>
    </div>
  );
}