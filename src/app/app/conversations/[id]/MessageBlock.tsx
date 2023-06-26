import { ConversationLogItem, User } from '@/types/types';
import React from 'react';
import Message from './Message';

export interface MessageBlockProps {
  isSender: boolean;
  sender: User;
  log: Omit<ConversationLogItem, 'sender'>[];
}

const MessageBlock: React.FC<MessageBlockProps> = ({ isSender, sender, log }) => (
  <div className={isSender ? 'space-y-1' : 'space-y-0.5'}>
    {log.map((item, idx) => (
      <Message
        key={item.id}
        avatarUrl={idx === 0 ? sender.avatarUrl : undefined}
        content={item.content}
        isSender={isSender}
        postDate={item.createdAt}
        reactions={item.reactions}
        title={idx === 0 ? `${sender.firstName} ${sender.lastName}` : undefined}
      />
    ))}
  </div>
);

export default MessageBlock;
