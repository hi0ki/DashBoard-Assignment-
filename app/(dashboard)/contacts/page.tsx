'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button } from '../../../components/UI';
import { dataService } from '../../../services/dataService';
import { Contact } from '../../../types';
import { Eye, EyeOff, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function Contacts() {
  const { user: clerkUser } = useUser();
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [displayedContacts, setDisplayedContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [limitError, setLimitError] = useState('');
  const [remaining, setRemaining] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 50;

  // Calculate pagination values
  const totalPages = Math.ceil(allContacts.length / contactsPerPage);
  const startIndex = (currentPage - 1) * contactsPerPage;
  const endIndex = startIndex + contactsPerPage;

  useEffect(() => {
    if (!clerkUser?.id) return;
    
    // Load contacts sorted by view priority
    dataService.getContactsSorted(clerkUser.id).then(data => {
      setAllContacts(data);
      setLoading(false);
    });

    // Load persisted unlocked status and limit
    const unlocked = dataService.getUnlockedContactIds(clerkUser.id);
    setViewedIds(unlocked);
    
    const stats = dataService.getUsageStats(clerkUser.id);
    setRemaining(stats.total - stats.count);
  }, [clerkUser?.id]);

  // Update displayed contacts when page or contacts change
  useEffect(() => {
    const paginatedContacts = allContacts.slice(startIndex, endIndex);
    setDisplayedContacts(paginatedContacts);
  }, [allContacts, currentPage, startIndex, endIndex]);

  const handleViewContact = async (id: string) => {
    if (!clerkUser?.id) return;
    
    const result = await dataService.unlockContact(id, clerkUser.id);
    
    if (result.success) {
      const newViewed = new Set(viewedIds);
      newViewed.add(id);
      setViewedIds(newViewed);
      setRemaining(result.remaining);
      setLimitError('');
      
      // Refresh contacts to show new sort order
      const updatedContacts = await dataService.getContactsSorted(clerkUser.id);
      setAllContacts(updatedContacts);
    } else {
      setLimitError('Daily view limit reached. Upgrade to view more contacts.');
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
          <p className="text-gray-500 dark:text-gray-400">Access contact details of your network</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, allContacts.length)} of {allContacts.length} contacts (Page {currentPage} of {totalPages})
          </p>
        </div>
        
        <div className="flex flex-col items-end">
           <span className={`text-sm font-medium px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm ${remaining < 10 ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>
             Credits Remaining: {remaining}
           </span>
           {limitError && (
             <span className="text-xs text-red-600 mt-2 animate-pulse">
               {limitError}
             </span>
           )}
        </div>
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
              ) : (
                displayedContacts.map((contact) => {
                  const isViewed = viewedIds.has(contact.id);
                  return (
                    <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {contact.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {contact.role}
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
                          disabled={isViewed && false} // Keep enabled if we want to allow re-clicking (no op)
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
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {/* Page numbers */}
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
                    onClick={() => goToPage(pageNum)}
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
                    onClick={() => goToPage(totalPages)}
                    className="w-10 h-10 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={goToNextPage}
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
        <span>Clicking "View" will consume 1 credit. Unlocked contacts remain visible for your session.</span>
      </div>
    </div>
  );
}