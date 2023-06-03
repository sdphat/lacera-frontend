import Image from 'next/image';
import React from 'react';
import ConversationMenuItem from './ConversationMenuItem';

const conversations = [
  {
    id: 1,
    avatarUrl: '/photo-1534528741775-53994a69daeb.jpg',
    title: 'Natalia',
    subTitle: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  },
  {
    id: 2,
    avatarUrl: '/photo-1534528741775-53994a69daeb.jpg',
    title: 'Natalia',
    subTitle: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  },
  {
    id: 3,
    avatarUrl: '/photo-1534528741775-53994a69daeb.jpg',
    title: 'Natalia',
    subTitle: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  },
  {
    id: 4,
    avatarUrl: '/photo-1534528741775-53994a69daeb.jpg',
    title: 'Natalia',
    subTitle: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  },
  {
    id: 5,
    avatarUrl: '/photo-1534528741775-53994a69daeb.jpg',
    title: 'Natalia',
    subTitle: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  },
];

const Sidebar = () => {
  const conversationMenuItems = conversations.map((conversation, i) => (
    <ConversationMenuItem
      key={conversation.id}
      avatarUrl={conversation.avatarUrl}
      title={conversation.title}
      subTitle={conversation.subTitle}
      includeDivider={i !== conversations.length - 1}
    />
  ));

  return (
    <div>
      <div className="menu w-80 py-4 px-2 h-full">{conversationMenuItems}</div>
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
