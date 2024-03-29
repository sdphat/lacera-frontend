'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '../_store/auth.store';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { heartbeat } from '../_services/user.service';
import { useEffect } from 'react';
import { useContactsStore } from '../_store/contacts.store';
import { useConversationStore } from '../_store/conversation.store';
import NonSSRWrapper from '../_components/NonSSRWrapper';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { refreshToken } = useAuthStore();
  const { init: contactsStoreInit, reset: contactsStoreReset, getContacts } = useContactsStore();
  const {
    init: conversationStoreInit,
    reset: conversationStoreReset,
    getConversations,
  } = useConversationStore();
  const router = useRouter();
  useEffect(() => {
    const intervalId = setInterval(heartbeat, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    async function setupStores() {
      if (!refreshToken) return;

      await conversationStoreInit();
      await getConversations();

      await contactsStoreInit();
      await getContacts();
    }

    setupStores();
    return () => {
      contactsStoreReset();
      conversationStoreReset();
    };
  }, [
    contactsStoreInit,
    contactsStoreReset,
    conversationStoreInit,
    conversationStoreReset,
    getContacts,
    getConversations,
    refreshToken,
  ]);

  useEffect(() => {
    if (!refreshToken && typeof window !== undefined) {
      router.push('/login');
    }
  }, [refreshToken, router]);
  return (
    <NonSSRWrapper>
      <div className="h-screen">
        <div className="flex flex-col h-full">
          <div className="flex-none">
            <Navbar />
          </div>
          <div className="flex flex-1 min-h-0">
            <Sidebar />
            {children}
          </div>
        </div>
      </div>
    </NonSSRWrapper>
  );
}
