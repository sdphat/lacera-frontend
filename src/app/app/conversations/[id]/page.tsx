'use client';

import React, { useState, MouseEventHandler, useRef, useEffect, useMemo } from 'react';
import Avatar from '@/app/_components/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { ConversationLogItem, User, GroupConversation, Message } from '@/types/types';
import MessageBlock from './MessageBlock';
import InputBar from './InputBar';
import { FiMoreVertical, FiTrash } from 'react-icons/fi';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/_store/auth.store';
import { useConversationStore } from '@/app/_store/conversation.store';
import { BsChevronDoubleDown } from 'react-icons/bs';
import { countBy, throttle } from 'lodash';
import ConfirmDialog from '@/app/_components/ConfirmDialog';
import DeletedMessageNotification from './DeletedMessageNotification';
import { groupLogByBlock } from '@/app/_lib/helper';

export function Conversation() {
  const router = useRouter();
  const params = useParams();
  const chatboxRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuthStore();
  const {
    conversations,
    sendMessage,
    updateMessagesSeenStatus,
    removeConversation,
    removeMessage,
    retrieveMessage,
  } = useConversationStore();
  const [text, setText] = useState('');
  const [shouldDisplayScrollButton, setShouldDisplayScrollButton] = useState(false);
  const [shouldDisplayDeleteConvDialog, setShouldDisplayDeleteConvDialog] = useState(false);
  const [shouldDisplayDeleteMessDialog, setShouldDisplayDeleteMessDialog] = useState(false);
  const [shouldDisplayRetrieveMessDialog, setShouldDisplayRetrieveMessDialog] = useState(false);
  const [chosenMessage, setChosenMessage] = useState<Message>();
  const justSentRef = useRef(false);

  console.log(conversations);

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

  if (!conversation || !currentUser) {
    return;
  }

  const isPrivateChat = conversation.type === 'private';
  const recipient = conversation.participants.find(
    (p: { id: number }) => p.id !== currentUser.id,
  ) as User;

  const blocks = groupLogByBlock(conversation.messages);
  const messageBlockCount = blocks.reduce(
    (count, block) => count + Number(block.type === 'messages'),
    0,
  );

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
    if (!currentUser) {
      return;
    }

    if (
      currentUser.id !== message.senderId &&
      (!message.messageUsers.length ||
        message.messageUsers.some(
          (mu) => mu.recipientId === currentUser.id && mu.messageStatus === 'received',
        ))
    ) {
      await updateMessagesSeenStatus(message.conversationId, [message]);
    }
  };

  const handleConfirmDeleteConv = async () => {
    setShouldDisplayDeleteConvDialog(false);
    if (conversation) {
      await removeConversation({ conversationId: conversation.id });
      router.push('/app/conversations');
    }
  };

  const handleCancelDeleteConv = async () => {
    setShouldDisplayDeleteConvDialog(false);
  };

  const handleDeleteMessage = async (message: Message) => {
    setChosenMessage(message);
    setShouldDisplayDeleteMessDialog(true);
  };

  const handleCancelDeleteMess = async () => {
    setShouldDisplayDeleteMessDialog(false);
    setChosenMessage(undefined);
  };

  const handleConfirmDeleteMess = async () => {
    // Typesafe
    if (!chosenMessage) {
      return;
    }

    removeMessage({ messageId: chosenMessage.id });
    setShouldDisplayDeleteMessDialog(false);
    setChosenMessage(undefined);
  };

  const handleConfirmRetrieveMess = () => {
    if (!chosenMessage) {
      return;
    }
    retrieveMessage({ messageId: chosenMessage.id });
    setShouldDisplayRetrieveMessDialog(false);
    setChosenMessage(undefined);
  };

  const handleCancelRetrieveMess = () => {
    setShouldDisplayRetrieveMessDialog(false);
    setChosenMessage(undefined);
  };

  const handleRetrieveMessage = (message: Message) => {
    setChosenMessage(message);
    setShouldDisplayRetrieveMessDialog(true);
  };

  // For rendering
  let currentMessageBlockIdx = 0;

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
                <button onClick={() => setShouldDisplayDeleteConvDialog(true)}>
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
          {blocks.map((block, i) => {
            if (block.type === 'messages') {
              currentMessageBlockIdx++;
              return (
                <MessageBlock
                  onMessageInview={handleMessageInview}
                  key={block.id}
                  isSender={block.senderId === currentUser!.id}
                  log={block.messages}
                  sender={block.sender}
                  onRemoveMessage={handleDeleteMessage}
                  onRetrieveMessage={handleRetrieveMessage}
                  showLastMessageStatus={currentMessageBlockIdx === messageBlockCount}
                  // 2 min
                  retrievableDurationInSec={120}
                />
              );
            }
            if (block.type === 'deleted-notification') {
              return <DeletedMessageNotification key={block.id} />;
            }
          })}
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
          open={shouldDisplayDeleteConvDialog}
          onConfirm={handleConfirmDeleteConv}
          onCancel={handleCancelDeleteConv}
          title="Delete Conversation"
          message="This action is irreversable. Are you sure?"
        />
        <ConfirmDialog
          open={shouldDisplayDeleteMessDialog}
          onConfirm={handleConfirmDeleteMess}
          onCancel={handleCancelDeleteMess}
          title="Delete Message"
          message="Delete this message on your side. This action is irreversable. Are you sure?"
        />
        <ConfirmDialog
          open={shouldDisplayRetrieveMessDialog}
          onConfirm={handleConfirmRetrieveMess}
          onCancel={handleCancelRetrieveMess}
          title="Retrieve Message"
          message="Delete this message on both sides. This action is irreversable. Are you sure?"
        />
      </div>
    </div>
  );
}

export default Conversation;
