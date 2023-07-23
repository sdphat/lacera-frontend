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
  online: boolean;
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

export type ConversationType = 'private' | 'group';

export interface Conversation {
  id: number;
  type: ConversationType;
  chatBackground: string;
  avatar: string;
  participants: User[];
  messages: ConversationLogItem[];
}

export interface PrivateConversation extends Conversation {
  type: 'private';
}

export interface GroupConversation extends Conversation {
  title: string;
  background: string;
  type: 'group';
}

export interface Contact extends User {}

export interface ContactDetail extends Contact {
  backgroundUrl: string;
  aboutMe: string;
  status: 'accepted' | 'rejected' | 'pendingRequest' | 'pendingAccept' | 'notAdded';
}
