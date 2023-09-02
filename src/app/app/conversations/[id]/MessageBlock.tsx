import { ConversationLogItem, ReactionType, User } from '@/types/types';
import React, { useRef } from 'react';
import Message, { StatusType } from './Message';
import { useAuthStore } from '@/app/_store/auth.store';

export interface MessageBlockProps {
  isSender: boolean;
  sender: User;
  showLastMessageStatus: boolean;
  log: ConversationLogItem[];
  onMessageInview?: (message: ConversationLogItem) => void;
  onRemoveMessage?: (message: ConversationLogItem) => void;
  onRetrieveMessage?: (message: ConversationLogItem) => void;
  onAvatarClick?: () => void;
  onReactToMessage?: (message: ConversationLogItem, reactionType: ReactionType) => void;
  onReplyToMessage?: (message: ConversationLogItem) => void;
  focusedMessageId?: number;
  retrievableDurationInSec: number;
}

const MessageBlock: React.FC<MessageBlockProps> = ({
  isSender,
  showLastMessageStatus = false,
  sender,
  log,
  retrievableDurationInSec,
  focusedMessageId,
  onMessageInview = () => {},
  onRemoveMessage = () => {},
  onRetrieveMessage = () => {},
  onAvatarClick = () => {},
  onReactToMessage = () => {},
  onReplyToMessage = () => {},
}) => {
  const { currentUser } = useAuthStore();
  if (!currentUser) {
    return null;
  }
  return (
    <div className={isSender ? 'space-y-1' : 'space-y-0.5'}>
      {log.map((item, idx) => {
        if (item.status === 'deleted') {
          return <></>;
        }
        const nonSenderMessageUsers = item.messageUsers.filter(
          (mu) => mu.recipientId !== currentUser.id,
        );
        // const isBelongToGroup = nonSenderMessageUsers.length > 2;
        let status: StatusType;
        if (nonSenderMessageUsers[0] && nonSenderMessageUsers[0].messageStatus === 'seen') {
          status = 'seen';
        } else {
          status = item.status;
        }

        let displayedStatus: undefined | StatusType = status;

        if (status === 'sending') {
          displayedStatus = 'sending';
        } else {
          if (showLastMessageStatus) {
            displayedStatus = isSender ? status : undefined;
          } else {
            displayedStatus = undefined;
          }
        }

        console.log(item);

        return (
          <Message
            key={item.id}
            avatarUrl={idx === 0 ? sender.avatarUrl : undefined}
            content={item.content}
            isSender={isSender}
            postDate={item.createdAt}
            reactions={item.reactions}
            replyTo={item.replyTo}
            onMessageInview={() => onMessageInview(item)}
            onRemoveMessage={() => onRemoveMessage(item)}
            onRetrieveMessage={() => onRetrieveMessage(item)}
            onReactToMessage={(reactionType) => onReactToMessage(item, reactionType)}
            onAvatarClick={onAvatarClick}
            onReplyClick={() => onReplyToMessage(item)}
            title={idx === 0 ? `${sender.firstName} ${sender.lastName}` : undefined}
            status={displayedStatus}
            isFocused={item.id === focusedMessageId}
            retrievableDurationInSec={retrievableDurationInSec}
          />
        );
      })}
    </div>
  );
};

export default MessageBlock;
