import { create } from 'zustand';
import {
  acceptFriendRequest,
  cancelFriendRequest,
  contactsSocket,
  getAllContacts,
  getContact,
  searchContacts,
  sendFriendRequest,
} from '../_services/contacts.service';
import { Contact, ContactDetail } from '@/types/types';
import { useAuthStore } from './auth.store';

export interface ContactsStore {
  contacts: Contact[];

  getContacts: () => Promise<void>;

  searchContacts: ({ query }: { query: string }) => Promise<Contact[]>;

  getContact: (id: number) => Promise<ContactDetail>;

  sendFriendRequest: ({
    senderId,
    receiverId,
  }: {
    senderId: number;
    receiverId: number;
  }) => Promise<void>;

  rejectFriendRequest: ({
    senderId,
    receiverId,
  }: {
    senderId: number;
    receiverId: number;
  }) => Promise<void>;

  acceptFriendRequest: ({
    senderId,
    receiverId,
  }: {
    senderId: number;
    receiverId: number;
  }) => Promise<void>;

  cancelFriendRequest: ({
    senderId,
    receiverId,
  }: {
    senderId: number;
    receiverId: number;
  }) => Promise<void>;
}

export const useContactsStore = create<ContactsStore>()((set, get) => ({
  contacts: [],

  async getContacts() {
    const contacts = await getAllContacts();
    set({ contacts });
  },

  async searchContacts(searchOptions) {
    const contacts = await searchContacts(searchOptions);
    return contacts;
  },

  async getContact(id) {
    const userId = useAuthStore.getState().currentUser.id;
    const contact = await getContact({ userId, contactId: id });
    return contact;
  },

  async sendFriendRequest({ senderId, receiverId }) {
    await sendFriendRequest({ senderId, receiverId });
  },

  async acceptFriendRequest({ senderId, receiverId }) {
    await acceptFriendRequest({ senderId, receiverId });
  },

  async cancelFriendRequest({ senderId, receiverId }) {
    await cancelFriendRequest({ senderId, receiverId });
  },

  async rejectFriendRequest({ senderId, receiverId }) {
    await this.rejectFriendRequest({ senderId, receiverId });
  },
}));
