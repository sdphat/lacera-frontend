export type ReactionType = 'like' | 'heart';
export interface Reaction {
  type: ReactionType;
  userId: number;
}

export interface ReactionCount {
  type: ReactionType;
  count: number;
}

export type ReactionCountRecord = Partial<Record<ReactionType, ReactionCount>>;

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  lastActive: Date;
  online: boolean;
}

export type MessageRecipientStatus = 'received' | 'seen';

export interface MessageRecipient {
  recipientId: number;
  messageStatus: MessageRecipientStatus;
}

export type MessageStatus = 'deleted' | 'received' | 'sending' | 'sent';
export interface Message {
  id: number;
  senderId: number;
  sender: User;
  conversationId: number;
  content: string;
  reactions: Reaction[];
  createdAt: Date;
  updatedAt: Date;
  messageUsers: MessageRecipient[];
  status: MessageStatus;
}

export interface CreatedMessage extends Message {
  tempId: number;
}

export interface ConversationLogItem extends Omit<Message, 'reactions'> {
  reactions: ReactionCountRecord;
}

export type ConversationType = 'private' | 'group';

export interface Conversation {
  id: number;
  type: ConversationType;
  chatBackground: string;
  avatar: string;
  participants: User[];
  messages: Message[];
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
