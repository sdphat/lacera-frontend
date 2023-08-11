'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '../_store/auth.store';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { heartbeat } from '../_services/user.service';
import { useEffect } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { refreshToken } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    const intervalId = setInterval(heartbeat, 5000);
    return () => clearInterval(intervalId);
  }, []);
  if (!refreshToken && typeof window !== undefined) {
    router.push('/login');
  }
  return (
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
  );
}
