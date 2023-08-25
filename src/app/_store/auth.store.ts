import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  LoginPayload,
  RegisterPayload,
  RegisterResponseErrorType,
  login,
  register,
} from '../_services/auth.service';

export const useAuthStore = create<{
  currentUser?: { id: number; firstName: string; lastName: string; avatarUrl: string };
  refreshToken: string;
  accessToken: string;
  login: (loginPayload: LoginPayload) => Promise<{ error: string } | undefined>;
  register: (
    registerPayload: RegisterPayload,
  ) => Promise<{ error: RegisterResponseErrorType } | undefined>;
}>()(
  persist(
    (set, get) => ({
      refreshToken: '',
      accessToken: '',

      async login(loginPayload) {
        const response = await login(loginPayload);
        if ('error' in response.data) {
          return { error: response.data.error };
        } else {
          const { refreshToken, ...user } = response.data;
          set({ refreshToken, currentUser: user });
        }
      },

      async register(registerPayload) {
        const response = await register(registerPayload);
        if ('error' in response.data) {
          return { error: response.data.error };
        }
        const { refreshToken, ...user } = response.data;
        set({ refreshToken, currentUser: user });
      },
    }),

    {
      name: 'auth-storage',
      partialize: ({ currentUser, refreshToken }) => ({
        currentUser,
        refreshToken,
      }),
    },
  ),
);
