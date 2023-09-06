import { ConversationLogItem, ReactionType, User } from '@/types/types';
import React, { useRef } from 'react';
import Message, { StatusType } from './Message';
import { useAuthStore } from '@/app/_store/auth.store';
import TextMessageBody from './TextMessageBody';
import { hasOnlyOneEmoji } from '@/app/_lib/emoji';
import EmojiMessageBody from './EmojiMessageBody';
import MediaMessageBody from './MediaMessageBody';
import api from '@/app/_services/authAxiosInstance';

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

        const containsOnlyOneEmoji =
          item.type === 'text' && hasOnlyOneEmoji(item.content as string);

        return (
          <Message
            key={item.id}
            avatarUrl={idx === 0 ? sender.avatarUrl : undefined}
            isSender={isSender}
            postDate={item.createdAt}
            reactions={item.reactions}
            replyTo={item.replyTo}
            displayStyle={containsOnlyOneEmoji ? 'emoji' : 'normal'}
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
          >
            {containsOnlyOneEmoji && <EmojiMessageBody>{item.content as string}</EmojiMessageBody>}
            {!containsOnlyOneEmoji && item.type === 'text' && (
              <TextMessageBody>{item.content as string}</TextMessageBody>
            )}
            {!containsOnlyOneEmoji && item.type === 'file' && (
              <MediaMessageBody
                progress={item.progress as number}
                onDownloadFile={async () => {
                  const url = item.content as string;
                  const { data: fileStream } = await api.get(url, { responseType: 'blob' });
                  const link = document.createElement('a');
                  const fileObjectUrl = URL.createObjectURL(fileStream);
                  link.href = fileObjectUrl;
                  link.download = item.fileName as string;

                  link.click();
                  URL.revokeObjectURL(fileObjectUrl);
                }}
                fileName={item.fileName as string}
                size={item.size as number}
              />
            )}
          </Message>
        );
      })}
    </div>
  );
};

export default MessageBlock;
