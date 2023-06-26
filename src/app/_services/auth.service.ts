import api from './axiosInstance';
import authApi from './authAxiosInstance';
import { removeAllTokens } from '@/app/_lib/auth';
import axios from 'axios';

export interface LoginPayload {
  phoneNumber: string;
  password: string;
}

export type ResponseErrorPayload<ErrorType = string> = { error: ErrorType };
export type ResponsePayload<SuccessPayloadType = any, ErrorType = string> =
  | ResponseErrorPayload<ErrorType>
  | SuccessPayloadType;

export type LoginResponseErrorType = 'mismatch';
export interface LoginResponsePayload {
  id: number;
  firstName: string;
  lastName: string;
  refreshToken: string;
}

export async function login(loginPayload: LoginPayload) {
  const response = await api.post<ResponsePayload<LoginResponsePayload, LoginResponseErrorType>>(
    'auth/login',
    loginPayload,
  );
  return response;
}

export async function logout() {
  const response = await authApi.post<ResponsePayload>('auth/logout');
  removeAllTokens();
  return response.data;
}

// Function to refresh the access token using the refresh token
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`, {
      refreshToken,
    });
    const { accessToken } = response.data;
    return accessToken;
  } catch (error) {
    // Handle token refresh error, e.g., redirect to login page
    throw error;
  }
}
