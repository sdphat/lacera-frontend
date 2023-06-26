import { useAuthStore } from '../_store/auth.store';

export const getAccessToken = () => useAuthStore.getState().accessToken;

export const setAccessToken = (accessToken: string) => useAuthStore.setState({ accessToken });

export const getRefreshToken = () => useAuthStore.getState().refreshToken;

export const setRefreshToken = (refreshToken: string) => useAuthStore.setState({ refreshToken });

export const removeAllTokens = () => useAuthStore.setState({ accessToken: '', refreshToken: '' });
