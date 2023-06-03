import React from 'react';
import Image from 'next/image';

interface ConversationMenuItemProps {
  title: string;
  subTitle?: string;
  avatarUrl: string;
  includeDivider?: boolean;
}

// Pass in info + divider included?
const ConversationMenuItem: React.FC<ConversationMenuItemProps> = ({
  avatarUrl,
  includeDivider = false,
  subTitle,
  title,
}) => {
  return (
    <>
      <div className="flex w-full">
        <div className="avatar flex-none">
          <div className="w-11 rounded-full">
            <Image alt="" width={24} height={24} src={avatarUrl} />
          </div>
        </div>
        <div className="flex-1 min-w-0 ml-2">
          <div className="font-bold">{title}</div>
          <div className="text-gray-500 text-sm overflow-ellipsis whitespace-nowrap overflow-hidden">
            {subTitle}
          </div>
        </div>
      </div>
      {includeDivider && <div className="divider"></div>}
    </>
  );
};

export default ConversationMenuItem;
