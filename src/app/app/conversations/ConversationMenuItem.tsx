'use client';
import React, { MouseEventHandler } from 'react';
import Avatar from '@/app/_components/Avatar';
import { Conversation, GroupConversation } from '@/types/types';

export interface ConversationMenuItemProps {
  title: string;
  subTitle?: string;
  avatarUrl: string;
  includeDivider?: boolean;
  online?: boolean;
  unreadMessages?: number;
  onAvatarClick?: MouseEventHandler<HTMLElement>;
  onClick?: MouseEventHandler<HTMLElement>;
}

const ConversationMenuItem: React.FC<ConversationMenuItemProps> = ({
  avatarUrl,
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
          avatarUrl={avatarUrl}
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
    ? lastMessage.sender.id === currentUserId
      ? `You: ${lastMessage.content}`
      : `${lastMessage.sender.firstName} ${lastMessage.sender.lastName}: ${lastMessage.content}`
    : 'Start the conversation with a greeting 😊';

  const amountOfUnreadMessages = conversation.messages.reduce(
    (count, message) =>
      count + Number(currentUserId !== message.senderId && message.status === 'received'),
    0,
  );

  const isPrivateChat = conversation.type === 'private';
  if (isPrivateChat) {
    const recipient = conversation.participants.find((p) => p.id !== currentUserId)!;
    console.log(recipient);
    return (
      <ConversationMenuItem
        key={conversation.id}
        avatarUrl={recipient.avatarUrl}
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
        avatarUrl={group.avatar}
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
