import { ConversationLogItem, User } from '@/types/types';
import React from 'react';
import Message from './Message';

export interface MessageBlockProps {
  isSender: boolean;
  sender: User;
  log: ConversationLogItem[];
  onMessageInview?: (message: ConversationLogItem) => void;
  onRemoveMessage?: (message: ConversationLogItem) => void;
  onRetrieveMessage?: (message: ConversationLogItem) => void;
  retrievableDurationInSec: number;
}

const MessageBlock: React.FC<MessageBlockProps> = ({
  isSender,
  sender,
  log,
  retrievableDurationInSec,
  onMessageInview = () => {},
  onRemoveMessage = () => {},
  onRetrieveMessage = () => {},
}) => (
  <div className={isSender ? 'space-y-1' : 'space-y-0.5'}>
    {log.map((item, idx) => (
      <>
        <Message
          key={item.id}
          avatarUrl={idx === 0 ? sender.avatarUrl : undefined}
          content={item.content}
          isSender={isSender}
          postDate={item.createdAt}
          reactions={item.reactions}
          onMessageInview={() => onMessageInview(item)}
          onRemoveMessage={() => onRemoveMessage(item)}
          onRetrieveMessage={() => onRetrieveMessage(item)}
          title={idx === 0 ? `${sender.firstName} ${sender.lastName}` : undefined}
          status={item.status}
          retrievableDurationInSec={retrievableDurationInSec}
        />
      </>
    ))}
  </div>
);

export default MessageBlock;
