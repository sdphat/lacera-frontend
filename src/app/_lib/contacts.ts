import { Contact } from '@/types/types';

export const groupContactsByAlphabet = (contacts: Contact[]): Record<string, Contact[]> => {
  const dictionary: Record<string, Contact[]> = {};
  const contactsClone = [...contacts];
  contactsClone.sort((c1, c2) =>
    `${c1.firstName} ${c1.lastName}`.localeCompare(`${c2.firstName} ${c2.lastName}`),
  );
  contactsClone.forEach((contact) => {
    const key = contact.firstName[0].toUpperCase();
    if (dictionary[key]) {
      dictionary[key].push(contact);
    } else {
      dictionary[key] = [contact];
    }
  });
  return dictionary;
};
