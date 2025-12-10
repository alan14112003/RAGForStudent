import api from './api';
import { LoginResponse } from '@/types';

export const authService = {
  loginWithGoogle: async (token: string) => {
    const response = await api.post<LoginResponse>('/auth/login/google', { token });
    const { access_token, user } = response.data;
    
    return {
      user: {
        id: String(user.id),
        name: user.full_name || 'User',
        email: user.email,
        picture: user.avatar_url || undefined
      },
      token: access_token,
    };
  },

  loginDev: async (email: string) => {
    const response = await api.post<LoginResponse>('/auth/login/dev', { email, full_name: "Dev Student" });
    const { access_token, user } = response.data;
    
    return {
      user: {
        id: String(user.id),
        name: user.full_name || 'Dev Student',
        email: user.email,
        picture: user.avatar_url || undefined
      },
      token: access_token,
    };
  },
};
