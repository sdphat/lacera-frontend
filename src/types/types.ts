export type ReactionType = 'like' | 'heart';
export interface Reaction {
  type: ReactionType;
  count: number;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  lastActive: Date;
}

export interface Message {
  id: number;
  senderId: number;
  sender: User;
  conversationId: number;
  content: string;
  reactions: Partial<Record<ReactionType, number>>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationLogItem extends Message {}

export interface Conversation {
  id: number;
  title: string;
  subtitle: string;
  avatar: string;
  participants: User[];
  messages: ConversationLogItem[];
}
