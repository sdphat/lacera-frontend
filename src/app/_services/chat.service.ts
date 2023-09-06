import { Conversation, Message, MessageType, ReactionType } from '@/types/types';
import { socketInit } from '../_lib/socket';
import api from './authAxiosInstance';
export interface SendMessageDto {
  type: 'text' | 'file';
  conversationId: number;
  content: string | File;
  postDate: Date;
  replyTo?: number;
}

export interface ReactToMessageDto {
  messageId: number;
  reactionType: ReactionType;
}

/**
 *
 * @param conversation
 * Inline transform conversation's date values to date datatype
 */
const transformConversationDates = (conversation: Conversation) => {
  conversation.participants.forEach((p) => (p.lastActive = new Date(p.lastActive)));
  conversation.messages.forEach((m) => {
    m.createdAt = new Date(m.createdAt);
    m.updatedAt = new Date(m.updatedAt);
  });
  return conversation;
};

export const conversationSocket = socketInit({
  url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/conversation`,
});

conversationSocket.connect();

export const sendMessage = async (
  sendMessageDto: SendMessageDto,
  onUploadProgress = (progress: number) => {},
): Promise<boolean> => {
  if (sendMessageDto.type === 'text') {
    const result = await conversationSocket.emitWithAck('createMessage', sendMessageDto);
    return Boolean(result.error);
  }

  if (sendMessageDto.type === 'file') {
    let doneUploadingPromiseResolve: (value: any) => void;
    const doneUploadingPromise = new Promise((resolve) => {
      doneUploadingPromiseResolve = resolve;
    });
    const { data } = await api.postForm(
      '/conversation/upload',
      {
        file: sendMessageDto.content as File,
      },
      {
        onUploadProgress(progressEvent) {
          onUploadProgress(progressEvent.progress as number);
          console.log(progressEvent.progress);
          if (progressEvent.progress === 1) {
            doneUploadingPromiseResolve(1);
          }
        },
      },
    );
    await doneUploadingPromise;
    console.log('done!');
    const fileUrl = data;
    const result = await conversationSocket.emitWithAck('createMessage', {
      ...sendMessageDto,
      content: fileUrl,
      fileName: (sendMessageDto.content as File).name,
    });
    return Boolean(result.error);
  }

  return true;
};

export const reactToMessage = async ({
  messageId,
  reactionType,
}: ReactToMessageDto): Promise<Message | null> => {
  const result: { error: string; data: Message } = await conversationSocket.emitWithAck(
    'reactMessage',
    {
      messageId,
      reactionType,
    },
  );
  if (result.error) {
    console.log(result.error);
    return null;
  }
  console.log(result.data);
  return result.data;
};

export const getConversations = async () => {
  const { error, data: conversations }: { error: string; data: Conversation[] } =
    await conversationSocket.emitWithAck('fetchAll');
  if (error) {
    return null;
  }
  conversations.forEach((c) => {
    transformConversationDates(c);
  });
  return conversations;
};

export const getConversation = async (params: { id: number } | { targetId: number }) => {
  if ('id' in params) {
    const { error, data } = await conversationSocket.emitWithAck('details', params.id);
    if (error) {
      return null;
    }
    if (data) {
      return transformConversationDates(data);
    }
  } else {
    const { error, data: createdPrivateConversation } = await conversationSocket.emitWithAck(
      'createPrivate',
      {
        targetId: params.targetId,
      },
    );
    console.log(error, createdPrivateConversation);
    if (error) {
      return null;
    }
    if (createdPrivateConversation) {
      return transformConversationDates(createdPrivateConversation);
    }
  }
};
