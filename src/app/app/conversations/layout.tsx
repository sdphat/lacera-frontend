'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ConversationMenuItemHOC } from './ConversationMenuItem';
import { useRouter } from 'next/navigation';
import { Contact, Conversation, GroupConversation } from '@/types/types';
import { useAuthStore } from '@/app/_store/auth.store';
import { useConversationStore } from '@/app/_store/conversation.store';
import { BsSearch } from 'react-icons/bs';
import { AiOutlineUsergroupAdd } from 'react-icons/ai';
import { debounce } from 'lodash';
import { useContactsStore } from '@/app/_store/contacts.store';
import AddGroupModal from './AddGroupModal';

const Sidebar: React.FC = () => {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { conversations, updateMessagesSeenStatus, createGroup, updateAllHeartbeats } =
    useConversationStore();
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState<Conversation[]>([]);
  const { contacts } = useContactsStore();
  const [shouldShowAddGroupModal, setShouldShowAddGroupModal] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    const intervalId = setInterval(updateAllHeartbeats, 5000);

    return () => clearInterval(intervalId);
  }, [currentUser, updateAllHeartbeats]);

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

  const makeClickConversationItemHandler: (
    conversationId: Conversation,
  ) => React.MouseEventHandler<HTMLElement> = (conversation) => async (e) => {
    if (!currentUser) {
      return;
    }
    router.push(`app/conversations/${conversation.id}`);
    await updateMessagesSeenStatus(
      conversation.id,
      conversation.messages
        .filter(
          (message) =>
            currentUser.id !== message.senderId &&
            (!message.messageUsers.length ||
              message.messageUsers.some(
                (mu) => mu.recipientId === currentUser.id && mu.messageStatus === 'received',
              )),
        )
        .map((m) => m.id),
    );
  };

  const onCreateGroup = async ({
    name,
    groupMembers,
  }: {
    name: string;
    groupMembers: Contact[];
  }) => {
    await createGroup({
      name,
      groupMemberIds: [currentUser!.id, ...groupMembers.map((c) => c.id)],
    });
  };

  if (!currentUser) {
    return null;
  }

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
            onClick={makeClickConversationItemHandler(conversation)}
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
            onClick={makeClickConversationItemHandler(conversation)}
          />
        );
      })}
    </>
  );

  return (
    <div className="menu w-[17rem] py-4 h-full overflow-y-auto flex-nowrap border-r-2 border-gray-200">
      <div className="flex items-center">
        <div className="relative">
          <input
            onChange={handleChange}
            value={searchText}
            type="text"
            className="input input-bordered focus:outline-none w-full pr-12 text-sm"
            placeholder="Search in conversations"
          />
          <div className="absolute right-3 top-[50%] translate-y-[-50%] flex gap-2">
            <button
              onClick={() => setShouldShowAddGroupModal(true)}
              className=" text-gray-400 text-xl p-1"
            >
              <AiOutlineUsergroupAdd className="fill-gray-500" />
            </button>
            <button className="text-gray-400 text-xl p-1">
              <BsSearch size={16} />
            </button>
          </div>
        </div>
      </div>
      <AddGroupModal
        key={String(shouldShowAddGroupModal)}
        open={shouldShowAddGroupModal}
        contacts={contacts}
        onCreate={onCreateGroup}
        onClose={() => setShouldShowAddGroupModal(false)}
      />
      {content}
    </div>
  );
};

export default function ConversationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-1">
      <div className="flex-none">
        <Sidebar />
      </div>
      {children}
    </div>
  );
}
