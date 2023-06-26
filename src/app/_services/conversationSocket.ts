import { io } from 'socket.io-client';
import { getRefreshToken } from '../_lib/auth';
import { refreshAccessToken } from './auth.service';

type SocketEventListener<ReturnType = any> = (message: ReturnType) => void;

export const socketInit = ({
  url,
  socketConfig,
}: {
  url: string;
  socketConfig?: Parameters<typeof io>[1];
}) => {
  const socket = io(url, {
    auth: async (cb) => {
      if (typeof window !== 'undefined') {
        const accessToken = await refreshAccessToken(getRefreshToken() as string);
        cb({ token: 'Bearer ' + accessToken });
      }
    },
    ...socketConfig,
  });

  socket.on('errorEvent', async (errObj) => {
    if (errObj.error === 'unauthorized') {
      console.log(errObj.error);
    }
  });

  return {
    socket,

    addEventListener({
      successEvent,
      errorEvent,
      onSuccess,
      onError,
    }: Partial<{
      onSuccess: SocketEventListener;
      onError: SocketEventListener;
      successEvent: string;
      errorEvent: string;
    }>) {
      if (successEvent && onSuccess) this.socket.on(successEvent, onSuccess);
      if (errorEvent && onError) this.socket.on(errorEvent, onError);
    },

    removeEventListener({
      successEvent,
      errorEvent,
      onSuccess,
      onError,
    }: Partial<{
      onSuccess: SocketEventListener;
      onError: SocketEventListener;
      successEvent: string;
      errorEvent: string;
    }>) {
      if (successEvent && onSuccess) this.socket.off(successEvent, onSuccess);
      if (errorEvent && onError) this.socket.off(errorEvent, onError);
    },
  };
};
