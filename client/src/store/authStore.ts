import { create } from 'zustand';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

// Hydrate from localStorage on first load
const storedToken = localStorage.getItem('gigflow_token');
const storedUser = localStorage.getItem('gigflow_user');

export const useAuthStore = create<AuthStore>((set) => ({
  token: storedToken,
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedToken,

  login: (token, user) => {
    localStorage.setItem('gigflow_token', token);
    localStorage.setItem('gigflow_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('gigflow_token');
    localStorage.removeItem('gigflow_user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  setUser: (user) => {
    localStorage.setItem('gigflow_user', JSON.stringify(user));
    set({ user });
  },
}));
