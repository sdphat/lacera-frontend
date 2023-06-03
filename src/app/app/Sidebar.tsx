import Link from 'next/link';
import React from 'react';
import { FiBook } from 'react-icons/fi';
import { MdChatBubble, MdOutlineContactPage } from 'react-icons/md';

const Sidebar = () => {
  return (
    <div>
      <div className="menu bg-blue-400 w-56 h-full">
        <li className="text-white">
          <a>
            <MdOutlineContactPage color="white" size={24} /> Contacts
          </a>
        </li>
        <li className="text-white">
          <Link href="/app/conversations">
            <MdChatBubble color="white" size={24} /> Conversations
          </Link>
        </li>
      </div>
    </div>
  );
};

export default Sidebar;
