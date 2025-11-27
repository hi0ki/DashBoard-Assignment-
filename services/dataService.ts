
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

const STORAGE_KEY_LIMIT = 'nexus_daily_limit';
const STORAGE_KEY_UNLOCKED = 'nexus_unlocked_contacts';

interface LimitState {
  date: string;
  count: number;
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

  // Get list of IDs that are already paid for/unlocked
  getUnlockedContactIds: (): Set<string> => {
    const stored = localStorage.getItem(STORAGE_KEY_UNLOCKED);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  },

  // Unlock a specific contact
  unlockContact: async (contactId: string): Promise<{ success: boolean; remaining: number }> => {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Check unlocked status
    const unlockedIds = dataService.getUnlockedContactIds();
    if (unlockedIds.has(contactId)) {
      // Already unlocked, no cost
      const limitState = dataService.getLimitState();
      return { 
        success: true, 
        remaining: Math.max(0, DAILY_CONTACT_LIMIT - limitState.count) 
      };
    }

    // 2. Check Daily Limit
    const limitState = dataService.getLimitState();
    
    // Reset if new day
    if (limitState.date !== today) {
      limitState.date = today;
      limitState.count = 0;
    }

    if (limitState.count >= DAILY_CONTACT_LIMIT) {
      return { success: false, remaining: 0 };
    }

    // 3. Process Transaction
    const newCount = limitState.count + 1;
    localStorage.setItem(STORAGE_KEY_LIMIT, JSON.stringify({ ...limitState, count: newCount }));
    
    // Save to unlocked list
    unlockedIds.add(contactId);
    localStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(Array.from(unlockedIds)));

    return {
      success: true,
      remaining: Math.max(0, DAILY_CONTACT_LIMIT - newCount)
    };
  },

  getLimitState: (): LimitState => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(STORAGE_KEY_LIMIT);
    let state: LimitState = stored ? JSON.parse(stored) : { date: today, count: 0 };
    
    // Reset if stale date found on read
    if (state.date !== today) {
      state = { date: today, count: 0 };
      localStorage.setItem(STORAGE_KEY_LIMIT, JSON.stringify(state));
    }
    return state;
  },

  getUsageStats: () => {
    const state = dataService.getLimitState();
    return {
      count: state.count,
      total: DAILY_CONTACT_LIMIT
    };
  }
};
