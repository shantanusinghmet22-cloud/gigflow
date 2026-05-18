import { create } from 'zustand';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: JSON.parse(localStorage.getItem('gigflow_user') || 'null'),
  token: localStorage.getItem('gigflow_token'),
  isAuthenticated: !!localStorage.getItem('gigflow_token'),

  login: (token, user) => {
    localStorage.setItem('gigflow_token', token);
    localStorage.setItem('gigflow_user', JSON.stringify(user));

    set({
      token,
      user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('gigflow_token');
    localStorage.removeItem('gigflow_user');

    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));