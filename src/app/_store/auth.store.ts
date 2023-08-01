import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LoginPayload, login } from '../_services/auth.service';

export const useAuthStore = create<{
  currentUser?: { id: number; firstName: string; lastName: string; avatarUrl: string };
  refreshToken: string;
  accessToken: string;
  login: (loginPayload: LoginPayload) => Promise<{ error: string } | undefined>;
}>()(
  persist(
    (set, get) => ({
      refreshToken: '',
      accessToken: '',

      login: async (loginPayload: LoginPayload) => {
        const response = await login(loginPayload);
        if ('error' in response.data) {
          return { error: response.data.error };
        } else {
          const { refreshToken, ...user } = response.data;
          console.log(user);
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
