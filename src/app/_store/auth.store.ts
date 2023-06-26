import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LoginPayload, login } from '../_services/auth.service';

export const useAuthStore = create<{
  currentUser: { id: number; firstName: string; lastName: string };
  refreshToken: string;
  accessToken: string;
  login: (loginPayload: LoginPayload) => Promise<{ error: string } | undefined>;
}>()(
  persist(
    (set, get) => ({
      currentUser: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
      refreshToken: '',
      accessToken: '',

      login: async (loginPayload: LoginPayload) => {
        const response = await login(loginPayload);
        if ('error' in response.data) {
          return { error: response.data.error };
        } else {
          const { refreshToken, ...user } = response.data;
          set({ refreshToken, currentUser: user });
        }
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
