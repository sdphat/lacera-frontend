import { FiPaperclip, FiSend, FiSmile, FiThumbsUp } from 'react-icons/fi';
import React, { ChangeEventHandler, FormEventHandler, MouseEventHandler } from 'react';
import { ConversationLogItem } from '@/types/types';
import { BsQuote } from 'react-icons/bs';

export interface InputBarProps {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onThumbupClick?: MouseEventHandler<HTMLElement>;
  onSend?: FormEventHandler<HTMLElement>;
  onReplyMessageClick?: MouseEventHandler<HTMLElement>;
  onReplyMessageRemove?: MouseEventHandler<HTMLElement>;
  replyTo?: ConversationLogItem;
}

const InputBar: React.FC<InputBarProps> = ({
  value,
  onChange,
  onThumbupClick = () => {},
  onSend = () => {},
  onReplyMessageClick = () => {},
  onReplyMessageRemove = () => {},
  replyTo,
}) => {
  const mode: 'send' | 'thumbup' = value.trim() ? 'send' : 'thumbup';
  const handleSend: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    onSend(e);
  };
  return (
    <form
      onSubmit={handleSend}
      className="flex flex-none items-center border-t-2 border-gray-200 py-3 px-2"
    >
      <div className="flex flex-none gap-1">
        <button className="btn btn-square btn-ghost btn-sm">
          <FiPaperclip size={18} />
        </button>
        <button className="btn btn-square btn-ghost btn-sm">
          <FiSmile size={18} />
        </button>
      </div>
      <div className="flex-1 min-w-0 px-2">
        <div className="input input-bordered w-full min-h-10 h-[auto] py-2">
          {replyTo && (
            <div
              onClick={(e) => {
                e.preventDefault();
                onReplyMessageClick(e);
              }}
              className="relative rounded-md px-4 py-2 border border-gray-200 w-96 bg-gray-100 cursor-pointer"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onReplyMessageRemove(e);
                }}
                className="absolute top-1 right-3 text-lg"
              >
                &times;
              </button>
              <div className="font-bold text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                <BsQuote /> {replyTo.sender.firstName} {replyTo.sender.lastName}
              </div>
              <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                {replyTo.content}
              </div>
            </div>
          )}
          <input
            value={value}
            onChange={onChange}
            placeholder="Type something you want to say here..."
            className="h-8 focus:outline-none w-full"
          />
        </div>
      </div>
      <div className="flex-none">
        <button
          onClick={mode === 'send' ? onSend : onThumbupClick}
          className="btn btn-circle btn-ghost hover:bg-gray-200"
        >
          {mode === 'send' ? (
            <FiSend size={22} className="text-primary fill-primary" />
          ) : (
            <FiThumbsUp size={22} className="text-primary" />
          )}
        </button>
      </div>
    </form>
  );
};

export default InputBar;
