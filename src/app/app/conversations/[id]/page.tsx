'use client';

import React, { useState, MouseEventHandler, useRef, useEffect, useMemo } from 'react';
import Avatar from '@/app/_components/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { ConversationLogItem, User, GroupConversation } from '@/types/types';
import MessageBlock from './MessageBlock';
import InputBar from './InputBar';
import { FiMoreVertical, FiTrash } from 'react-icons/fi';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/_store/auth.store';
import { useConversationStore } from '@/app/_store/conversation.store';
import { BsChevronDoubleDown } from 'react-icons/bs';
import { throttle } from 'lodash';
import ConfirmDialog from '@/app/_components/ConfirmDialog';

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
  const router = useRouter();
  const params = useParams();
  const chatboxRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuthStore();
  const { conversations, sendMessage, updateMessagesSeenStatus, removeConversation } =
    useConversationStore();
  const [text, setText] = useState('');
  const [shouldDisplayScrollButton, setShouldDisplayScrollButton] = useState(false);
  const [shouldDisplayDeleteDialog, setShouldDisplayDeleteDialog] = useState(false);
  const justSentRef = useRef(false);

  const conversationId = Number(params.id);
  let conversation = conversations.find((c) => c.id === conversationId);

  useEffect(() => {
    if (justSentRef.current) {
      chatboxRef.current?.scrollTo({ top: chatboxRef.current.scrollHeight });
      justSentRef.current = false;
    }
  }, [conversation?.messages.length]);

  // Scroll to bottom when the conversation is opened or everytime a new message is arrived
  useEffect(() => {
    if (chatboxRef.current && !shouldDisplayScrollButton) {
      chatboxRef.current.scrollTo({ top: chatboxRef.current.scrollHeight });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.messages.length]);

  const handleScrollUpdate = useMemo(
    () =>
      throttle((e) => {
        const chatbox = chatboxRef.current;
        if (chatbox) {
          const bottomMostTop = chatbox.scrollHeight - chatbox.offsetHeight;
          const lowThreshold = bottomMostTop - 100;
          if (chatbox.scrollTop < lowThreshold) {
            setShouldDisplayScrollButton(true);
          } else {
            setShouldDisplayScrollButton(false);
          }
        }
      }, 100),
    [],
  );

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

  const handleClickScrollToBottom: MouseEventHandler<HTMLElement> = (e) => {
    chatboxRef.current?.scrollTo({ top: chatboxRef.current.scrollHeight });
  };

  const handleMessageInview = async (message: ConversationLogItem) => {
    if (currentUser.id !== message.senderId && message.status === 'received') {
      await updateMessagesSeenStatus(message.conversationId, [message]);
    }
  };

  const handleConfirmDelete = async () => {
    setShouldDisplayDeleteDialog(false);
    if (conversation) {
      await removeConversation({ conversationId: conversation.id });
      router.push('/app/conversations');
    }
    console.log('yea');
  };

  const handleCancelDelete = async () => {
    setShouldDisplayDeleteDialog(false);
    console.log('naw');
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex justify-between flex-none px-4 pt-4 pb-3 border-b-2 border-gray-200 w-full">
        <div>
          {isPrivateChat ? (
            <Avatar
              avatarUrls={recipient.avatarUrl}
              title={`${recipient.firstName} ${recipient.lastName}`}
              subTitle={`Active ${formatDistanceToNow(recipient.lastActive)} ago`}
            />
          ) : (
            <Avatar
              avatarUrls={conversation.avatar ?? conversation.participants.map((p) => p.avatarUrl)}
              title={(conversation as GroupConversation).title}
              subTitle={`${conversation.participants.length} members`}
            />
          )}
        </div>
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-circle btn-ghost">
              <FiMoreVertical size={22} />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li className="text-red-500">
                <button onClick={() => setShouldDisplayDeleteDialog(true)}>
                  <FiTrash size={20} />
                  Delete conversation
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <div
          ref={chatboxRef}
          onScroll={handleScrollUpdate}
          className="relative flex-1 min-h-0 overflow-x-hidden overflow-y-auto py-4 space-y-7"
        >
          {groupLogByUserBlock(conversation.messages).map((block) => (
            <MessageBlock
              onMessageInview={handleMessageInview}
              key={block[0].id}
              isSender={block[0].senderId === currentUser.id}
              log={block}
              sender={block[0].sender}
            />
          ))}
          <button
            style={{
              display: shouldDisplayScrollButton ? '' : 'none',
            }}
            onClick={handleClickScrollToBottom}
            className="sticky bottom-2 right-2 float-right btn btn-circle bg-primary text-white border-none hover:bg-primary ring ring-blue-300"
          >
            <BsChevronDoubleDown
              className="animate-[wiggle-down_1s_ease-in-out_infinite]"
              size={24}
            />
          </button>
        </div>
        <InputBar
          value={text}
          onChange={(e) => setText(e.target.value)}
          onSend={handleSendMessage}
          onThumbupClick={handleThumbupClick}
        />
        <ConfirmDialog
          open={shouldDisplayDeleteDialog}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          title="Delete Conversation"
          message="This action is irreversable. Are you sure?"
        />
      </div>
    </div>
  );
}

export default Conversation;
