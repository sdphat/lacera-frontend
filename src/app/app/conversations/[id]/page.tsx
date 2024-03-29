'use client';

import React, { useState, MouseEventHandler, useRef, useEffect, useMemo } from 'react';
import Avatar from '@/app/_components/Avatar';
import { formatDistanceToNow } from 'date-fns';
import {
  ConversationLogItem,
  User,
  GroupConversation,
  ReactionType,
  MessageType,
} from '@/types/types';
import MessageBlock from './MessageBlock';
import InputBar from './InputBar';
import {
  FiChevronRight,
  FiCornerDownLeft,
  FiCornerLeftDown,
  FiMoreVertical,
  FiRepeat,
  FiTrash,
} from 'react-icons/fi';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/_store/auth.store';
import { useConversationStore } from '@/app/_store/conversation.store';
import { BsChevronDoubleDown } from 'react-icons/bs';
import { throttle } from 'lodash';
import ConfirmDialog from '@/app/_components/ConfirmDialog';
import DeletedMessageNotification from './DeletedMessageNotification';
import { groupLogByBlock, groupReactionByCount } from '@/app/_lib/helper';
import Modal from '@/app/_components/Modal';

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
    reactToMessage,
    leaveGroup,
  } = useConversationStore();
  const [text, setText] = useState('');
  const [shouldDisplayScrollButton, setShouldDisplayScrollButton] = useState(false);
  const [shouldDisplayDeleteConvDialog, setShouldDisplayDeleteConvDialog] = useState(false);
  const [shouldDisplayDeleteMessDialog, setShouldDisplayDeleteMessDialog] = useState(false);
  const [shouldDisplayRetrieveMessDialog, setShouldDisplayRetrieveMessDialog] = useState(false);
  const [shouldDisplayLeaveGroupDialog, setShouldDisplayLeaveGroupDialog] = useState(false);
  const [shouldDisplayGroupMembers, setShouldDisplayGroupMembers] = useState(false);
  const [chosenMessage, setChosenMessage] = useState<ConversationLogItem>();
  const [replyMessage, setReplyMessage] = useState<ConversationLogItem>();
  const [focusedMessageId, setFocusMessageId] = useState<number>();
  const [fileList, setFileList] = useState<FileList>();
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

  if (!conversation || !currentUser) {
    return;
  }

  const isPrivateChat = conversation.type === 'private';
  const recipient = conversation.participants.find(
    (p: { id: number }) => p.id !== currentUser.id,
  ) as User;

  const blocks = groupLogByBlock(
    conversation.messages.map<ConversationLogItem>((message) => ({
      ...message,
      reactions: groupReactionByCount(message.reactions, currentUser.id),
    })),
  );
  const messageBlockCount = blocks.reduce(
    (count, block) => count + Number(block.type === 'messages'),
    0,
  );

  const sendMessageResetState = async ({
    type,
    content,
    replyTo,
  }:
    | {
        type: 'text';
        content: string;
        replyTo?: number;
      }
    | {
        type: 'file';
        content: File;
        replyTo?: number;
      }) => {
    justSentRef.current = true;
    setReplyMessage(undefined);
    setFocusMessageId(undefined);
    await sendMessage({ type, content, replyTo, conversationId, postDate: new Date() });
  };

  const handleThumbupClick: MouseEventHandler<HTMLElement> = async (e) => {
    await sendMessageResetState({ content: '👍', type: 'text' });
  };

  const handleSendTextMessage: MouseEventHandler<HTMLElement> = async (e) => {
    if (text) {
      setText('');
      await sendMessageResetState({
        type: 'text',
        content: text,
        replyTo: replyMessage ? replyMessage.id : undefined,
      });
    }
  };

  const handleSendFile = async (fileList: FileList) => {
    if (fileList && fileList.length) {
      await Promise.allSettled(
        Array.from(fileList).map((file) =>
          sendMessageResetState({
            type: 'file',
            content: file,
            replyTo: replyMessage ? replyMessage.id : undefined,
          }),
        ),
      );
      setFileList(undefined);
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
      await updateMessagesSeenStatus(message.conversationId, [message.id]);
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

  const handleDeleteMessage = async (message: ConversationLogItem) => {
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

  const handleRetrieveMessage = (message: ConversationLogItem) => {
    setChosenMessage(message);
    setShouldDisplayRetrieveMessDialog(true);
  };

  const handleReactToMessage = async (message: ConversationLogItem, reactionType: ReactionType) => {
    await reactToMessage({ messageId: message.id, reactionType });
  };

  const handleReplyToMessage = (message: ConversationLogItem) => {
    setReplyMessage(message);
  };

  const handleReplyMessageClick = () => {
    if (!conversation || !replyMessage) return;
    setFocusMessageId(replyMessage.id);
  };

  const handleReplyMessageRemove = () => {
    setReplyMessage(undefined);
    setFocusMessageId(undefined);
  };

  // For rendering
  let currentMessageBlockIdx = 0;

  const handleFilesSelect = (fileList: FileList) => {
    setFileList(fileList);
    handleSendFile(fileList);
  };

  const handleConfirmLeaveGroup = () => {
    if (!conversation) return;
    setShouldDisplayLeaveGroupDialog(false);
    leaveGroup(conversation.id);
  };

  const handleCancelLeaveGroup = () => {
    setShouldDisplayLeaveGroupDialog(false);
  };

  const handleViewGroupMembers = () => {
    setShouldDisplayGroupMembers(true);
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex justify-between flex-none px-4 pt-4 pb-3 border-b-2 border-gray-200 w-full">
        <div>
          {isPrivateChat ? (
            <Avatar
              onAvatarClick={() => router.push(`/app/profile/${recipient.id}`)}
              avatarUrls={recipient.avatarUrl}
              title={`${recipient.firstName} ${recipient.lastName}`}
              subTitle={
                recipient.online
                  ? 'Online'
                  : `Active ${formatDistanceToNow(recipient.lastActive)} ago`
              }
            />
          ) : (
            <Avatar
              avatarUrls={conversation.avatar ?? conversation.participants.map((p) => p.avatarUrl)}
              title={(conversation as GroupConversation).title}
              subTitle={
                <div className="cursor-pointer" onClick={handleViewGroupMembers}>
                  {conversation.participants.length} members
                  <FiChevronRight className="inline-block" />
                </div>
              }
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
                {conversation.type === 'group' && (
                  <button onClick={() => setShouldDisplayLeaveGroupDialog(true)}>
                    <FiCornerDownLeft size={20} />
                    Leave group
                  </button>
                )}
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
                  onAvatarClick={() => router.push(`/app/profile/${block.sender.id}`)}
                  onMessageInview={handleMessageInview}
                  key={block.id}
                  isSender={block.senderId === currentUser!.id}
                  log={block.messages}
                  sender={block.sender}
                  onRemoveMessage={handleDeleteMessage}
                  onRetrieveMessage={handleRetrieveMessage}
                  showLastMessageStatus={currentMessageBlockIdx === messageBlockCount}
                  onReactToMessage={handleReactToMessage}
                  onReplyToMessage={handleReplyToMessage}
                  focusedMessageId={focusedMessageId}
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
          replyTo={replyMessage}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 200))}
          onSendText={handleSendTextMessage}
          onThumbupClick={handleThumbupClick}
          onFilesSelect={handleFilesSelect}
          onReplyMessageClick={() => handleReplyMessageClick()}
          onReplyMessageRemove={() => handleReplyMessageRemove()}
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
        <ConfirmDialog
          open={shouldDisplayLeaveGroupDialog}
          onConfirm={handleConfirmLeaveGroup}
          onCancel={handleCancelLeaveGroup}
          title="Leave group"
          message="Are you sure you want to leave this group?"
        />
        <Modal
          open={shouldDisplayGroupMembers}
          confirmBtnText=""
          cancelBtnText=""
          className="max-w-sm"
          onCancel={() => setShouldDisplayGroupMembers(false)}
          title={
            <div className="text-center">Group members ({conversation.participants.length})</div>
          }
        >
          <ul className="mt-8 space-y-4 px-1">
            {conversation.participants.map((p) => (
              <li key={p.id}>
                <Avatar
                  onAvatarClick={() => router.push(`/app/profile/${p.id}`)}
                  avatarUrls={p.avatarUrl}
                  title={
                    <span>
                      {p.firstName} {p.lastName}{' '}
                      <span className="font-medium">{p.id === currentUser.id ? '(You)' : ''}</span>
                    </span>
                  }
                  subTitle={'Member'}
                />
              </li>
            ))}
          </ul>
        </Modal>
      </div>
    </div>
  );
}

export default Conversation;
