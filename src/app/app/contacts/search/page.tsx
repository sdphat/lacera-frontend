'use client';

import { useContactsStore } from '@/app/_store/contacts.store';
import Avatar from '@/app/_components/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { use, useEffect, useMemo, useState } from 'react';
import { Contact } from '@/types/types';

const Search = () => {
  const { searchContacts } = useContactsStore();
  const [searchResult, setSearchResult] = useState<Contact[]>([]);
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  useEffect(() => {
    async function f() {
      const result = await searchContacts({ query });
      setSearchResult(result);
    }
    f();
  }, [query, searchContacts]);
  const router = useRouter();

  if (!query) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-y-6 mt-6">
        {searchResult.map((contact) => (
          <div key={contact.id} className="w-[33%]">
            <Avatar
              avatarUrl={contact.avatarUrl}
              title={`${contact.firstName} ${contact.lastName}`}
              subTitle={`Active ${formatDistanceToNow(new Date(contact.lastActive))} ago`}
              className="mx-2"
              onAvatarClick={() => router.push(`/app/profile/${contact.id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
