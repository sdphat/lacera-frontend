'use client';

import { useContactsStore } from '@/app/_store/contacts.store';
import Avatar from '@/app/_components/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const Contacts = () => {
  const { contacts, getContacts } = useContactsStore();
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  useEffect(() => {
    getContacts();
  }, [getContacts]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    router.push(`/app/contacts/search?q=${searchText}`);
  };
  return (
    <div className="px-4 pt-4 pb-3 w-full">
      <div className="px-12">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Group, person..."
            className="input w-full"
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
          />
        </form>
      </div>
      <div className="flex flex-wrap gap-y-6 mt-6">
        {contacts.map((contact) => (
          <div key={contact.id} className="w-[33%]">
            <Avatar
              onAvatarClick={() => router.push(`/app/profile/${contact.id}`)}
              avatarUrl={contact.avatarUrl}
              title={`${contact.firstName} ${contact.lastName}`}
              subTitle={`Active ${formatDistanceToNow(new Date(contact.lastActive))} ago`}
              className="mx-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contacts;
