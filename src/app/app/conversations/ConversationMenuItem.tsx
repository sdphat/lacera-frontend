'use client';
import React, { MouseEventHandler, ReactNode } from 'react';
import Avatar from '@/app/_components/Avatar';
import { Conversation, ConversationLogItem, GroupConversation, Message } from '@/types/types';
import { BsFile } from 'react-icons/bs';
import { FiFile } from 'react-icons/fi';

export interface ConversationMenuItemProps {
  title: ReactNode;
  subTitle?: ReactNode;
  avatarUrls: string | string[];
  includeDivider?: boolean;
  online?: boolean;
  unreadMessages?: number;
  onAvatarClick?: MouseEventHandler<HTMLElement>;
  onClick?: MouseEventHandler<HTMLElement>;
}

const ConversationMenuItem: React.FC<ConversationMenuItemProps> = ({
  avatarUrls,
  includeDivider = false,
  subTitle,
  title,
  online,
  unreadMessages,
  onAvatarClick = () => {},
  onClick = () => {},
}) => {
  return (
    <div onClick={onClick} className="relative w-full cursor-pointer bg-base-100">
      <div className="w-full hover:bg-blue-50 py-4 pl-3 pr-8">
        <Avatar
          online={online}
          avatarUrls={avatarUrls}
          onAvatarClick={onAvatarClick}
          title={title}
          subTitle={subTitle}
        />
        {unreadMessages && (
          <div className="absolute right-2 top-[45%] translate-y-[-50%] grid place-items-center text-white bg-red-500 rounded-full w-6 h-6">
            {unreadMessages}
          </div>
        )}
      </div>
      {includeDivider && <div className="divider my-0 h-0"></div>}
    </div>
  );
};

const createSubtitle = (message: Message, currentUserId: number): ReactNode => {
  // const subTitle = message
  //   ? message.sender.id === currentUserId
  //     ? `You: ${message.content}`
  //     : `${message.sender.firstName} ${message.sender.lastName}: ${message.content}`
  //   : 'Start the conversation with a greeting 😊';

  let subtitle: ReactNode;

  subtitle = (
    <div>
      <span className="text-gray-700 font-bold">
        {message.status !== 'deleted' && (
          <>{message.sender.id === currentUserId ? 'You: ' : `${message.sender.firstName}: `}</>
        )}
      </span>
      <span>
        {message.status === 'deleted' ? (
          '[Deleted]'
        ) : (
          <>
            {message.type === 'text' && (message.content as string)}
            {message.type === 'file' && (
              <span>
                <FiFile size={16} className="inline mb-0.5"></FiFile> [File]
              </span>
            )}
          </>
        )}
      </span>
    </div>
  );

  return subtitle;
};

export interface ConversationMenuItemHOCProps {
  conversation: Conversation;
  currentUserId: number;
  includeDivider?: boolean;
  onAvatarClick?: MouseEventHandler<HTMLElement>;
  onClick?: MouseEventHandler<HTMLElement>;
}

export const ConversationMenuItemHOC: React.FC<ConversationMenuItemHOCProps> = ({
  conversation,
  currentUserId,
  includeDivider,
  onAvatarClick = () => {},
  onClick = () => {},
}) => {
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  const subTitle = lastMessage
    ? createSubtitle(lastMessage, currentUserId)
    : 'Start the conversation with a greeting 😊';

  // Count all messages satisfy all the following:
  // 1. Not being sent by the current user
  // 2. Not deleted
  // 3. Haven't been received by the current user
  const amountOfUnreadMessages = conversation.messages.reduce(
    (count, message) =>
      count +
      Number(
        currentUserId !== message.senderId &&
          message.status !== 'deleted' &&
          (!message.messageUsers.length ||
            message.messageUsers.some(
              (mu) => mu.recipientId === currentUserId && mu.messageStatus === 'received',
            )),
      ),
    0,
  );

  const isPrivateChat = conversation.type === 'private';
  if (isPrivateChat) {
    const recipient = conversation.participants.find((p) => p.id !== currentUserId)!;
    return (
      <ConversationMenuItem
        key={conversation.id}
        avatarUrls={recipient.avatarUrl}
        title={`${recipient!.firstName}  ${recipient!.lastName}`}
        unreadMessages={amountOfUnreadMessages || undefined}
        online={recipient.online}
        subTitle={subTitle}
        includeDivider={includeDivider}
        onClick={onClick}
        onAvatarClick={onAvatarClick}
      />
    );
  } else {
    const group = conversation as GroupConversation;
    return (
      <ConversationMenuItem
        key={group.id}
        avatarUrls={conversation.avatar ?? group.participants.map((p) => p.avatarUrl)}
        title={group.title}
        subTitle={subTitle}
        unreadMessages={amountOfUnreadMessages || undefined}
        includeDivider={includeDivider}
        onClick={onClick}
        onAvatarClick={onAvatarClick}
      />
    );
  }
};

export default ConversationMenuItem;
