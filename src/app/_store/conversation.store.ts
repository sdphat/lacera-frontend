import { create } from 'zustand';
import {
  SendMessageDto,
  conversationSocket,
  getConversation,
  getConversations,
  sendMessage,
} from '../_services/chat.service';
import { Conversation, ConversationType, Message } from '@/types/types';
import { useAuthStore } from './auth.store';

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
  getConversation: (
    params:
      | {
          id: number;
        }
      | {
          targetId: number;
        }
      | {
          id: number;
          targetId: number;
        },
  ) => Promise<Conversation | null>;
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
    set({ conversations: conversations ?? undefined });
  },
  async getConversation(params) {
    const { conversations } = get();
    const { currentUser } = useAuthStore.getState();

    if ('id' in params && conversations.find((c) => c.id === params.id)) {
      return conversations.find((c) => c.id === params.id) ?? null;
    }

    if (
      'targetId' in params &&
      conversations.find(
        (c) =>
          c.type === 'private' &&
          c.participants.every((p) => p.id === currentUser.id || p.id === params.targetId),
      )
    ) {
      return (
        conversations.find(
          (c) =>
            c.type === 'private' &&
            c.participants.every((p) => p.id === currentUser.id || p.id === params.targetId),
        ) ?? null
      );
    }

    const requestedConversation = await getConversation(params);
    if (requestedConversation) {
      set({ conversations: [...conversations, requestedConversation] });
      return requestedConversation;
    }
    return null;
  },
}));
