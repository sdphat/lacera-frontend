import React, { ReactNode } from 'react';

export interface TextMessageBodyProps {
  children: ReactNode;
}

const TextMessageBody: React.FC<TextMessageBodyProps> = ({ children }) => {
  return (
    <div>
      <div className="text-sm break-all">{children}</div>
    </div>
  );
};

export default TextMessageBody;
