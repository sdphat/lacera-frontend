import React, { ReactElement, ReactNode } from 'react';
import { FiHeart, FiThumbsUp } from 'react-icons/fi';

export interface EmojiMessageBodyProps {
  children: String;
}

export const emojiIconRecord: Record<string, ReactNode> = {
  '👍': <FiThumbsUp className="fill-primary text-white" size={64} />,
  '❤': <FiHeart className="fill-red-500 text-white" size={64} />,
};

const EmojiMessageBody: React.FC<EmojiMessageBodyProps> = ({ children }) => {
  return (
    <div>
      {emojiIconRecord[children.trim()] ?? <span className="text-6xl">{children.trim()}</span>}
    </div>
  );
};

export default EmojiMessageBody;
