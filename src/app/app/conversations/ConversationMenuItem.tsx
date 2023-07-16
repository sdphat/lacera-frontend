'use client';
import React, { MouseEventHandler } from 'react';
import Image from 'next/image';
import Avatar from '@/app/_components/Avatar';

interface ConversationMenuItemProps {
  title: string;
  subTitle?: string;
  avatarUrl: string;
  includeDivider?: boolean;
  onAvatarClick?: MouseEventHandler<HTMLElement>;
  onClick?: MouseEventHandler<HTMLElement>;
}

const ConversationMenuItem: React.FC<ConversationMenuItemProps> = ({
  avatarUrl,
  includeDivider = false,
  subTitle,
  title,
  onAvatarClick = () => {},
  onClick = () => {},
}) => {
  return (
    <div onClick={onClick} className="w-full cursor-pointer bg-base-100">
      <div className="w-full hover:bg-blue-50 py-4 px-3">
        <Avatar
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

export default ConversationMenuItem;
