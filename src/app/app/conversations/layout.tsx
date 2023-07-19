'use client';

import React, { use, useEffect, useMemo, useState } from 'react';
import ConversationMenuItem, { ConversationMenuItemHOC } from './ConversationMenuItem';
import { useRouter } from 'next/navigation';
import { Conversation, GroupConversation, User } from '@/types/types';
import { useAuthStore } from '@/app/_store/auth.store';
import { useConversationStore } from '@/app/_store/conversation.store';
import { BsSearch } from 'react-icons/bs';
import { debounce } from 'lodash';

const Sidebar = () => {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { conversations } = useConversationStore();
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState<Conversation[]>([]);

  const searchConversation = useMemo(
    () =>
      debounce((conversations: Conversation[], searchText: string) => {
        setSearchResult(
          conversations.filter((conversation) => {
            const lowercasedSearchText = searchText.toLowerCase();
            if (
              conversation.participants.some(
                (user) =>
                  user.firstName.toLowerCase().includes(lowercasedSearchText) ||
                  user.lastName.toLowerCase().includes(lowercasedSearchText),
              )
            ) {
              return true;
            }
            if (conversation.type === 'group') {
              return (conversation as GroupConversation).title
                .toLowerCase()
                .includes(lowercasedSearchText);
            }
            return false;
          }),
        );
      }, 300),
    [],
  );

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const newSearchText = e.target.value;
    setSearchText(newSearchText);
    searchConversation(conversations, newSearchText);
  };

  const content = searchText ? (
    <>
      <div className="prose my-5 px-3">
        <h2>Matched result</h2>
      </div>
      {searchResult.map((conversation, i) => {
        return (
          <ConversationMenuItemHOC
            conversation={conversation}
            currentUserId={currentUser.id}
            key={conversation.id}
            includeDivider={i !== searchResult.length - 1}
            onClick={() => router.push(`app/conversations/${conversation.id}`)}
          />
        );
      })}
    </>
  ) : (
    <>
      <div className="prose my-5 px-3">
        <h2>Conversations</h2>
      </div>
      {conversations.map((conversation, i) => {
        return (
          <ConversationMenuItemHOC
            conversation={conversation}
            currentUserId={currentUser.id}
            key={conversation.id}
            includeDivider={i !== conversations.length - 1}
            onClick={() => router.push(`app/conversations/${conversation.id}`)}
          />
        );
      })}
    </>
  );
  return (
    <div className="menu w-80 py-4 h-full overflow-y-auto flex-nowrap border-r-2 border-gray-200">
      <div className="relative">
        <input
          onChange={handleChange}
          value={searchText}
          type="text"
          className="input input-bordered focus:outline-none w-full pr-12"
          placeholder="Search in conversations"
        />
        <button className="absolute right-3 top-[50%] translate-y-[-50%] text-gray-400 text-xl p-1">
          <BsSearch />
        </button>
      </div>
      {content}
    </div>
  );
};

export default function ConversationLayout({ children }: { children: React.ReactNode }) {
  const { init } = useConversationStore();
  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="h-full flex flex-1">
      <div className="flex-none">
        <Sidebar />
      </div>
      {children}
    </div>
  );
}
