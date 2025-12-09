
import { User } from '../types';

const STORAGE_KEY_USER = '_user';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulating API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    if (!email.includes('@')) {
      throw new Error('Invalid email address');
    }

    const name = email.split('@')[0];
    const user: User = {
      email,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    }
    return user;
  },

  register: async (email: string, password: string): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!email.includes('@')) throw new Error('Invalid email');
    
    const name = email.split('@')[0];
    const user: User = {
      email,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    }
    return user;
  },

  logout: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_USER);
      // Force reload to clear any in-memory states
      window.location.hash = '#/login';
      window.location.reload();
    }
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    return stored ? JSON.parse(stored) : null;
  },

  updateProfile: async (user: User): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Ensure avatar is preserved or updated
    if (!user.avatar) {
      user.avatar = `https://ui-avatars.com/api/?name=${user.name}&background=random`;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    }
    return user;
  }
};
