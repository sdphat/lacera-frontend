import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  LoginPayload,
  RegisterPayload,
  RegisterResponseErrorType,
  login,
  register,
} from '../_services/auth.service';
import api from '../_services/authAxiosInstance';
import { User } from '@/types/types';
import { ProfileData } from '../app/profile/[id]/ProfileEditModal';

export const useAuthStore = create<{
  currentUser?: { id: number; firstName: string; lastName: string; avatarUrl: string };
  refreshToken: string;
  accessToken: string;
  login: (loginPayload: LoginPayload) => Promise<{ error: string } | undefined>;
  register: (
    registerPayload: RegisterPayload,
  ) => Promise<{ error: RegisterResponseErrorType } | undefined>;
  updateProfile: (updateProfilePayload: ProfileData) => Promise<User>;
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

      async updateProfile(updateProfilePayload) {
        const { data: updatedUser } = await api.postForm<User>(
          '/user/update-profile',
          updateProfilePayload,
        );
        const { currentUser } = get();
        // Type safe
        if (!currentUser) {
          return updatedUser;
        }
        set({
          currentUser: {
            ...currentUser,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            avatarUrl: updatedUser.avatarUrl,
          },
        });
        return updatedUser;
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
