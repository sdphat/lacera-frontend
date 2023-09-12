import { FiPaperclip, FiSend, FiSmile, FiThumbsUp } from 'react-icons/fi';
import React, { ChangeEventHandler, FormEventHandler, MouseEventHandler, useRef } from 'react';
import { ConversationLogItem } from '@/types/types';
import { BsQuote } from 'react-icons/bs';
import { DefaultExtensionType, FileIcon, defaultStyles } from 'react-file-icon';

export interface InputBarProps {
  value: string;
  replyTo?: ConversationLogItem;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onThumbupClick?: MouseEventHandler<HTMLElement>;
  onSendText?: FormEventHandler<HTMLElement>;
  onReplyMessageClick?: MouseEventHandler<HTMLElement>;
  onReplyMessageRemove?: MouseEventHandler<HTMLElement>;
  onFilesSelect?: (fileList: FileList) => any;
}

const InputBar: React.FC<InputBarProps> = ({
  value,
  onChange,
  onThumbupClick = () => {},
  onSendText = () => {},
  onReplyMessageClick = () => {},
  onReplyMessageRemove = () => {},
  onFilesSelect = () => {},
  replyTo,
}) => {
  const mode: 'send' | 'thumbup' = value.trim() ? 'send' : 'thumbup';
  const inputFileRef = useRef<HTMLInputElement>(null);
  const handleSend: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    onSendText(e);
  };

  return (
    <form
      onSubmit={handleSend}
      className="flex flex-none items-center border-t-2 border-gray-200 py-3 px-2"
    >
      <div className="flex flex-none gap-1">
        <div
          onClick={(e) => {
            inputFileRef.current?.click();
          }}
          className="btn btn-square btn-ghost btn-sm"
        >
          <input
            onInput={(e) => onFilesSelect(e.currentTarget.files as FileList)}
            ref={inputFileRef}
            type="file"
            multiple
            className="hidden"
          />
          <FiPaperclip size={18} />
        </div>
        <div className="btn btn-square btn-ghost btn-sm">
          <FiSmile size={18} />
        </div>
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
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onReplyMessageRemove(e);
                }}
                className="absolute top-1 right-3 text-lg"
              >
                &times;
              </div>
              <div className="font-bold text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                <BsQuote /> {replyTo.sender.firstName} {replyTo.sender.lastName}
              </div>
              <div className="whitespace-nowrap overflow-hidden text-ellipsis mt-2">
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
          onClick={mode === 'send' ? onSendText : onThumbupClick}
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
