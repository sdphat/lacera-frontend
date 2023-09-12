import React, { MouseEventHandler, ReactNode } from 'react';
import Image from 'next/image';

export interface AvatarProps {
  onAvatarClick?: MouseEventHandler<HTMLElement>;
  title?: ReactNode;
  subTitle?: ReactNode;
  avatarUrls?: string | string[];
  className?: string;
  online?: boolean;
}

interface ImageElementProps {
  avatarUrls?: string | string[];
}

const ImageElement: React.FC<ImageElementProps> = ({ avatarUrls }) => {
  if (!avatarUrls) {
    return null;
  }

  // Return an avatar if there's only one url
  if (typeof avatarUrls === 'string') {
    return <Image alt="" width={24} height={24} src={avatarUrls} />;
  }

  // Return a collection of avatars and remaining number of avatars if there are 4 more avatar urls
  if (avatarUrls.length > 4) {
    <>
      <Image className="!w-[50%] !h-[50%]" alt="" width={12} height={12} src={avatarUrls[0]} />
      <Image className="!w-[50%] !h-[50%]" alt="" width={12} height={12} src={avatarUrls[1]} />
      <Image className="!w-[50%] !h-[50%]" alt="" width={12} height={12} src={avatarUrls[2]} />
      <div className="!w-[50%] !h-[50%] bg-gray-400 text-white font-bold text-xl">
        +{avatarUrls.length - 4}
      </div>
    </>;
  }

  // Return a collection of all avatar if there are 2 to 3 avatar urls
  return (
    <>
      {avatarUrls.map((url, i) => (
        <Image
          key={url + i}
          className="!w-[50%] !h-[50%]"
          alt=""
          width={12}
          height={12}
          src={url}
        />
      ))}
    </>
  );
};

const Avatar: React.FC<AvatarProps> = ({
  onAvatarClick,
  online,
  title,
  subTitle,
  avatarUrls,
  className = '',
}) => {
  const avatarAdditionalClasses = online !== undefined ? (online ? 'online' : 'offline') : '';

  if (title || subTitle) {
    return (
      <div className={`flex ${className}`}>
        <div className={`avatar flex-none ${avatarAdditionalClasses}`}>
          <div
            onClick={onAvatarClick}
            className={`w-11 rounded-full ${onAvatarClick ? 'cursor-pointer' : ''}`}
          >
            <ImageElement avatarUrls={avatarUrls} />
          </div>
        </div>
        <div className="flex-1 min-w-0 ml-2">
          <div className="font-bold text-sm">{title}</div>
          <div className="text-gray-500 text-[0.85rem] overflow-ellipsis whitespace-nowrap overflow-hidden mt-0.5">
            {subTitle}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={`avatar flex-none ${avatarAdditionalClasses}`}>
        <div onClick={onAvatarClick} className="w-11 rounded-full">
          <ImageElement avatarUrls={avatarUrls} />
        </div>
      </div>
    );
  }
};

export default Avatar;
