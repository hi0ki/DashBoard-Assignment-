
import { Agency, Contact } from '../types';
import { DAILY_CONTACT_LIMIT } from '../constants';

// --- Mock Data Generation ---

const generateAgencies = (count: number): Agency[] => {
  const states = [
    { name: 'Washington', code: 'WA' },
    { name: 'Ohio', code: 'OH' },
    { name: 'Michigan', code: 'MI' },
    { name: 'Kentucky', code: 'KY' },
    { name: 'Illinois', code: 'IL' },
    { name: 'Texas', code: 'TX' },
    { name: 'Montana', code: 'MT' },
    { name: 'California', code: 'CA' },
    { name: 'Arizona', code: 'AZ' },
    { name: 'Florida', code: 'FL' },
    { name: 'Georgia', code: 'GA' },
    { name: 'Connecticut', code: 'CT' }
  ];

  const types = ['City', 'County'] as const;

  return Array.from({ length: count }).map((_, i) => {
    const state = states[Math.floor(Math.random() * states.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const nameBase = type === 'City' ? `City of ${String.fromCharCode(65 + (i % 26))}${i + 10}ville` : `${String.fromCharCode(65 + (i % 26))}son County`;
    
    return {
      id: `00526332-${Math.random().toString(36).substr(2, 9)}`,
      name: nameBase,
      state: state.name,
      state_code: state.code,
      type: type,
      population: Math.floor(Math.random() * 900000) + 10000,
      website: `https://www.${nameBase.replace(/\s/g, '').toLowerCase()}.gov`,
      county: type === 'City' ? `${state.name} County` : '-', // Cities usually belong to a county, Counties don't have a parent county in this context usually
      created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().replace('T', ' ').substring(0, 19)
    };
  });
};

const generateContacts = (count: number, agencies: Agency[]): Contact[] => {
  const roles = ['City Manager', 'County Clerk', 'Director of Public Works', 'Chief of Police', 'IT Director', 'HR Director', 'Mayor', 'Commissioner'];
  const departments = ['Administration', 'Clerk', 'Public Works', 'Police', 'Information Technology', 'Human Resources', 'Executive'];
  
  return Array.from({ length: count }).map((_, i) => ({
    id: `ct_${i + 1}`,
    name: `Contact ${i + 1}`,
    email: `contact${i + 1}@example.gov`,
    phone: `561-393-${7000 + i}`,
    role: roles[Math.floor(Math.random() * roles.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    agencyId: agencies[Math.floor(Math.random() * agencies.length)].id
  }));
};

// Singleton data stores
const AGENCIES_DATA = generateAgencies(34); 
const CONTACTS_DATA = generateContacts(1203, AGENCIES_DATA);

// --- Limit Tracking ---

const getStorageKeyLimit = (userId: string) => `InfinitiveByt_daily_limit_${userId}`;
const getStorageKeyUnlocked = (userId: string) => `InfinitiveByt_unlocked_contacts_${userId}`;
const getStorageKeyViewOrder = (userId: string) => `InfinitiveByt_view_order_${userId}`;

interface LimitState {
  date: string;
  count: number;
}

interface ViewOrder {
  contactId: string;
  timestamp: number;
}

export const dataService = {
  getAgencies: async (): Promise<Agency[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return AGENCIES_DATA;
  },

  getContacts: async (): Promise<Contact[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return CONTACTS_DATA; 
  },

  // Get list of IDs that are already paid for/unlocked (kept forever)
  getUnlockedContactIds: (userId: string): Set<string> => {
    // Users keep their unlocked contacts forever
    const stored = localStorage.getItem(getStorageKeyUnlocked(userId));
    return stored ? new Set(JSON.parse(stored)) : new Set();
  },

  // Unlock a specific contact
  unlockContact: async (contactId: string, userId: string): Promise<{ success: boolean; remaining: number }> => {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Check unlocked status
    const unlockedIds = dataService.getUnlockedContactIds(userId);
    if (unlockedIds.has(contactId)) {
      // Already unlocked, update view order but no cost
      dataService.updateViewOrder(contactId, userId);
      const limitState = dataService.getLimitState(userId);
      return { 
        success: true, 
        remaining: Math.max(0, DAILY_CONTACT_LIMIT - limitState.count) 
      };
    }

    // 2. Check Daily Limit
    const limitState = dataService.getLimitState(userId);
    
    // getLimitState already handles daily counter reset
    // Note: We keep unlocked contacts forever, only reset daily view counter

    if (limitState.count >= DAILY_CONTACT_LIMIT) {
      return { success: false, remaining: 0 };
    }

    // 3. Process Transaction
    const newCount = limitState.count + 1;
    localStorage.setItem(getStorageKeyLimit(userId), JSON.stringify({ ...limitState, count: newCount }));
    
    // Save to unlocked list
    unlockedIds.add(contactId);
    localStorage.setItem(getStorageKeyUnlocked(userId), JSON.stringify(Array.from(unlockedIds)));
    
    // Track view order
    dataService.updateViewOrder(contactId, userId);

    return {
      success: true,
      remaining: Math.max(0, DAILY_CONTACT_LIMIT - newCount)
    };
  },

  getLimitState: (userId: string): LimitState => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(getStorageKeyLimit(userId));
    let state: LimitState = stored ? JSON.parse(stored) : { date: today, count: 0 };
    
    // Reset only the daily counter if new day (keep unlocked contacts forever)
    if (state.date !== today) {
      state = { date: today, count: 0 };
      localStorage.setItem(getStorageKeyLimit(userId), JSON.stringify(state));
      // Note: We DON'T clear unlocked contacts - users keep them forever
    }
    return state;
  },

  getUsageStats: (userId: string) => {
    const state = dataService.getLimitState(userId);
    return {
      count: state.count,
      total: DAILY_CONTACT_LIMIT
    };
  },

  // Update view order for contact prioritization
  updateViewOrder: (contactId: string, userId: string) => {
    const stored = localStorage.getItem(getStorageKeyViewOrder(userId));
    let viewOrders: ViewOrder[] = stored ? JSON.parse(stored) : [];
    
    // Remove existing entry for this contact
    viewOrders = viewOrders.filter(v => v.contactId !== contactId);
    
    // Add new entry at the beginning
    viewOrders.unshift({
      contactId,
      timestamp: Date.now()
    });
    
    // Keep only last 100 views to prevent storage bloat
    viewOrders = viewOrders.slice(0, 100);
    
    localStorage.setItem(getStorageKeyViewOrder(userId), JSON.stringify(viewOrders));
  },

  // Get contacts sorted by view order (recently viewed first)
  getContactsSorted: async (userId: string): Promise<Contact[]> => {
    const contacts = await dataService.getContacts();
    const stored = localStorage.getItem(getStorageKeyViewOrder(userId));
    const viewOrders: ViewOrder[] = stored ? JSON.parse(stored) : [];
    const unlockedIds = dataService.getUnlockedContactIds(userId);
    
    // Create a map for quick lookup of view order
    const orderMap = new Map<string, number>();
    viewOrders.forEach((view, index) => {
      if (unlockedIds.has(view.contactId)) {
        orderMap.set(view.contactId, index);
      }
    });
    
    // Sort contacts: viewed contacts first (by view order), then unviewed
    return contacts.sort((a, b) => {
      const aOrder = orderMap.get(a.id);
      const bOrder = orderMap.get(b.id);
      
      // Both viewed - sort by view order
      if (aOrder !== undefined && bOrder !== undefined) {
        return aOrder - bOrder;
      }
      
      // Only a is viewed - a comes first
      if (aOrder !== undefined) return -1;
      
      // Only b is viewed - b comes first
      if (bOrder !== undefined) return 1;
      
      // Neither viewed - maintain original order
      return 0;
    });
  }
};
