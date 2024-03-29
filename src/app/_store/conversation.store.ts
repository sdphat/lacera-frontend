import { create } from 'zustand';
import {
  SendMessageDto,
  conversationSocket,
  getConversation,
  getConversations,
  leaveGroup,
  reactToMessage,
  sendMessage,
} from '../_services/chat.service';
import {
  Conversation,
  ConversationLogItem,
  CreatedMessage,
  Message,
  ReactionType,
  User,
} from '@/types/types';
import { useAuthStore } from './auth.store';
import { getHeartbeat } from '../_services/user.service';

/**
 * Inline sort the conversation array with updated date from latest to oldest
 * @param conversations Conversation array to sort
 * @returns Sorted conversation array
 */
const sortConversationsByUpdateDate = (conversations: Conversation[]) => {
  const lastUpdated: Record<number, number> = {};

  // Cache each conversation last updated timestamp to sort the conversations more efficiently
  for (const conversation of conversations) {
    lastUpdated[conversation.id] = Math.max(
      ...conversation.messages.map((m) => m.updatedAt.valueOf()),
    );
  }

  conversations.sort((c1, c2) => lastUpdated[c2.id] - lastUpdated[c1.id]);

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

  updateMessagesSeenStatus: (conversationId: number, messageIds: number[]) => Promise<void>;

  createGroup: ({
    name,
    groupMemberIds,
  }: {
    name: string;
    groupMemberIds: number[];
  }) => Promise<Conversation>;

  removeConversation: ({ conversationId }: { conversationId: number }) => Promise<void>;

  removeMessage: ({ messageId }: { messageId: number }) => Promise<void>;

  retrieveMessage: ({ messageId }: { messageId: number }) => Promise<void>;

  reactToMessage: ({
    messageId,
    reactionType,
  }: {
    messageId: number;
    reactionType: ReactionType;
  }) => Promise<void>;

  updateHeartbeat: ({ userId }: { userId: number }) => Promise<void>;

  updateAllHeartbeats: () => Promise<void>;

  leaveGroup: (id: number) => Promise<void>;
}

let isIntialized = false;

export const useConversationStore = create<ConversationStore>()((set, get) => ({
  conversations: [],
  sendMessage: async (sendMessageDto: SendMessageDto) => {
    const { conversations } = get();
    const { currentUser } = useAuthStore.getState();

    if (!currentUser) {
      return false;
    }

    const nextTempId = Math.min(...conversations.flatMap((c) => c.messages).map((m) => m.id)) - 1;
    const convs = conversations.map((conv) => {
      if (conv.id !== sendMessageDto.conversationId) {
        return conv;
      } else {
        const tempMessage: Message = {
          id: nextTempId,
          type: sendMessageDto.type,
          createdAt: sendMessageDto.postDate,
          content: sendMessageDto.content,
          conversationId: sendMessageDto.conversationId,
          messageUsers: [],
          reactions: [],
          updatedAt: new Date(),
          status: 'sending',
          senderId: currentUser.id,
          sender: { ...currentUser, lastActive: new Date(), online: true },
          replyTo: conv.messages.find((m) => m.id === sendMessageDto.replyTo) as Message,
          fileName:
            sendMessageDto.content instanceof File
              ? (sendMessageDto.content as File).name
              : undefined,
          size:
            sendMessageDto.content instanceof File
              ? (sendMessageDto.content as File).size
              : undefined,
          progress: 0,
        };
        return {
          ...conv,
          messages: [...conv.messages, tempMessage],
        };
      }
    });

    set({
      conversations: sortConversationsByUpdateDate(convs),
    });

    if (sendMessageDto.type === 'file') {
      return sendMessage(sendMessageDto, (progress: number) => {
        const { conversations } = get();
        set({
          conversations: sortConversationsByUpdateDate(
            conversations.map((c) => ({
              ...c,
              messages: c.messages.map((msg) =>
                msg.id === nextTempId
                  ? {
                      ...msg,
                      progress,
                    }
                  : msg,
              ),
            })),
          ),
        });
      });
    }

    if (sendMessageDto.type === 'text') {
      return sendMessage(sendMessageDto);
    }

    return true;
  },

  init: async () => {
    if (isIntialized) {
      return;
    }
    isIntialized = true;
    conversationSocket.connect();
    conversationSocket.addEventListener({
      successEvent: 'update',
      onSuccess: async (message: Message) => {
        const conv = await getConversation({ id: message.conversationId });
        const { conversations } = get();

        // Parsing date
        message.createdAt = new Date(message.createdAt);
        message.updatedAt = new Date(message.updatedAt);

        const foundConversation = conversations.find((c) => c.id === message.conversationId);
        if (foundConversation) {
          const foundMessageIdx = foundConversation.messages.findIndex((m) => m.id === message.id);
          // Update message if message found then override the message and newer than message in memory
          if (foundMessageIdx !== -1) {
            if (foundConversation.messages[foundMessageIdx].updatedAt <= message.updatedAt) {
              foundConversation.messages[foundMessageIdx] = message;
            }
          } else {
            // Push in new message if the message isn't in memory
            foundConversation.messages.push(message);
          }
          foundConversation.messages.sort((m1, m2) => m1.id - m2.id);
          set({ conversations: sortConversationsByUpdateDate(conversations) });
        } else {
          // Get conversation from server and push in memory if conversation isn't in memory
          if (conv) {
            set({ conversations: sortConversationsByUpdateDate(conversations.concat(conv)) });
          }
        }
      },
    });

    conversationSocket.addEventListener({
      successEvent: 'create',
      onSuccess: (message: CreatedMessage) => {
        message.createdAt = new Date(message.createdAt);
        message.updatedAt = new Date(message.updatedAt);
        const { conversations } = get();
        set({
          conversations: sortConversationsByUpdateDate(
            conversations.map((conv) => {
              if (conv.id !== message.conversationId) {
                return conv;
              }

              const foundTempMessageIdx = conv.messages.findIndex((m) => m.id === message.tempId);
              if (~foundTempMessageIdx) {
                return conv;
              }

              const copyMessages = conv.messages.concat();
              message.createdAt = new Date(message.createdAt);
              message.updatedAt = new Date(message.updatedAt);
              copyMessages.splice(foundTempMessageIdx, 1, message);

              return {
                ...conv,
                messages: copyMessages,
              };
            }),
          ),
        });
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

    // Handle finding conversation by CONVERSATION ID if it already exists in memory.
    if ('id' in params && conversations.find((c) => c.id === params.id)) {
      return conversations.find((c) => c.id === params.id) ?? null;
    }

    // Handle finding conversation by TARGET USER ID if it already exists in memory
    // (apply to private conversation only!)
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

    // If it isn't in memory then ask the server for it
    const requestedConversation = await getConversation(params);
    if (requestedConversation) {
      set({
        conversations: sortConversationsByUpdateDate([...conversations, requestedConversation]),
      });
      return requestedConversation;
    }
    return null;
  },

  async getConversations() {
    const conversations = (await getConversations()) ?? [];
    set({ conversations: sortConversationsByUpdateDate(conversations) });
  },

  async updateMessagesSeenStatus(conversationId: number, messageIds: number[]) {
    await Promise.all(
      messageIds.map(async (messageId) =>
        conversationSocket.emitWithAck('updateMessageStatus', { messageId }),
      ),
    );
    const { conversations } = get();
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) {
      return;
    }
    const localMessages = conversations.find((c) => c.id === conversationId)?.messages || [];
    messageIds.forEach((messageId) => {
      const foundLocalMessage = localMessages.find((lm) => lm.id === messageId);
      if (foundLocalMessage) {
        const messageUser = foundLocalMessage.messageUsers.find(
          (mu) => mu.recipientId === currentUser.id,
        );
        if (messageUser) {
          messageUser.messageStatus = 'seen';
        } else {
          foundLocalMessage.messageUsers.push({
            recipientId: currentUser.id,
            messageStatus: 'seen',
          });
        }
      }
    });
    set({ conversations: sortConversationsByUpdateDate(conversations) });
  },

  async createGroup({ name, groupMemberIds }) {
    const response = await conversationSocket.emitWithAck('createGroup', {
      title: name,
      participantIds: groupMemberIds,
    });
    const group = response.data;
    const { conversations } = get();
    set({ conversations: sortConversationsByUpdateDate([...conversations, group]) });
    return group;
  },

  async removeConversation({ conversationId }) {
    const response = await conversationSocket.emitWithAck('removeConversation', { conversationId });
    const { conversations } = get();
    set({
      conversations: sortConversationsByUpdateDate(
        conversations.filter((c) => c.id !== conversationId),
      ),
    });
  },

  async removeMessage({ messageId }) {
    const response = await conversationSocket.emitWithAck('softRemoveMessage', { messageId });
    const { conversations } = get();
    set({
      conversations: sortConversationsByUpdateDate(
        conversations.map((conversation) => ({
          ...conversation,
          messages: conversation.messages.filter((m) => m.id !== messageId),
        })),
      ),
    });
  },

  async retrieveMessage({ messageId }) {
    const response = await conversationSocket.emitWithAck('removeMessage', { messageId });
    const { data: updatedMessage } = response;
    const { conversations } = get();
    if (updatedMessage) {
      set({
        conversations: sortConversationsByUpdateDate(
          conversations.map((conversation) => ({
            ...conversation,
            messages: conversation.messages.map((message) => {
              if (message.id === updatedMessage.id) {
                return updatedMessage;
              }
              return message;
            }),
          })),
        ),
      });
    }
  },

  async updateHeartbeat({ userId }) {
    const response = await getHeartbeat(userId);
    const { data: user } = response;
    const { conversations } = get();
    if (user) {
      set({
        conversations: sortConversationsByUpdateDate(
          conversations.map((conversation) => {
            const foundUser = conversation.participants.find((p) => p.id === user.userId);
            if (foundUser) {
              let updatedUser: User = {
                ...foundUser,
                online: user.isOnline,
                lastActive: user.isOnline ? new Date() : new Date(user.lastActive),
              };
              return {
                ...conversation,
                participants: conversation.participants
                  .filter((p) => p.id !== foundUser.id)
                  .concat(updatedUser),
              };
            } else {
              return conversation;
            }
          }),
        ),
      });
    }
  },

  async updateAllHeartbeats() {
    const { conversations } = get();
    const participantIds = Array.from(
      new Set(conversations.flatMap((c) => c.participants).map((p) => p.id)),
    );
    const responses: { data: { userId: number; isOnline: boolean; lastActive: string } }[] =
      await Promise.all(participantIds.map((userId) => getHeartbeat(userId)));
    const users = responses.map((response) => response.data).filter((d) => d);

    let updatedConversations = conversations.concat();
    users.forEach((user) => {
      updatedConversations = updatedConversations.map((conversation) => {
        const foundUser = conversation.participants.find((p) => p.id === user.userId);
        if (foundUser) {
          let updatedUser: User = {
            ...foundUser,
            online: user.isOnline,
            lastActive: user.isOnline ? new Date() : new Date(user.lastActive),
          };
          return {
            ...conversation,
            participants: conversation.participants
              .filter((p) => p.id !== foundUser.id)
              .concat(updatedUser),
          };
        } else {
          return conversation;
        }
      });
    });

    set({ conversations: sortConversationsByUpdateDate(updatedConversations) });
  },

  async reactToMessage({ messageId, reactionType }) {
    const message = await reactToMessage({ messageId, reactionType });
    if (!message) {
      return;
    }

    // Parse date values
    message.createdAt = new Date(message.createdAt);
    message.updatedAt = new Date(message.updatedAt);

    // Update message into state
    const { conversations } = get();
    set({
      conversations: sortConversationsByUpdateDate(
        conversations.map((c) => ({
          ...c,
          messages: c.messages.map((m) => {
            const matchMessage = m.id === messageId;
            if (!matchMessage) {
              return m;
            }
            return message;
          }),
        })),
      ),
    });
  },

  async leaveGroup(id) {
    await leaveGroup(id);
    const { conversations } = get();
    set({ conversations: sortConversationsByUpdateDate(conversations.filter((c) => c.id !== id)) });
  },
}));
