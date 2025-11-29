'use client'

import { useEffect, useState } from 'react';
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
  const [limitError, setLimitError] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

  const loadContacts = async (tab: 'viewed' | 'unviewed', page: number = 1) => {
    if (!clerkUser?.id) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
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
        setRemaining(data.remaining || 50);
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

  const handleViewContact = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}/view`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setRemaining(data.remainingViews || 0);
        // Reload contacts to update the lists
        loadContacts(activeTab, currentPage);
        setLimitError('');
      } else {
        setLimitError(data.error || 'Failed to mark contact as viewed');
      }
    } catch (error) {
      console.error('Error viewing contact:', error);
      setLimitError('Network error occurred');
    }
  };

  const handleTabChange = (tab: 'viewed' | 'unviewed') => {
    setActiveTab(tab);
    setCurrentPage(1);
    setLimitError('');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadContacts(activeTab, page);
  };

  // Load contacts when tab, user, or search changes
  useEffect(() => {
    if (!clerkUser?.id) return;
    loadContacts(activeTab, 1);
  }, [clerkUser, activeTab, search]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (clerkUser?.id) {
        setCurrentPage(1);
        loadContacts(activeTab, 1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  if (loading && contacts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage and view your contacts. You can view {remaining} new contacts today.
        </p>
      </div>

      {/* Error Message */}
      {limitError && (
        <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertTriangle size={20} />
            <span>{limitError}</span>
          </div>
        </Card>
      )}

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

      {/* Contacts List */}
      <div className="grid gap-4">
        {loading ? (
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading contacts...</p>
          </Card>
        ) : contacts.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              {activeTab === 'viewed' ? 'No contacts viewed yet' : 'No unviewed contacts available'}
            </div>
          </Card>
        ) : (
          contacts.map((contact) => (
            <Card key={contact.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {contact.name}
                    </h3>
                    {contact.isViewed && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <Eye size={12} className="mr-1" />
                        Viewed
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {contact.email && (
                      <div>
                        <span className="font-medium">Email:</span> 
                        <span className="ml-2">{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div>
                        <span className="font-medium">Phone:</span>
                        <span className="ml-2">{contact.phone}</span>
                      </div>
                    )}
                    {contact.agency && (
                      <div>
                        <span className="font-medium">Agency:</span> 
                        <span className="ml-2">{contact.agency}</span>
                      </div>
                    )}
                    {contact.position && (
                      <div>
                        <span className="font-medium">Position:</span> 
                        <span className="ml-2">{contact.position}</span>
                      </div>
                    )}
                  </div>

                  {contact.viewedAt && (
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Viewed on {new Date(contact.viewedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {!contact.isViewed && (
                  <Button
                    onClick={() => handleViewContact(contact.id)}
                    variant="outline"
                    className="ml-4"
                  >
                    <Eye size={16} className="mr-2" />
                    View Contact
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} contacts
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              variant="outline"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            <span className="px-3 py-1 text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              variant="outline"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}