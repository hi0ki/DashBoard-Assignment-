'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button } from '../../../components/UI';
import { dataService } from '../../../services/dataService';
import { Contact } from '../../../types';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [limitError, setLimitError] = useState('');
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    // Load contacts
    dataService.getContacts().then(data => {
      setContacts(data);
      setLoading(false);
    });

    // Load persisted unlocked status and limit
    const unlocked = dataService.getUnlockedContactIds();
    setViewedIds(unlocked);
    
    const stats = dataService.getUsageStats();
    setRemaining(stats.total - stats.count);
  }, []);

  const handleViewContact = async (id: string) => {
    const result = await dataService.unlockContact(id);
    
    if (result.success) {
      const newViewed = new Set(viewedIds);
      newViewed.add(id);
      setViewedIds(newViewed);
      setRemaining(result.remaining);
      setLimitError('');
    } else {
      setLimitError('Daily view limit reached. Upgrade to view more contacts.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
          <p className="text-gray-500 dark:text-gray-400">Access contact details of your network</p>
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
                contacts.map((contact) => {
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
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-600 mt-4">
        <AlertTriangle size={12} />
        <span>Clicking "View" will consume 1 credit. Unlocked contacts remain visible for your session.</span>
      </div>
    </div>
  );
}