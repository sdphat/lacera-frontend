import { io } from 'socket.io-client';
import { getRefreshToken } from './auth';
import { refreshAccessToken } from '../_services/auth.service';

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

  return {
    socket,

    async emit(event: string, data?: object) {
      socket.emit(event, data);
    },

    async emitWithAck(event: string, data = {}) {
      console.log('EmitWithAck', event);
      const result = await socket.emitWithAck(event, data);
      if ('error' in result) {
        if (result.error === 'unauthorized') {
          socket.disconnect();
          socket.connect();
          const tryAgainResult = await socket.emitWithAck(event, data);
          if ('error' in tryAgainResult && tryAgainResult.error === 'unauthorized') {
            return { error: 'return to login page...' };
          }
          return tryAgainResult;
        }
      }
      return result;
    },

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
