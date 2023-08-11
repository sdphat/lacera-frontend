import { socketInit } from '../_lib/socket';

export const userSocket = socketInit({
  url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/user`,
});

userSocket.connect();

export const heartbeat = () => {
  return userSocket.emitWithAck('heartbeat');
};

export const getHeartbeat = (userId: number) => {
  return userSocket.emitWithAck('check-heartbeat', { userId });
};
