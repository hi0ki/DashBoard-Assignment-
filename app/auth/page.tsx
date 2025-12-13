'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI';
import { APP_NAME } from '../../constants';
import { Sun, Moon, UserPlus, LogIn } from 'lucide-react';

export default function Auth() {
  const [isDark, setIsDark] = useState(false);

  // Handle Dark Mode
  useEffect(() => {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-lg"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 mb-4">
            {APP_NAME}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Welcome! Choose how to continue</p>
        </div>

        <div className="space-y-6">
          <Card 
            className="p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:-translate-y-1"
          >
            <a href="/auth/register" className="block">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg">
                  <UserPlus size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Create Account</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    New to {APP_NAME}? Join us and start your journey
                  </p>
                </div>
                <div className="text-green-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          </Card>

          <Card 
            className="p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:-translate-y-1"
          >
            <a href="/auth/login" className="block">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg">
                  <LogIn size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Sign In</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Welcome back! Access your dashboard
                  </p>
                </div>
                <div className="text-blue-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            🔐 Secure authentication powered by Google
          </p>
        </div>
      </div>
    </div>
  );
}