import { create } from 'zustand';
import {
  FriendStatusPayload,
  acceptFriendRequest,
  cancelFriendRequest,
  contactsSocket,
  getAllContacts,
  getContact,
  getPendingRequests,
  rejectFriendRequest,
  searchContacts,
  sendFriendRequest,
} from '../_services/contacts.service';
import { Contact, ContactDetail } from '@/types/types';
import { useAuthStore } from './auth.store';

interface IncomingRequest {
  User: ContactDetail;
}

interface OutgoingRequest {
  Target: ContactDetail;
}

interface PendingRequests {
  receivedRequests: IncomingRequest[];
  sentRequests: OutgoingRequest[];
}

export interface ContactsStore {
  contacts: Contact[];

  pendingRequests: PendingRequests;

  getContacts: () => Promise<void>;

  searchContacts: ({ query }: { query: string }) => Promise<Contact[]>;

  getContact: (id: number) => Promise<ContactDetail>;

  init: () => Promise<any>;

  reset: () => void;

  sendFriendRequest: ({
    senderId,
    receiverId,
  }: {
    senderId: number;
    receiverId: number;
  }) => Promise<FriendStatusPayload>;

  rejectFriendRequest: ({
    senderId,
    receiverId,
  }: {
    senderId: number;
    receiverId: number;
  }) => Promise<FriendStatusPayload>;

  acceptFriendRequest: ({
    senderId,
    receiverId,
  }: {
    senderId: number;
    receiverId: number;
  }) => Promise<FriendStatusPayload>;

  cancelFriendRequest: ({
    senderId,
    receiverId,
  }: {
    senderId: number;
    receiverId: number;
  }) => Promise<FriendStatusPayload>;

  getPendingRequests: () => Promise<void>;
}

let isIntialized = false;

export const useContactsStore = create<ContactsStore>()((set, get) => ({
  contacts: [],
  pendingRequests: {
    receivedRequests: [],
    sentRequests: [],
  },

  async init() {
    if (isIntialized) {
      return;
    }
    isIntialized = true;
    contactsSocket.connect();

    contactsSocket.addEventListener({
      successEvent: 'friendStatus',
      onSuccess: (friendStatus: FriendStatusPayload) => {},
    });
  },

  async reset() {
    isIntialized = false;
    contactsSocket.reset();
    set({
      contacts: [],
      pendingRequests: {
        receivedRequests: [],
        sentRequests: [],
      },
    });
  },

  async getContacts() {
    const contacts = await getAllContacts();
    set({ contacts });
  },

  async searchContacts(searchOptions) {
    const contacts = await searchContacts(searchOptions);
    return contacts;
  },

  async getContact(id) {
    const userId = useAuthStore.getState().currentUser!.id;
    const contact = await getContact({ userId, contactId: id });
    return contact;
  },

  async sendFriendRequest({ senderId, receiverId }) {
    const response = await sendFriendRequest({ senderId, receiverId });
    const { pendingRequests } = get();
    set({
      pendingRequests: {
        ...pendingRequests,
        sentRequests: pendingRequests.sentRequests.concat({ Target: response.user }),
      },
    });
    return response;
  },

  async acceptFriendRequest({ senderId, receiverId }) {
    const response = await acceptFriendRequest({ senderId, receiverId });
    const { contacts, pendingRequests } = get();
    set({
      contacts: contacts.concat(response.user),
      pendingRequests: {
        ...pendingRequests,
        receivedRequests: pendingRequests.receivedRequests.filter(
          (r) => r.User.id !== response.user.id,
        ),
      },
    });
    return response;
  },

  async cancelFriendRequest({ senderId, receiverId }) {
    const response = await cancelFriendRequest({ senderId, receiverId });
    console.log(response);
    const { pendingRequests } = get();
    set({
      pendingRequests: {
        ...pendingRequests,
        sentRequests: pendingRequests.sentRequests.filter((r) => r.Target.id !== response.user.id),
      },
    });
    return response;
  },

  async rejectFriendRequest({ senderId, receiverId }) {
    const response = await rejectFriendRequest({ senderId, receiverId });
    const { pendingRequests } = get();
    set({
      pendingRequests: {
        ...pendingRequests,
        receivedRequests: pendingRequests.receivedRequests.filter(
          (r) => r.User.id !== response.user.id,
        ),
      },
    });
    return response;
  },

  async getPendingRequests() {
    const { data: pendingRequests } = await getPendingRequests();
    set({ pendingRequests });
  },
}));
