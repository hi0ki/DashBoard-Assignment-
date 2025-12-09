
export interface User {
  email: string;
  name: string;
  avatar?: string;
  jobTitle?: string;
}

export interface Agency {
  id: string;
  name: string;
  state: string;
  state_code: string;
  type: 'City' | 'County';
  population: number;
  website: string;
  county: string;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string; // Job Title
  department: string;
  agencyId: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
