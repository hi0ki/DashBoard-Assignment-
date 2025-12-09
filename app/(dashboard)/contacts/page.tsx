 'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/UI";
import { Button } from "@/components/UI";
import { 
  Eye, 
  EyeOff, 
  Users, 
  UserCheck, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  agency?: string;
  position?: string;
  department?: string;
  isViewed: boolean;
  viewedAt?: string;
}

interface Pagination {
  page: number;
  pages: number;
  total: number;
  limit: number;
}

export default function ContactsPage() {
  const { user: clerkUser } = useUser();
  const [activeTab, setActiveTab] = useState<'viewed' | 'unviewed'>('unviewed');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [remaining, setRemaining] = useState(50);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pages: 1,
    total: 0,
    limit: 15
  });

  const loadContacts = async (tab: 'viewed' | 'unviewed', page: number = 1) => {
    if (!clerkUser?.id) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        viewed: (tab === 'viewed').toString()
      });
      
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      const response = await fetch(`/api/contacts?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setContacts(data.contacts);
        setPagination(data.pagination);
        // Always update remaining from API response
        if (data.remaining !== undefined) {
          setRemaining(data.remaining);
        }
      } else {
        console.error('Error loading contacts:', data.error);
        setContacts([]);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load user credits directly from database
  const loadUserCredits = async () => {
    if (!clerkUser?.id) return;
    
    try {
      const response = await fetch('/api/credits');
      const data = await response.json();
      
      if (response.ok) {
        setRemaining(data.remaining);
      }
    } catch (error) {
      console.error('Error loading user credits:', error);
    }
  };

  // Load credits immediately when user is available
  useEffect(() => {
    if (clerkUser?.id) {
      loadUserCredits();
    }
  }, [clerkUser?.id]);

  const handleViewContact = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}/view`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setRemaining(data.remaining || 0);
        
        // Update the contact in the current list to show as viewed
        setContacts(prevContacts => 
          prevContacts.map(contact => 
            contact.id === contactId 
              ? { ...contact, isViewed: true, viewedAt: data.viewedAt }
              : contact
          )
        );
        setError(''); // Clear any previous errors
      } else {
        setError(data.error || 'Failed to mark contact as viewed');
      }
    } catch (error) {
      console.error('Error viewing contact:', error);
      setError('Network error occurred');
    }
  };

  const handleTabChange = (tab: 'viewed' | 'unviewed') => {
    setActiveTab(tab);
    setCurrentPage(1);
    setError(''); // Clear error when switching tabs
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadContacts(activeTab, page);
  };

  // Load contacts and credits when tab, user, or search changes
  useEffect(() => {
    if (!clerkUser?.id) return;
    
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadContacts(activeTab, 1);
      // Also load credits to ensure we have the latest remaining count
      loadUserCredits();
    }, search ? 500 : 0); // Debounce only for search

    return () => clearTimeout(timer);
  }, [clerkUser, activeTab, search]);

  const totalPages = pagination.pages;
  const startIndex = (currentPage - 1) * pagination.limit;
  const endIndex = Math.min(startIndex + pagination.limit, pagination.total);

  if (loading && contacts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
          <p className="text-gray-500 dark:text-gray-400">Access contact details of your network</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, pagination.total)} of {pagination.total} contacts (Page {currentPage} of {totalPages})
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-col items-end">
            <span className={`text-sm font-medium px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm ${remaining < 10 ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>
              Credits Remaining: {remaining}
            </span>
            {remaining === 0 && (
              <div className="mt-3 w-full max-w-sm text-right">
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">You have used all your credits</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Credits reset daily at 00:00 AM. To continue revealing contacts now, upgrade your plan.</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center">
                      <Link href="/profile">
                        <a className="inline-block px-3 py-1.5 bg-primary-600 text-white text-xs rounded-md hover:bg-primary-500">Upgrade Plan</a>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <span className="text-xs text-red-600 mt-1 max-w-[200px] text-right">
                {error}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        <button
          onClick={() => handleTabChange('unviewed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'unviewed'
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Users size={16} />
          Unviewed
        </button>
        <button
          onClick={() => handleTabChange('viewed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'viewed'
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <UserCheck size={16} />
          Viewed
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading contacts...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {activeTab === 'viewed' ? 'No contacts viewed yet' : 'No unviewed contacts available'}
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => {
                  const isViewed = contact.isViewed;
                  return (
                    <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {contact.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {contact.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {contact.department}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {isViewed ? (
                            <div className="space-y-1">
                              <p className="text-gray-900 dark:text-white select-all">{contact.email}</p>
                              <p className="text-gray-500 dark:text-gray-400 select-all">{contact.phone}</p>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              <span className="tracking-widest">••••••••••••••••</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button 
                          variant={isViewed ? "outline" : "primary"}
                          className={`text-xs px-3 py-1.5 h-auto ${isViewed ? 'cursor-default opacity-75' : ''}`}
                          onClick={() => handleViewContact(contact.id)}
                          disabled={isViewed || remaining <= 0}
                        >
                          {isViewed ? (
                            <>
                              <EyeOff size={14} className="mr-1.5" />
                              Revealed
                            </>
                          ) : (
                            <>
                              <Eye size={14} className="mr-1.5" />
                              View
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "primary" : "outline"}
                    onClick={() => handlePageChange(pageNum)}
                    className="w-10 h-10 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-gray-500">...</span>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(totalPages)}
                    className="w-10 h-10 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </Card>
      )}
      
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-600 mt-4">
        <AlertTriangle size={12} />
        <span>Clicking "View" will consume 1 credit and move contact to viewed section.</span>
      </div>
    </div>
  );
}