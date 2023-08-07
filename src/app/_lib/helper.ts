import { ConversationLogItem, User } from '@/types/types';

interface DeletedMessageNotificationBlock {
  type: 'deleted-notification';
  id: number;
}

interface MessageBlockType {
  type: 'messages';
  id: number;
  senderId: number;
  sender: User;
  messages: ConversationLogItem[];
}

type LogBlock = DeletedMessageNotificationBlock | MessageBlockType;

type TempLogBlock = LogBlock | { type: '' };

export const groupLogByBlock = (log: ConversationLogItem[]): LogBlock[] => {
  if (!log.length) {
    return [];
  }

  const messageBlocks: LogBlock[] = [];
  let currentUserId = log[0].senderId;

  // Placeholder obj
  let block: TempLogBlock = { type: '' };

  const commitBlock = () => {
    if (block.type) {
      messageBlocks.push(block);
    }
    block = { type: '' };
  };

  for (const item of log) {
    if (item.status === 'deleted') {
      commitBlock();
      block = { type: 'deleted-notification', id: item.id };
      continue;
    }

    if (item.senderId === currentUserId) {
      if (block.type !== 'messages') {
        commitBlock();
        block = {
          type: 'messages',
          id: item.id,
          sender: item.sender,
          senderId: item.senderId,
          messages: [],
        };
      }
      block.messages.push(item);
    } else {
      commitBlock();
      block = {
        type: 'messages',
        id: item.id,
        sender: item.sender,
        senderId: item.senderId,
        messages: [],
      };
      block.messages.push(item);
      currentUserId = item.senderId;
    }
  }
  commitBlock();
  return messageBlocks;
};
