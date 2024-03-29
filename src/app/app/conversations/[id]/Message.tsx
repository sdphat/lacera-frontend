import Avatar from '@/app/_components/Avatar';
import { ReactionType, ReactionCountRecord, ConversationLogItem } from '@/types/types';
import { cva } from 'class-variance-authority';
import { formatDistanceToNow } from 'date-fns';
import React, {
  MouseEventHandler,
  ReactElement,
  ReactNode,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { FiHeart, FiThumbsUp, FiTrash } from 'react-icons/fi';
import { TbCheck, TbChecks, TbMoodPlus } from 'react-icons/tb';
import { hasOnlyOneEmoji } from '@/app/_lib/emoji';
import { useInView } from 'react-intersection-observer';
import { BsHandThumbsUp, BsHeart, BsQuote, BsReply, BsThreeDots } from 'react-icons/bs';
import { DefaultExtensionType, FileIcon, defaultStyles } from 'react-file-icon';

export type StatusType = 'sending' | 'sent' | 'received' | 'seen';

export type DisplayType = 'normal' | 'emoji';
export interface MessageProps {
  isSender?: boolean;
  title?: string;
  children: ReactNode;
  avatarUrl?: string;
  reactions?: ReactionCountRecord;
  status?: StatusType;
  className?: string;
  postDate: Date;
  isFocused?: boolean;
  displayStyle?: DisplayType;
  replyTo?: ConversationLogItem['replyTo'];
  retrievableDurationInSec: number;
  onMessageInview?: () => void;
  onRemoveMessage?: () => void;
  onRetrieveMessage?: () => void;
  onAvatarClick?: () => void;
  onReactToMessage?: (reactionType: ReactionType) => void;
  onReplyClick?: () => void;
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
      focus: {
        true: 'bg-secondary text-gray-200',
      },
      emoji: {
        true: 'bg-white border-none',
      },
    },
  },
);

export interface MessageReactionProps {
  icon: ReactElement;
  count: number;
  userReacted: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
}

const MessageReaction: React.FC<MessageReactionProps> = ({
  icon,
  count,
  userReacted,
  onClick = () => {},
}) => (
  <div
    onClick={onClick}
    className={`badge min-w-[3rem] justify-normal bg-white border-2 border-gray-200 ${
      userReacted ? '!bg-blue-400 text-white !border-gray-300' : ''
    }`}
  >
    {icon} <div className="ml-1 text-xs">{count}</div>
  </div>
);

const reactionTypeIconRecord: Record<ReactionType, ReactElement> = {
  like: <FiThumbsUp size={16} className="fill-blue-400 text-white mb-[2px]" />,
  heart: <FiHeart size={16} className="fill-red-500 text-white" />,
};

const statusTypeIconRecord: Record<Exclude<StatusType, 'deleted'>, ReactElement> = {
  received: <TbCheck size={16} />,
  sent: <TbCheck className="text-success" size={16} />,
  seen: <TbChecks className="text-success" size={16} />,
  sending: <></>,
};

const Message: React.FC<MessageProps> = ({
  title,
  avatarUrl,
  reactions,
  status,
  children,
  postDate,
  className = '',
  isSender = false,
  isFocused = false,
  displayStyle = 'normal',
  retrievableDurationInSec,
  replyTo,
  onMessageInview = () => {},
  onRemoveMessage = () => {},
  onRetrieveMessage = () => {},
  onAvatarClick = () => {},
  onReactToMessage = () => {},
  onReplyClick = () => {},
}) => {
  const { ref: inViewRef, inView } = useInView();
  const [_, rerender] = useReducer((x) => x + 1, 0);
  const [shownPopupType, setShownPopupType] = useState<'options' | 'emojis' | ''>('');
  const [element, setElement] = useState<HTMLElement>();

  useEffect(() => {
    if (inView) {
      onMessageInview();
    }
  }, [inView, onMessageInview]);

  useEffect(() => {
    const id = setInterval(() => {
      rerender();
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!element) return;
    if (isFocused) {
      element.scrollIntoView();
    }
  }, [element, isFocused]);

  const isRetrievable = Date.now() - postDate.valueOf() <= retrievableDurationInSec * 1000;
  return (
    <div
      ref={(e) => {
        inViewRef(e);
        setElement(e as HTMLElement);
      }}
      className={`group flex px-3 ${isSender ? 'justify-end' : 'justify-start'} ${className}`}
    >
      {/* Sender avatar */}
      {!isSender && (
        <div className="flex-none w-11 mr-2">
          {avatarUrl && <Avatar onAvatarClick={onAvatarClick} avatarUrls={avatarUrl} />}
        </div>
      )}
      {/* Message body */}
      <div
        className={`
          dropdown ${isSender ? 'dropdown-left' : 'dropdown-right'} 
          relative block max-w-[85%]
          
        `}
      >
        <div>
          <div
            className={messageContentClassNames({
              state: status === 'sending' ? 'sending' : 'normal',
              side: isSender ? 'sender' : 'recipient',
              focus: isFocused,
              emoji: displayStyle === 'emoji',
            })}
          >
            {displayStyle === 'emoji' && <div>{children}</div>}
            {displayStyle === 'normal' && (
              <>
                {replyTo && (
                  <div className="relative rounded-md px-4 py-2 border border-gray-200 w-64 bg-gray-100 cursor-pointer text-sm text-gray-500 mb-3">
                    <div className="font-bold text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                      <BsQuote /> {replyTo.sender.firstName} {replyTo.sender.lastName}
                    </div>
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {replyTo.type === 'text' && (replyTo.content as string)}
                      {replyTo.type === 'file' && (
                        <div className="flex">
                          <div className="flex-none w-12">
                            <FileIcon
                              extension={replyTo.fileName?.split('.').pop() as DefaultExtensionType}
                              {...defaultStyles[
                                replyTo.fileName?.split('.').pop() as DefaultExtensionType
                              ]}
                            />
                          </div>
                          <div className="ml-4 py-1 text-sm overflow-hidden whitespace-nowrap">
                            <div className="font-semibold overflow-hidden text-ellipsis">
                              {replyTo.fileName}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  {title && <div className="font-semibold text-[0.8rem] mb-0.5">{title}</div>}
                  <div>{children}</div>
                </div>
                <div className="flex justify-between items-center mt-2 empty:hidden">
                  {postDate && (
                    <time className="text-xs opacity-70">{formatDistanceToNow(postDate)} ago</time>
                  )}
                  {reactions && (
                    <div className="flex justify-end gap-1 ml-6">
                      {Object.entries(reactions).map(([reactionType, { count, userReacted }]) => (
                        <MessageReaction
                          userReacted={userReacted}
                          key={reactionType}
                          icon={reactionTypeIconRecord[reactionType as ReactionType]}
                          count={count}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          {status && (
            <div className="absolute top-[100%] w-full flex justify-end pr-1.5">
              <div>{statusTypeIconRecord[status]}</div>
            </div>
          )}
        </div>
        {/* Message actions popup */}
        <ul
          className={`
            hidden group-hover:flex absolute gap-1.5 w-max 
            ${isSender ? 'right-[calc(100%+8px)]' : 'left-[calc(100%+8px)]'} 
            top-[50%] translate-y-[-50%] focus-within:opacity-0 focus-within:pointer-events-none'
            }`}
        >
          {/* Using labels instead of buttons so they won't open dropdown when being clicked */}
          <li>
            <label onClick={onReplyClick} className="cursor-pointer">
              <BsReply size={20} />
            </label>
          </li>
          {/* Send reactions to emoji content type is not allowed*/}
          {displayStyle !== 'emoji' && (
            <li>
              <label
                tabIndex={0}
                onFocus={() => {
                  setShownPopupType('emojis');
                }}
                className="cursor-pointer"
              >
                <TbMoodPlus size={20} />
              </label>
            </li>
          )}
          <li>
            <label
              onFocus={() => setShownPopupType('options')}
              className="cursor-pointer"
              tabIndex={0}
            >
              <BsThreeDots size={20} />
            </label>
          </li>
        </ul>
        {/* Options */}
        {shownPopupType === 'options' && (
          <ul className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-52">
            <li className="text-red-500">
              <button onClick={onRemoveMessage}>
                <FiTrash size={20} />
                Delete
              </button>
            </li>
            {isSender && isRetrievable && (
              <li className="text-red-500">
                <button onClick={onRetrieveMessage}>
                  <FiTrash size={20} />
                  Retrieve
                </button>
              </li>
            )}
          </ul>
        )}

        {/* Emoji selector */}
        {shownPopupType === 'emojis' && displayStyle !== 'emoji' && (
          <ul
            className={`dropdown-content absolute flex shadow bg-base-100 py-2 px-3 rounded-md 
              ${
                isSender ? 'left-0 -translate-x-[calc(100%+8px)]' : 'right-0 translate-x-[8px]'
              } !top-[50%] -translate-y-[50%] z-50 gap-3 w-fit`}
          >
            <button
              onClick={() => {
                onReactToMessage('heart');
                setShownPopupType('');
              }}
            >
              <FiHeart
                className={`hover:fill-red-500 ${
                  reactions?.heart?.userReacted ? 'fill-red-500' : ''
                }`}
              />
            </button>
            <button
              onClick={() => {
                onReactToMessage('like');
                setShownPopupType('');
              }}
            >
              <FiThumbsUp
                className={`hover:fill-primary ${
                  reactions?.like?.userReacted ? 'fill-primary' : ''
                }`}
              />
            </button>
          </ul>
        )}
      </div>
      {/* My avatar */}
      {isSender && (
        <div className="flex-none w-11 ml-2">
          {avatarUrl && <Avatar onAvatarClick={onAvatarClick} avatarUrls={avatarUrl} />}
        </div>
      )}
    </div>
  );
};

export default Message;
