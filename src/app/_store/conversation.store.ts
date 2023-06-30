import { create } from 'zustand';
import {
  SendMessageDto,
  conversationSocket,
  getConversations,
  sendMessage,
} from '../_services/chat.service';
import { Conversation, Message } from '@/types/types';

const updateConversationMessage = (conversations: Conversation[], message: Message) => {
  const foundConversation = conversations.find((c) => c.id === message.conversationId);
  if (foundConversation) {
    const foundMessageIdx = foundConversation.messages.findIndex((m) => m.id === message.id);
    if (foundMessageIdx !== -1) {
      if (foundConversation.messages[foundMessageIdx].updatedAt < message.updatedAt) {
        foundConversation.messages[foundMessageIdx] = message;
      }
    } else {
      foundConversation.messages.push(message);
    }
    foundConversation.messages.sort((m1, m2) => m1.createdAt.valueOf() - m2.createdAt.valueOf());
  }
  return conversations;
};

let isIntialized = false;

export const useConversationStore = create<{
  conversations: Conversation[];
  sendMessage: (sendMessageDto: SendMessageDto) => Promise<boolean>;
  init: () => Promise<any>;
}>()((set, get) => ({
  conversations: [],
  sendMessage: async (sendMessageDto: SendMessageDto) => {
    return sendMessage(sendMessageDto);
  },
  init: async () => {
    if (isIntialized) {
      return;
    }
    isIntialized = true;
    conversationSocket.addEventListener({
      successEvent: 'update',
      onSuccess: (message: Message) => {
        message.createdAt = new Date(message.createdAt);
        message.updatedAt = new Date(message.updatedAt);
        const { conversations } = get();
        updateConversationMessage(conversations, message);
        set({ conversations });
      },
    });

    conversationSocket.addEventListener({
      successEvent: 'create',
      onSuccess: (message: Message) => {
        message.createdAt = new Date(message.createdAt);
        message.updatedAt = new Date(message.updatedAt);
        const { conversations } = get();
        updateConversationMessage(conversations, message);
        set({ conversations });
      },
    });
    const conversations = await getConversations();
    set({ conversations });
  },
}));
