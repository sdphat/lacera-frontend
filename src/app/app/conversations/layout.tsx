'use client';

import React, { use, useEffect, useMemo } from 'react';
import ConversationMenuItem from './ConversationMenuItem';
import { useRouter } from 'next/navigation';
import { Conversation, GroupConversation, User } from '@/types/types';
import { useAuthStore } from '@/app/_store/auth.store';
import { useConversationStore } from '@/app/_store/conversation.store';

const Sidebar = ({ conversations }: { conversations: Conversation[] }) => {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const conversationMenuItems = conversations.map((conversation, i) => {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const isPrivateChat = conversation.type === 'private';
    const subTitle = lastMessage
      ? lastMessage.sender.id === currentUser.id
        ? `You: ${lastMessage.content}`
        : `${lastMessage.sender.firstName} ${lastMessage.sender.lastName}: ${lastMessage.content}`
      : 'Say hi to everyone 😊';
    if (isPrivateChat) {
      const recipient = conversation.participants.find((p) => p.id !== currentUser.id)!;
      return (
        <ConversationMenuItem
          key={conversation.id}
          avatarUrl={recipient.avatarUrl}
          title={`${recipient!.firstName}  ${recipient!.lastName}`}
          subTitle={subTitle}
          includeDivider={i !== conversations.length - 1}
          onClick={() => router.push(`app/conversations/${conversation.id}`)}
        />
      );
    } else {
      const group = conversation as GroupConversation;
      return (
        <ConversationMenuItem
          key={group.id}
          avatarUrl={group.avatar}
          title={group.title}
          subTitle={subTitle}
          includeDivider={i !== conversations.length - 1}
          onClick={() => router.push(`app/conversations/${group.id}`)}
        />
      );
    }
  });

  return (
    <div className="menu w-80 py-4 h-full overflow-y-auto flex-nowrap border-r-2 border-gray-200">
      <div className="prose mb-5 px-3">
        <h2>Conversations</h2>
      </div>
      {conversationMenuItems}
    </div>
  );
};

export default function ConversationLayout({ children }: { children: React.ReactNode }) {
  const { init, conversations } = useConversationStore();
  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="h-full flex flex-1">
      <div className="flex-none">
        <Sidebar conversations={conversations} />
      </div>
      {children}
    </div>
  );
}
