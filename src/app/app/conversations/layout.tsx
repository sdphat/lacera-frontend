'use client';

import React, { use, useEffect, useMemo } from 'react';
import ConversationMenuItem from './ConversationMenuItem';
import { useRouter } from 'next/navigation';
import { Conversation } from '@/types/types';
import { useAuthStore } from '@/app/_store/auth.store';
import { useConversationStore } from '@/app/_store/conversation.store';

const Sidebar = ({ conversations }: { conversations: Conversation[] }) => {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const conversationMenuItems = conversations.map((conversation, i) => {
    const isPrivateChat = conversation.participants.length === 2;
    const recipient = conversation.participants.find((p) => p.id !== currentUser.id);
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    console.log(lastMessage);
    return (
      <ConversationMenuItem
        key={conversation.id}
        avatarUrl={isPrivateChat ? recipient!.avatarUrl : conversation.avatar}
        title={
          isPrivateChat ? `${recipient!.firstName}  ${recipient!.lastName}` : conversation.title
        }
        subTitle={
          lastMessage
            ? lastMessage.sender.id === currentUser.id
              ? `You: ${lastMessage.content}`
              : `${lastMessage.sender.firstName} ${lastMessage.sender.lastName}: ${lastMessage.content}`
            : 'Say hi to everyone 😊'
        }
        includeDivider={i !== conversations.length - 1}
        onClick={() => router.push(`app/conversations/${conversation.id}`)}
      />
    );
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
  const conversationsInitPromise = useMemo(() => init(), [init]);
  const _init = use(conversationsInitPromise);
  return (
    <div className="h-full flex flex-1">
      <div className="flex-none">
        <Sidebar conversations={conversations} />
      </div>
      {children}
    </div>
  );
}
