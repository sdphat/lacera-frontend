import axios from 'axios';
import api from './axiosInstance';
import authApi from './authAxios';

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
  refreshToken: string;
}

export async function login(loginPayload: LoginPayload) {
  const response = await api.post<ResponsePayload<LoginResponsePayload, LoginResponseErrorType>>(
    'auth/login',
    loginPayload,
  );
  return response.data;
}

export async function logout() {
  const response = await authApi.post<ResponsePayload>('auth/logout');
  window.localStorage.removeItem('refresh_token');
  window.localStorage.removeItem('access_token');
  return response.data;
}
