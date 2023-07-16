'use client';

import React, { useState, MouseEventHandler, useRef, useEffect, useLayoutEffect } from 'react';
import Avatar from '@/app/_components/Avatar';
import { formatDistanceToNow, sub } from 'date-fns';
import {
  Conversation as ConversationType,
  ConversationLogItem,
  User,
  GroupConversation,
} from '@/types/types';
import MessageBlock from './MessageBlock';
import InputBar from './InputBar';
import { FiMoreVertical } from 'react-icons/fi';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/app/_store/auth.store';
import { useConversationStore } from '@/app/_store/conversation.store';

const groupLogByUserBlock = (log: ConversationLogItem[]): ConversationLogItem[][] => {
  if (!log.length) {
    return [];
  }

  const groupedLog: ConversationLogItem[][] = [];
  let currentUserId = log[0].senderId;
  let block: ConversationLogItem[] = [];
  for (const item of log) {
    if (item.senderId === currentUserId) {
      block.push(item);
    } else {
      currentUserId = item.senderId;
      groupedLog.push(block);
      block = [item];
    }
  }
  groupedLog.push(block);
  return groupedLog;
};

export function Conversation() {
  const params = useParams();
  const chatboxRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuthStore();
  const { conversations, sendMessage } = useConversationStore();
  const [text, setText] = useState('');
  const justSentRef = useRef(false);

  const conversationId = Number(params.id);
  let conversation = conversations.find((c) => c.id === conversationId);

  useEffect(() => {
    if (justSentRef.current) {
      chatboxRef.current?.scrollTo({ top: chatboxRef.current.scrollHeight });
      justSentRef.current = false;
    }
  }, [conversation?.messages.length]);

  if (!conversation) {
    return;
  }
  const isPrivateChat = conversation.type === 'private';
  const recipient = conversation.participants.find(
    (p: { id: number }) => p.id !== currentUser.id,
  ) as User;

  const sendMessageUtil = async (content: string) => {
    justSentRef.current = true;
    await sendMessage({ content, conversationId, postDate: new Date() });
  };

  const handleThumbupClick: MouseEventHandler<HTMLElement> = async (e) => {
    await sendMessageUtil('👍');
  };

  const handleSendMessage: MouseEventHandler<HTMLElement> = async (e) => {
    if (text) {
      setText('');
      await sendMessageUtil(text);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex justify-between flex-none px-4 pt-4 pb-3 border-b-2 border-gray-200 w-full">
        <div>
          {isPrivateChat ? (
            <Avatar
              avatarUrl={recipient.avatarUrl}
              title={`${recipient.firstName} ${recipient.lastName}`}
              subTitle={`Active ${formatDistanceToNow(recipient.lastActive)} ago`}
            />
          ) : (
            <Avatar
              avatarUrl={conversation.avatar}
              title={(conversation as GroupConversation).title}
              subTitle={`${conversation.participants.length} members`}
            />
          )}
        </div>
        <div className="flex-none">
          <button className="btn btn-circle btn-ghost">
            <FiMoreVertical size={22} />
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <div ref={chatboxRef} className="flex-1 min-h-0 overflow-y-auto py-4 space-y-7">
          {groupLogByUserBlock(conversation.messages).map((block) => (
            <MessageBlock
              key={block[0].id}
              isSender={block[0].senderId === currentUser.id}
              log={block}
              sender={block[0].sender}
            />
          ))}
        </div>
        <InputBar
          value={text}
          onChange={(e) => setText(e.target.value)}
          onSend={handleSendMessage}
          onThumbupClick={handleThumbupClick}
        />
      </div>
    </div>
  );
}

export default Conversation;
