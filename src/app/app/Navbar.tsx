import Image from 'next/image';
import React from 'react';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { logout } from '../_services/auth.service';

const Navbar = () => {
  return (
    <div className="navbar border-b-2 border-gray-200 min-h-0">
      <div className="flex-1 pl-2">
        <h3 className="text-xl font-bold">Lacera</h3>
      </div>
      <div className="flex-none pr-3">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar min-h-0 w-11 h-11">
            <div className="w-full rounded-full">
              <Image alt="" width={24} height={24} src="/photo-1534528741775-53994a69daeb.jpg" />
            </div>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li className="hover:bg-white">
              <a>
                <FiUser size={20} />
                Profile
              </a>
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
