import React, { MouseEventHandler } from 'react';
import Image from 'next/image';

export interface AvatarProps {
  onAvatarClick?: MouseEventHandler<HTMLElement>;
  title?: string;
  subTitle?: string;
  avatarUrl: string;
  className?: string;
  online?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  onAvatarClick,
  online,
  title,
  subTitle,
  avatarUrl,
  className = '',
}) => {
  const avatarAdditionalClasses = online !== undefined ? (online ? 'online' : 'offline') : '';
  if (title || subTitle) {
    return (
      <div className={`flex ${className}`}>
        <div className={`avatar flex-none ${avatarAdditionalClasses}`}>
          <div onClick={onAvatarClick} className="w-11 rounded-full">
            <Image alt="" width={24} height={24} src={avatarUrl} />
          </div>
        </div>
        <div className="flex-1 min-w-0 ml-2">
          <div className="font-bold">{title}</div>
          <div className="text-gray-500 text-sm overflow-ellipsis whitespace-nowrap overflow-hidden mt-0.5">
            {subTitle}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={`avatar flex-none ${avatarAdditionalClasses}`}>
        <div onClick={onAvatarClick} className="w-11 rounded-full">
          <Image alt="" width={24} height={24} src={avatarUrl} />
        </div>
      </div>
    );
  }
};

export default Avatar;
