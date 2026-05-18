import api from './axios';
import { ApiResponse, LoginPayload, RegisterPayload, User } from '../types';

interface AuthData {
  token: string;
  user: User;
}

export const authApi = {
  login: async (payload: LoginPayload) => {
    const { data } = await api.post<ApiResponse<AuthData>>('/auth/login', payload);
    return data;
  },

  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<ApiResponse<AuthData>>('/auth/register', payload);
    return data;
  },

  getMe: async () => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data;
  },
};
