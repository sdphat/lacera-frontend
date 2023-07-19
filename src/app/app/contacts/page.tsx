'use client';

import { useContactsStore } from '@/app/_store/contacts.store';
import Avatar from '@/app/_components/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { groupContactsByAlphabet } from '@/app/_lib/contacts';
import { BsSearch } from 'react-icons/bs';

const Contacts = () => {
  const { contacts, getContacts } = useContactsStore();
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  useEffect(() => {
    getContacts();
  }, [getContacts]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (searchText) {
      router.push(`/app/contacts/search?q=${searchText}`);
    }
  };

  return (
    <div className="px-4 pt-4 pb-3 w-full">
      <div className="px-8">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              placeholder="Group, person..."
              className="input input-bordered focus:outline-none w-full pr-12"
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
            />
            <button className="absolute right-3 top-[50%] translate-y-[-50%] text-gray-400 text-xl p-1">
              <BsSearch />
            </button>
          </div>
        </form>
      </div>
      <section className="mx-8 mt-20">
        <h2 className="text-3xl font-bold">Friends</h2>
        <div className="space-y-16 mt-16">
          {Object.entries(groupContactsByAlphabet(contacts)).map(([key, contacts]) => (
            <div key={key}>
              <div>
                <div className="mx-4 text-3xl font-bold">{key}</div>
                <div className="divider my-1"></div>
              </div>
              <div className="flex flex-wrap gap-y-8 mt-6">
                {contacts.map((contact) => (
                  <div key={contact.id} className="w-[25%]">
                    <div
                      className="max-w-full w-max"
                      onClick={() => router.push(`/app/profile/${contact.id}`)}
                    >
                      <Avatar
                        avatarUrl={contact.avatarUrl}
                        title={`${contact.firstName} ${contact.lastName}`}
                        className="mx-2"
                        subTitle={`Active ${formatDistanceToNow(new Date(contact.lastActive))} ago`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Contacts;
