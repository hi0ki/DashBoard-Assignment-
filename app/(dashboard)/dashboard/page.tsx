'use client';

// ... imports
import React, { useEffect, useState } from 'react';
import { Card } from '../../../components/UI';
import { Users, Building2, TrendingUp, Activity, Clock, CheckCircle, Mail, Briefcase, MapPin } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

const StatCard = ({ title, value, change, changeType, icon: Icon, subtext, color }: any) => {
  const isPositive = changeType === 'positive';
  // ... glowColor logic if needed

  return (
    <div className={`relative overflow-hidden p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/50 shadow-sm hover:shadow-lg transition-all duration-300 group`}>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl dark:from-white/5 opacity-50 group-hover:scale-150 transition-transform duration-500" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex-1">
          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium tracking-wide uppercase text-[10px]">{title}</span>
        </div>
        <div className={`p-3 rounded-xl ${color} shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">{value}</h3>
        <div className="flex items-center text-sm gap-2">
          {change && (
            <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${isPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
              {change}
            </span>
          )}
          <span className="text-gray-500 dark:text-gray-400 text-xs">{subtext}</span>
        </div>
      </div>
    </div>
  );
};

interface DashboardStats {
  contacts: number;
  agencies: number;
  usage: {
    count: number;
    total: number;
    remaining: number;
  };
}

interface Contact {
  id: string;
  name: string;
  email: string;
  position?: string;
  department?: string;
  agency?: string | { name: string };
}

export default function Dashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');

        if (!response.ok) {
          const text = await response.text();
          console.error('Dashboard stats response error:', response.status, text);
          throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
        }

        const data: DashboardStats = await response.json();
        setStats(data);

        // Fetch recent VIEWED contacts
        const contactsResponse = await fetch('/api/contacts?limit=4&viewed=true');
        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          setRecentContacts(contactsData.contacts || []);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setErrorMsg((error as Error)?.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const usagePercentage = stats ? Math.min(100, Math.round((stats.usage.count / stats.usage.total) * 100)) : 0;
  const isLimitReached = stats && stats.usage.count >= stats.usage.total;
  const remainingPercentage = 100 - usagePercentage;

  return (
    <div className="space-y-6">
      {/* Header with Gradient */}
      <div className="relative rounded-3xl overflow-hidden p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-2xl shadow-blue-900/20">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 mix-blend-overlay"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-blue-100 text-lg font-medium max-w-2xl">
            Welcome back, {user?.firstName || 'User'}! You have <span className="text-white font-bold">{stats?.usage.remaining || 0} credits</span> remaining today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Agencies"
          value={loading || !stats ? "..." : stats.agencies}
          change="+4"
          changeType="positive"
          subtext="tracked"
          icon={Building2}
          color="bg-blue-600"
        />
        <StatCard
          title="Total Contacts"
          value={loading || !stats ? "..." : stats.contacts.toLocaleString()}
          change="+150"
          changeType="positive"
          subtext="available"
          icon={Users}
          color="bg-purple-600"
        />
        <StatCard
          title="Credits Used"
          value={loading || !stats ? "..." : stats.usage.count}
          change={`of ${stats?.usage.total || 50}`}
          changeType="neutral"
          subtext="today"
          icon={Activity}
          color="bg-orange-600"
        />
        <StatCard
          title="Credits Left"
          value={loading || !stats ? "..." : stats.usage.remaining}
          change="Resets daily"
          changeType="neutral"
          subtext="available"
          icon={CheckCircle}
          color="bg-green-600"
        />
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          <strong className="font-semibold">Error:</strong> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Usage Card */}
        <div className="p-8 lg:col-span-2 rounded-2xl bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-500/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
                <TrendingUp className="text-white" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Daily Credit Usage</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Track your API consumption</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
              <Clock size={18} className="text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Resets at midnight
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-64 h-64">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${usagePercentage * 2.51} 251`}
                  className={isLimitReached ? 'text-red-500' : 'text-blue-600'}
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${isLimitReached ? 'text-red-600' : 'text-blue-600'}`}>
                  {usagePercentage}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Used</span>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Used Today</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats ? stats.usage.count : 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Remaining</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats ? stats.usage.remaining : 0}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Daily Limit</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {stats ? stats.usage.total : 50} credits
                  </span>
                </div>
                <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div className="h-full flex">
                    <div
                      style={{ width: `${usagePercentage}%` }}
                      className={`transition-all duration-500 ${isLimitReached ? 'bg-red-500' : 'bg-blue-600'
                        }`}
                    />
                    <div
                      style={{ width: `${remainingPercentage}%` }}
                      className="bg-green-500"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Used: {usagePercentage}%</span>
                  <span>Available: {remainingPercentage}%</span>
                </div>
              </div>

              {isLimitReached ? (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    ⚠️ You've reached your daily limit. Upgrade your plan or wait until tomorrow!
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    ✨ You have {stats?.usage.remaining || 0} credits remaining today
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Contacts Card */}
        <div className="p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-purple-500/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-600 shadow-lg shadow-purple-500/20">
                <Users className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Recent Contacts</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Recently viewed</p>
              </div>
            </div>
            <Link
              href="/contacts?tab=viewed"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : recentContacts.length > 0 ? (
            <div className="space-y-3">
              {recentContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar removed as requested */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                          {contact.name}
                        </p>
                        {contact.position && (
                          <span className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-500 font-medium shrink-0 ml-2">
                            {contact.position}
                          </span>
                        )}
                      </div>

                      {(contact.agency && typeof contact.agency === 'string' ? contact.agency : (contact.agency as any)?.name) && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin size={12} className="text-zinc-400" />
                          <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate">
                            {typeof contact.agency === 'string' ? contact.agency : (contact.agency as any)?.name}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <Mail size={12} className="text-zinc-400" />
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate">
                          {contact.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-400 dark:text-zinc-500">
              <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800/50 mb-3">
                <Users size={32} className="opacity-70" />
              </div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">You haven't viewed any contacts yet</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[200px] text-center">
                Unlock contact details to see them appear here
              </p>
              <Link
                href="/contacts"
                className="mt-4 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                Browse directory
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}