import Avatar from '@/app/components/Avatar';
import { ReactionType } from '@/types/types';
import { cva } from 'class-variance-authority';
import { formatDistanceToNow } from 'date-fns';
import React, { MouseEventHandler, ReactElement, ReactNode } from 'react';
import { FiHeart, FiThumbsUp } from 'react-icons/fi';
import { TbCheck, TbChecks } from 'react-icons/tb';
import emojiRegex from 'emoji-regex';
import { hasOnlyOneEmoji } from '@/app/_lib/emoji';

export type StatusType = 'sending' | 'sent' | 'received' | 'seen';

export interface MessageProps {
  isSender?: boolean;
  title?: string;
  content: string;
  avatarUrl?: string;
  reactions?: Partial<Record<ReactionType, number>>;
  status?: StatusType;
  postDate?: Date;
  className?: string;
}

export interface MessageReactionProps {
  icon: ReactElement;
  count: number;
  onClick?: MouseEventHandler<HTMLElement>;
}

const messageContentClassNames = cva(
  'rounded-lg border-gray-200 border-2 shadow-sm shadow-gray-50 pt-2 pb-3 h-max',
  {
    variants: {
      state: {
        sending: 'opacity-50',
        normal: '',
      },
      side: {
        sender: 'justify-self-end bg-blue-400 text-white pl-4 pr-2',
        recipient: 'justify-self-start bg-base-100 text-black pr-4 pl-2',
      },
    },
  },
);

const MessageReaction: React.FC<MessageReactionProps> = ({ icon, count, onClick = () => {} }) => (
  <div onClick={onClick} className="badge min-w-[3rem] justify-normal bg-white border-gray-200">
    {icon} <div className="ml-1 text-xs text-black">{count}</div>
  </div>
);

const reactionTypeIconRecord: Record<ReactionType, ReactElement> = {
  like: <FiThumbsUp size={16} className="fill-blue-400 text-white mb-[2px]" />,
  heart: <FiHeart size={16} className="fill-red-500 text-white" />,
};

const statusTypeIconRecord: Record<StatusType, ReactElement> = {
  received: <TbCheck size={16} />,
  sent: <TbCheck className="text-success" size={16} />,
  seen: <TbChecks className="text-success" size={16} />,
  sending: <span className="loading loading-spinner loading-xs opacity-50"></span>,
};

const emojiIconRecord: Record<string, ReactElement> = {
  '👍': <FiThumbsUp className="fill-primary text-white" size={64} />,
  '❤': <FiHeart className="fill-red-500 text-white" size={64} />,
};

const Message: React.FC<MessageProps> = ({
  title,
  content,
  avatarUrl,
  reactions,
  status,
  postDate,
  className = '',
  isSender = false,
}) => {
  return (
    <div className={`flex px-3 ${isSender ? 'justify-end' : 'justify-start'} ${className}`}>
      {!isSender && (
        <div className="flex-none w-11 mr-2">{avatarUrl && <Avatar avatarUrl={avatarUrl} />}</div>
      )}
      <div className="max-w-[85%]">
        {hasOnlyOneEmoji(content) ? (
          <div>
            {emojiIconRecord[content.trim()] ?? <span className="text-6xl">{content.trim()}</span>}
          </div>
        ) : (
          <div
            className={messageContentClassNames({
              state: status === 'sending' ? 'sending' : 'normal',
              side: isSender ? 'sender' : 'recipient',
            })}
          >
            <div>
              {title && <div className="font-semibold text-sm mb-0.5">{title}</div>}
              <div>{content}</div>
            </div>
            <div className="flex justify-between items-center mt-2 empty:hidden">
              {postDate && (
                <time className="text-xs opacity-70">{formatDistanceToNow(postDate)} ago</time>
              )}
              {reactions && (
                <div className="flex justify-end gap-1">
                  {Object.entries(reactions).map(([reactionType, count]) => (
                    <MessageReaction
                      key={reactionType}
                      icon={reactionTypeIconRecord[reactionType as ReactionType]}
                      count={count}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {status && (
          <div className="flex justify-end pr-1.5">
            <div>{statusTypeIconRecord[status]}</div>
          </div>
        )}
      </div>
      {isSender && (
        <div className="flex-none w-11 ml-2">{avatarUrl && <Avatar avatarUrl={avatarUrl} />}</div>
      )}
    </div>
  );
};

export default Message;
