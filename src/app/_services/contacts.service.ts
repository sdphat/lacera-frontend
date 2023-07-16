import { Contact, ContactDetail } from '@/types/types';
import { socketInit } from '../_lib/socket';

export const contactsSocket = socketInit({
  url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/contacts`,
});

export const getAllContacts = async () => {
  const contacts = await contactsSocket.emitWithAck('fetchAll');
  return contacts.data;
};

export const searchContacts = async ({ query }: { query: string }): Promise<Contact[]> => {
  const contacts = await contactsSocket.emitWithAck('search', { query });
  return contacts.data;
};

export const getContact = async (dto: {
  userId: number;
  contactId: number;
}): Promise<ContactDetail> => {
  const contact = await contactsSocket.emitWithAck('fetch', dto);
  return contact.data;
};

export const sendFriendRequest = async ({
  senderId,
  receiverId,
}: {
  senderId: number;
  receiverId: number;
}) => {
  await contactsSocket.emitWithAck('sendFriendRequest', { senderId, receiverId });
};

export const cancelFriendRequest = async ({
  senderId,
  receiverId,
}: {
  senderId: number;
  receiverId: number;
}) => {
  await contactsSocket.emitWithAck('cancelFriendRequest', { senderId, receiverId });
};

export const acceptFriendRequest = async ({
  senderId,
  receiverId,
}: {
  senderId: number;
  receiverId: number;
}) => {
  await contactsSocket.emitWithAck('acceptFriendRequest', { senderId, receiverId });
};

export const rejectFriendRequest = async ({
  senderId,
  receiverId,
}: {
  senderId: number;
  receiverId: number;
}) => {
  await contactsSocket.emitWithAck('rejectFriendRequest', { senderId, receiverId });
};
