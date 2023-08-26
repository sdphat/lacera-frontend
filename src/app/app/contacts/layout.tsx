import Link from 'next/link';
import React, { ReactNode } from 'react';
import { FiSearch, FiUserPlus, FiUsers } from 'react-icons/fi';

const Sidebar = () => {
  const linkClassName = 'hover:bg-blue-50 py-2 text-base font-medium';
  return (
    <div className="menu menu-md w-[17rem] py-4 h-full overflow-y-auto flex-nowrap border-r-2 border-gray-200">
      <li>
        <Link className={linkClassName} href="/app/contacts">
          <FiUsers /> Friend list
        </Link>
      </li>
      <li>
        <Link className={linkClassName} href="/app/contacts/requests">
          <FiUserPlus /> Friend requests
        </Link>
      </li>
      <li>
        <Link className={linkClassName} href="/app/contacts/search">
          <FiSearch /> Search
        </Link>
      </li>
    </div>
  );
};

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-full flex flex-1">
      <div className="flex-none">
        <Sidebar />
      </div>
      {children}
    </div>
  );
};

export default layout;
