import Link from 'next/link';
import React, { ReactNode } from 'react';
import { MdChatBubble, MdOutlineContactPage } from 'react-icons/md';

interface NavItem {
  icon: ReactNode;
  text: string;
  href: string;
}

const navItems: NavItem[] = [
  {
    icon: <MdOutlineContactPage color="white" size={20} />,
    text: 'Contacts',
    href: '/app/contacts',
  },
  {
    icon: <MdChatBubble color="white" size={20} />,
    text: 'Conversations',
    href: '/app/conversations',
  },
];

const Sidebar = () => {
  return (
    <div>
      <div className="menu bg-blue-400 w-44 h-full">
        {navItems.map((item) => (
          <li key={item.text} className="text-white">
            <Link className="py-2.5 text-sm" href={item.href}>
              {item.icon} {item.text}
            </Link>
          </li>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
