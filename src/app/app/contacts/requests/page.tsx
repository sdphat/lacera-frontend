'use client';

import Avatar from '@/app/_components/Avatar';
import { useAuthStore } from '@/app/_store/auth.store';
import { useContactsStore } from '@/app/_store/contacts.store';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const FriendRequests = () => {
  const { getPendingRequests, pendingRequests, cancelFriendRequest, acceptFriendRequest } =
    useContactsStore();
  const { currentUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    getPendingRequests();
  }, [getPendingRequests]);

  return (
    <div className="w-full px-4 py-4">
      {/* Incoming requests */}
      <div className="mb-12">
        <h3 className="font-bold">Received requests</h3>
        {pendingRequests.receivedRequests?.length ? (
          <div className="flex flex-wrap gap-x-4 gap-y-6 mt-6">
            {pendingRequests.receivedRequests.length.map((r: any) => (
              <div
                className="w-[32%] cursor-pointer"
                key={r.User.id}
                onClick={() => router.push(`/profile/${r.User.id}`)}
              >
                <Avatar
                  className="px-2"
                  avatarUrls={r.User.avatarUrl}
                  title={`${r.User.firstName} ${r.User.lastName}`}
                  subTitle="Friend request"
                ></Avatar>
                <button
                  onClick={() =>
                    acceptFriendRequest({ senderId: currentUser!.id, receiverId: r.User.id })
                  }
                  className="btn btn-primary rounded w-full mt-4"
                >
                  Accept request
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-lg font-bold">No incoming request</div>
        )}
      </div>

      {/* Outgoing requests */}
      <div>
        <h3 className="font-bold">Sent requests</h3>
        {pendingRequests.sentRequests?.length ? (
          <div className="flex flex-wrap gap-x-4 gap-y-6 mt-6">
            {pendingRequests?.sentRequests?.map((r: any) => (
              <div
                className="w-[32%] cursor-pointer"
                key={r.Target.id}
                onClick={() => router.push(`/profile/${r.Target.id}`)}
              >
                <Avatar
                  className="px-2"
                  avatarUrls={r.Target.avatarUrl}
                  title={`${r.Target.firstName} ${r.Target.lastName}`}
                  subTitle="Friend request sent"
                ></Avatar>
                <button
                  onClick={() =>
                    cancelFriendRequest({ senderId: currentUser!.id, receiverId: r.Target.id })
                  }
                  className="btn rounded w-full mt-4"
                >
                  Cancel request
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-lg font-bold">No outgoing request</div>
        )}
      </div>
    </div>
  );
};

export default FriendRequests;
