'use client';

import React, { useState, useEffect } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/UI';
import { APP_NAME } from '../../../constants';
import { Sun, Moon, LogIn } from 'lucide-react';

export default function Login() {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) return;

    try {
      setLoading(true);
      setError('');

      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard'
      });
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err?.errors?.[0]?.message || 'Sign in failed. Please try again.');
      setLoading(false);
    }
  };

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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-4 tracking-tight">
            {APP_NAME}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            Welcome back! Sign in to continue
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 shadow-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
              <LogIn size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              Sign In
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Access your dashboard and continue where you left off
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm text-center mb-6 border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Error
              </div>
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || !isLoaded}
            className="w-full flex items-center justify-center gap-4 px-6 py-4 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-blue-500/25"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-6 h-6 bg-white rounded-lg p-1">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-center">
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
              <span className="px-4 text-sm text-zinc-500 dark:text-zinc-500 font-medium">or</span>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
            </div>

            <a
              href="/auth/register"
              className="w-full text-sm font-semibold py-3 px-4 rounded-xl border-2 border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:hover:bg-green-900/20 transition-all duration-200 block text-center"
            >
              Don't have an account? Create one here
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center leading-relaxed">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}