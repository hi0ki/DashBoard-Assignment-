'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../../../components/UI';
import { useUser } from '@clerk/nextjs';
import { Users, Building2, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, change, changeType, icon: Icon, subtext }: any) => {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';
  
  return (
    <Card className="p-6 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">{title}</span>
        <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
          <Icon size={20} />
        </div>
      </div>
      
      <div>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</h3>
        <div className="flex items-center text-sm">
          {change && (
            <span className={`font-medium ${
              isPositive ? 'text-green-600 dark:text-green-400' : 
              isNegative ? 'text-red-600 dark:text-red-400' : 'text-gray-500'
            } mr-2`}>
              {change}
            </span>
          )}
          <span className="text-gray-500 dark:text-gray-400">{subtext}</span>
        </div>
      </div>
    </Card>
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

export default function Dashboard() {
  const { user: clerkUser } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!clerkUser?.id) return;
      
      try {
        // Try to get token from Clerk for server-side validation
        let headers: HeadersInit = {};
        try {
          const token = await (window as any).__clerk?.session?.getToken?.();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        } catch (e) {
          console.log('Could not get Clerk token, relying on cookies');
        }

        const response = await fetch('/api/dashboard/stats', { headers });
        if (!response.ok) {
          const text = await response.text();
          console.error('Dashboard stats response error:', response.status, text);
          throw new Error(`Failed to fetch dashboard stats: ${response.status} ${text}`);
        }
        
        const data: DashboardStats = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setErrorMsg((error as Error)?.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [clerkUser?.id]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome back, {clerkUser?.firstName && clerkUser?.lastName 
            ? `${clerkUser.firstName} ${clerkUser.lastName}` 
            : clerkUser?.firstName || clerkUser?.username || 'User'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard 
          title="Tracked Agencies" 
          value={loading || !stats ? "..." : stats.agencies} 
          change="+4" 
          changeType="positive"
          subtext="new regions"
          icon={Building2} 
        />
        <StatCard 
          title="Total Contacts" 
          value={loading || !stats ? "..." : stats.contacts.toLocaleString()} 
          change="+150" 
          changeType="positive"
          subtext="available leads"
          icon={Users} 
        />
        <StatCard 
          title="Daily API Usage" 
          value={loading || !stats ? "..." : `${stats.usage.count}/${stats.usage.total}`} 
          change="Resets Daily" 
          changeType="neutral"
          subtext="view limit"
          icon={TrendingUp} 
        />
      </div>
      {errorMsg && (
        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700">
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      {/* Usage Bar */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Credits Consumption</h3>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 dark:bg-blue-900 dark:text-blue-200">
                Used
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
                {stats ? Math.min(100, Math.round((stats.usage.count / stats.usage.total) * 100)) : 0}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100 dark:bg-gray-700">
            <div 
              style={{ width: stats ? `${Math.min(100, (stats.usage.count / stats.usage.total) * 100)}%` : '0%' }} 
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${stats && stats.usage.count >= stats.usage.total ? 'bg-red-500' : 'bg-primary-500'}`}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            {!stats ? 'Loading...' : stats.usage.count >= stats.usage.total 
              ? "You have reached your daily limit. Please come back tomorrow." 
              : `You can view details for ${stats.usage.remaining} more contacts today.`}
          </p>
        </div>
      </Card>
    </div>
  );
}