import Avatar from '@/app/_components/Avatar';
import { groupContactsByAlphabet } from '@/app/_lib/contacts';
import { Contact } from '@/types/types';
import React, { DialogHTMLAttributes, useEffect, useRef, useState } from 'react';
import { BsSearch } from 'react-icons/bs';

interface AddGroupModalProps {
  open: boolean;
  contacts: Contact[];
  onClose: () => void;
  onCreate: ({ name, groupMembers }: { name: string; groupMembers: Contact[] }) => void;
}

const AddGroupModal: React.FC<AddGroupModalProps> = ({ open, contacts, onClose, onCreate }) => {
  const [searchName, setSearchName] = useState<string>('');
  const [displayedContacts, setDisplayedContact] = useState<Contact[]>(contacts);
  const [groupName, setGroupName] = useState<string>('');
  const [chosenContacts, setChosenContacts] = useState<Contact[]>([]);

  const onChooseContact = (contact: Contact) => {
    if (!chosenContacts.find((c) => c.id === contact.id)) {
      setChosenContacts([...chosenContacts, contact]);
    } else {
      setChosenContacts(chosenContacts.filter((c) => c.id !== contact.id));
    }
  };

  const onChangeSearchName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value;
    setSearchName(value);
    setDisplayedContact(
      contacts.filter((c) => `${c.firstName} ${c.lastName}`.toLowerCase().includes(value)),
    );
  };

  return (
    <dialog onClose={onClose} open={open} className="modal modal-middle">
      <form method="dialog" className="modal-box">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <h3 className="font-bold text-lg">Create group</h3>
        <div className="mt-3">
          <div className="form-control w-full">
            <input
              className="input input-bordered focus:outline-none"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
            />
          </div>

          <div className="relative mt-6">
            <input
              type="text"
              value={searchName}
              onChange={onChangeSearchName}
              className="input input-bordered focus:outline-none w-full pr-12"
              placeholder="Enter friends' name"
            />
            <div className="absolute right-3 top-[50%] translate-y-[-50%] flex gap-2">
              <div className="text-gray-400 text-xl p-1">
                <BsSearch size={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          {displayedContacts.length === 0
            ? 'No contacts found'
            : Object.entries(groupContactsByAlphabet(displayedContacts)).map(([key, contacts]) => (
                <div key={key}>
                  <div>
                    <div className="mx-4 text-2xl font-bold">{key}</div>
                    <div className="divider my-1"></div>
                  </div>
                  <div className="flex flex-wrap gap-y-8 mt-6">
                    {contacts.map((contact) => (
                      <label
                        htmlFor={`checkbox-contact-${contact.id}`}
                        key={contact.id}
                        className="flex w-full px-3"
                      >
                        <input
                          type="checkbox"
                          checked={chosenContacts.some((c) => c.id === contact.id)}
                          onChange={() => onChooseContact(contact)}
                          id={`checkbox-contact-${contact.id}`}
                        />
                        <div className="max-w-full w-max">
                          <Avatar
                            avatarUrls={contact.avatarUrl}
                            title={`${contact.firstName} ${contact.lastName}`}
                            className="ml-2"
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
        </div>
        {chosenContacts.length > 0 && (
          <div className="mt-12">
            <div className="font-semibold text-base">Chosen group members</div>
            <div className="border-t-2 border-gray-200 flex flex-wrap gap-1.5 py-2">
              {chosenContacts.map((contact) => (
                <Avatar key={contact.id} avatarUrls={contact.avatarUrl} />
              ))}
            </div>
          </div>
        )}
        <div className="modal-action">
          <button
            onClick={() => onCreate({ name: groupName, groupMembers: chosenContacts })}
            disabled={chosenContacts.length === 0 || !groupName}
            className="btn btn-primary"
          >
            Create
          </button>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default AddGroupModal;
