import { FiPaperclip, FiSend, FiSmile, FiThumbsUp } from 'react-icons/fi';
import React, { ChangeEventHandler, FormEventHandler, MouseEventHandler } from 'react';

export interface InputBarProps {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onThumbupClick?: MouseEventHandler<HTMLElement>;
  onSend?: FormEventHandler<HTMLElement>;
}

const InputBar: React.FC<InputBarProps> = ({
  value,
  onChange,
  onThumbupClick = () => {},
  onSend = () => {},
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
        <input
          value={value}
          onChange={onChange}
          placeholder="Type something you want to say here..."
          className="input input-bordered w-full h-10 focus:outline-none"
        />
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
