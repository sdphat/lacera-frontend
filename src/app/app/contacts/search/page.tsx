'use client';

import { useContactsStore } from '@/app/_store/contacts.store';
import Avatar from '@/app/_components/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Contact } from '@/types/types';
import { BsSearch } from 'react-icons/bs';

const Search = () => {
  const { searchContacts } = useContactsStore();
  const [searchResult, setSearchResult] = useState<Contact[]>([]);
  const [searchText, setSearchText] = useState('');
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const router = useRouter();

  useEffect(() => {
    async function f() {
      const result = await searchContacts({ query });
      setSearchResult(result);
    }
    f();
  }, [query, searchContacts]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (searchText) {
      router.push(`/app/contacts/search?q=${searchText}`);
    }
  };

  let resultElement: React.ReactNode;

  if (!query) {
    resultElement = null;
  } else {
    if (!searchResult.length) {
      resultElement = <h2 className="text-3xl font-bold">No result found</h2>;
    } else {
      resultElement = (
        <div>
          <h2 className="text-3xl font-bold">Search result</h2>
          <div className="flex flex-wrap mt-12 gap-y-6">
            {searchResult.map((contact) => (
              <div key={contact.id} className="w-[33%]">
                <div
                  className="max-w-full w-max"
                  onClick={() => router.push(`/app/profile/${contact.id}`)}
                >
                  <Avatar
                    onAvatarClick={() => router.push(`/app/profile/${contact.id}`)}
                    avatarUrls={contact.avatarUrl}
                    title={`${contact.firstName} ${contact.lastName}`}
                    subTitle={`Active ${formatDistanceToNow(new Date(contact.lastActive))} ago`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="px-12 pt-4 pb-3 w-full">
      <div>
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
      <div className="mt-6">{resultElement}</div>
    </div>
  );
};

export default Search;
