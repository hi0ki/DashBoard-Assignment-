'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCircle,
  LogOut,
  Crown,
  Sun,
  Moon,
  Menu,
  X,
  BarChart3,
  Search,
  Bell
} from 'lucide-react';

const SidebarItem = ({ href, icon: Icon, label, onClick }: { href: string, icon: any, label: string, onClick?: () => void }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
        }`}
    >
      <Icon size={20} className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="relative z-10 font-medium">{label}</span>
    </Link>
  );
};

const ThemeToggle = ({ isDark, toggle }: { isDark: boolean, toggle: () => void }) => (
  <button
    onClick={toggle}
    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${isDark ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    aria-label="Toggle Dark Mode"
  >
    <span className="sr-only">Toggle Dark Mode</span>
    <span
      className={`${isDark ? 'translate-x-7 bg-gray-900' : 'translate-x-1 bg-white'
        } inline-block h-6 w-6 transform rounded-full transition-transform duration-300 shadow-md flex items-center justify-center`}
    >
      {isDark ? (
        <Moon size={14} className="text-blue-400" />
      ) : (
        <Sun size={14} className="text-orange-500" />
      )}
    </span>
  </button>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-white dark:bg-[#09090b] transition-colors duration-300 selection:bg-blue-500/30">

      {/* Background Pattern - Square Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.4] dark:opacity-[0.1]"
        style={{
          backgroundImage: `linear-gradient(#CCCFD6 1px, transparent 1px), linear-gradient(to right, #CCCFD6 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}>
      </div>

      {/* Top Header - Opaque */}
      <header className="fixed top-0 left-0 right-0 z-40 h-20 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between h-full px-4 lg:px-8">

          {/* Left Side: Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 dark:bg-white flex items-center justify-center shadow-lg transform hover:rotate-3 transition-transform duration-300">
                  <BarChart3 className="text-white dark:text-blue-600" size={28} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h2 className="text-2xl font-bold text-blue-700 dark:text-white transition-colors duration-300 tracking-tight">
                  Dashboard
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase">Analytics Pro</p>
              </div>
            </div>
          </div>

          {/* Right Side: Theme, Profile */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
              </button>

              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden md:block">
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
                <ThemeToggle isDark={isDark} toggle={toggleTheme} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Opaque */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 lg:z-30 w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800
        transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) shadow-[4px_0_24px_-2px_rgba(0,0,0,0.02)] lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:top-20 lg:h-[calc(100vh-5rem)] pt-6
      `}>
        <div className="flex flex-col h-full bg-transparent transition-colors duration-300">

          {/* Mobile Header in Sidebar (Close button) */}
          <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="font-bold text-gray-700 dark:text-gray-200">Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <div className="mb-6">
              <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Main</p>
              <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setSidebarOpen(false)} />
              <SidebarItem href="/agencies" icon={Building2} label="Agencies" onClick={() => setSidebarOpen(false)} />
              <SidebarItem href="/contacts" icon={Users} label="Contacts" onClick={() => setSidebarOpen(false)} />
            </div>

            <div>
              <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Account</p>
              <SidebarItem href="/profile" icon={UserCircle} label="Profile" onClick={() => setSidebarOpen(false)} />
              <SidebarItem href="/upgrade" icon={Crown} label="Upgrade Plan" onClick={() => setSidebarOpen(false)} />
            </div>
          </nav>

          {/* User Profile Section at Bottom */}
          <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-4 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer group">
              <div className="relative">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-600 shadow-sm group-hover:border-blue-500 transition-colors object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                    {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {user?.firstName || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-md hover:shadow-lg transform active:scale-95 transition-all duration-200"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pt-20 lg:ml-64 min-h-screen transition-all duration-300">
        <main className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}