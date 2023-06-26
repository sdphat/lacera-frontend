import { Conversation, Message } from '@/types/types';
import { socketInit } from './conversationSocket';

export interface SendMessageDto {
  conversationId: number;
  content: string;
  postDate: Date;
}

export const conversationSocket = socketInit({
  url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/conversation`,
});

export const sendMessage = async (sendMessageDto: SendMessageDto): Promise<boolean> => {
  const result = await conversationSocket.socket.emitWithAck('create', sendMessageDto);
  return Boolean(result);
};

export const getConversations = async () => {
  const conversations: Conversation[] = await conversationSocket.socket.emitWithAck('fetchAll');
  conversations.forEach((c) => {
    c.participants.forEach((p) => (p.lastActive = new Date(p.lastActive)));
    c.messages.forEach((m) => {
      m.createdAt = new Date(m.createdAt);
      m.updatedAt = new Date(m.updatedAt);
    });
  });
  return conversations;
};
