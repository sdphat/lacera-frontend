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
  onAvatarClick?: MouseEventHandler<HTMLElement>;
  onClick?: MouseEventHandler<HTMLElement>;
}

const ConversationMenuItem: React.FC<ConversationMenuItemProps> = ({
  avatarUrl,
  includeDivider = false,
  subTitle,
  title,
  online,
  onAvatarClick = () => {},
  onClick = () => {},
}) => {
  return (
    <div onClick={onClick} className="w-full cursor-pointer bg-base-100">
      <div className="w-full hover:bg-blue-50 py-4 px-3">
        <Avatar
          online={online}
          avatarUrl={avatarUrl}
          onAvatarClick={onAvatarClick}
          title={title}
          subTitle={subTitle}
        />
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

  const isPrivateChat = conversation.type === 'private';
  if (isPrivateChat) {
    const recipient = conversation.participants.find((p) => p.id !== currentUserId)!;
    console.log(recipient);
    return (
      <ConversationMenuItem
        key={conversation.id}
        avatarUrl={recipient.avatarUrl}
        title={`${recipient!.firstName}  ${recipient!.lastName}`}
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
        includeDivider={includeDivider}
        onClick={onClick}
        onAvatarClick={onAvatarClick}
      />
    );
  }
};

export default ConversationMenuItem;
