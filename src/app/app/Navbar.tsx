import Image from 'next/image';
import React from 'react';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { logout } from '../_services/auth.service';
import { useAuthStore } from '../_store/auth.store';
import Link from 'next/link';
import Avatar from '../_components/Avatar';

const Navbar = () => {
  const { currentUser } = useAuthStore();
  if (!currentUser) {
    return null;
  }
  return (
    <div className="navbar border-b-2 border-gray-200 bg-blue-400 min-h-0">
      <div className="flex-1 pl-2">
        <h3 className="text-xl font-bold text-white">Lacera</h3>
      </div>
      <div className="flex-none pr-3">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar min-h-0 w-11 h-11">
            <div className="w-full rounded-full">
              <Avatar avatarUrls={currentUser.avatarUrl} />
            </div>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50"
          >
            <li className="hover:bg-white">
              <Link href={`/app/profile/${currentUser.id}`}>
                <FiUser size={20} />
                Profile
              </Link>
            </li>
            <li>
              <button onClick={logout}>
                <FiLogOut size={20} />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
