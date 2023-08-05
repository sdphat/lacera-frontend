import { create } from 'zustand';
import {
  SendMessageDto,
  conversationSocket,
  getConversation,
  getConversations,
  sendMessage,
} from '../_services/chat.service';
import { Conversation, Message } from '@/types/types';
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

export interface ConversationStore {
  conversations: Conversation[];

  sendMessage: (sendMessageDto: SendMessageDto) => Promise<boolean>;

  init: () => Promise<any>;
  reset: () => void;

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

  getConversations: () => Promise<void>;

  updateMessagesSeenStatus: (conversationId: number, messages: Message[]) => Promise<void>;

  createGroup: ({
    name,
    groupMemberIds,
  }: {
    name: string;
    groupMemberIds: number[];
  }) => Promise<Conversation>;

  removeConversation: ({ conversationId }: { conversationId: number }) => Promise<void>;

  removeMessage: ({ messageId }: { messageId: number }) => Promise<void>;
}

let isIntialized = false;

export const useConversationStore = create<ConversationStore>()((set, get) => ({
  conversations: [],
  sendMessage: async (sendMessageDto: SendMessageDto) => {
    return sendMessage(sendMessageDto);
  },
  init: async () => {
    if (isIntialized) {
      return;
    }
    isIntialized = true;
    conversationSocket.connect();
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
  },

  reset() {
    isIntialized = false;
    conversationSocket.reset();
    set({ conversations: [] });
  },

  async getConversation(params) {
    const { conversations } = get();
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) {
      return null;
    }

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

  async getConversations() {
    const conversations = (await getConversations()) ?? [];
    console.log(conversations);
    set({ conversations });
  },

  async updateMessagesSeenStatus(conversationId: number, messages: Message[]) {
    await Promise.all(
      messages.map(async (message) =>
        conversationSocket.emitWithAck('updateMessageStatus', { messageId: message.id }),
      ),
    );
    const { conversations } = get();
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) {
      return;
    }
    const localMessages = conversations.find((c) => c.id === conversationId)?.messages || [];
    messages.forEach((m) => {
      const foundLocalMessage = localMessages.find((lm) => lm.id === m.id);
      if (foundLocalMessage) {
        const messageUser = foundLocalMessage.messageUsers.find(
          (mu) => (mu.recipientId = currentUser.id),
        );
        if (messageUser) {
          messageUser.status = 'seen';
        } else {
          m.messageUsers.push({ recipientId: currentUser.id, status: 'seen' });
        }
      }
    });
    set({ conversations });
  },

  async createGroup({ name, groupMemberIds }) {
    const response = await conversationSocket.emitWithAck('createGroup', {
      title: name,
      participantIds: groupMemberIds,
    });
    const group = response.data;
    const { conversations } = get();
    set({ conversations: [...conversations, group] });
    return group;
  },

  async removeConversation({ conversationId }) {
    const response = await conversationSocket.emitWithAck('removeConversation', { conversationId });
    const { conversations } = get();
    set({ conversations: conversations.filter((c) => c.id !== conversationId) });
  },

  async removeMessage({ messageId }) {
    const response = await conversationSocket.emit('softRemoveMessage', { messageId });
    const { conversations } = get();
    set({
      conversations: conversations.map((conversation) => ({
        ...conversation,
        messages: conversation.messages.filter((m) => m.id !== messageId),
      })),
    });
  },
}));
