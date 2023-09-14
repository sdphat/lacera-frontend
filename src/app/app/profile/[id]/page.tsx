'use client';

import { useAuthStore } from '@/app/_store/auth.store';
import Image from 'next/image';
import React, {
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  BsChatDots,
  BsPersonFillAdd,
  BsPersonFillCheck,
  BsPersonFillX,
  BsPersonLinesFill,
  BsThreeDots,
} from 'react-icons/bs';
import { useContactsStore } from '@/app/_store/contacts.store';
import { useParams, useRouter } from 'next/navigation';
import { ContactDetail } from '@/types/types';
import { useConversationStore } from '@/app/_store/conversation.store';
import { FiEdit, FiUserX, FiX } from 'react-icons/fi';
import ProfileEditModal, { ProfileData } from './ProfileEditModal';
import Modal from '@/app/_components/Modal';

const Profile = () => {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [contact, setContact] = useState<ContactDetail>();
  const {
    getContact,
    acceptFriendRequest,
    cancelFriendRequest,
    rejectFriendRequest,
    sendFriendRequest,
    unfriend,
  } = useContactsStore();

  const { currentUser, updateProfile } = useAuthStore();
  const { getConversation } = useConversationStore();
  const { id } = useParams();
  const router = useRouter();
  const [profileEditInitialValues, setProfileEditInitialValues] = useState<Partial<ProfileData>>(
    {},
  );
  const [shouldShowUnfriendModal, setShouldShowUnfriendModal] = useState(false);

  useEffect(() => {
    async function initProfileEditValues() {
      if (!contact || contact?.id !== currentUser!.id) {
        return;
      }
      setProfileEditInitialValues({
        avatar: contact.avatarUrl,
        background: contact.backgroundUrl,
        description: contact.aboutMe,
        firstName: contact.firstName,
        lastName: contact.lastName,
      });
    }

    initProfileEditValues();
  }, [contact, currentUser]);

  useEffect(() => {
    const f = async () => {
      const c = await getContact(Number(id));
      setContact(c);
    };
    f();
  }, [getContact, id]);

  const handleSendFriendRequest = useCallback(async () => {
    if (!currentUser) return;
    await sendFriendRequest({ senderId: currentUser.id, receiverId: Number(id) });
    setContact({ ...contact, status: 'pendingRequest' } as ContactDetail);
  }, [contact, currentUser, id, sendFriendRequest]);

  const handleCancelFriendRequest = useCallback(async () => {
    if (!currentUser) return;
    await cancelFriendRequest({ senderId: currentUser.id, receiverId: Number(id) });
    setContact({ ...contact, status: 'notAdded' } as ContactDetail);
  }, [cancelFriendRequest, contact, currentUser, id]);

  const handleRejectFriendRequest = useCallback(async () => {
    if (!currentUser) return;
    await rejectFriendRequest({ senderId: currentUser.id, receiverId: Number(id) });
    setContact({ ...contact, status: 'rejected' } as ContactDetail);
  }, [contact, currentUser, id, rejectFriendRequest]);

  const handleAcceptFriendRequest = useCallback(async () => {
    if (!currentUser) return;
    await acceptFriendRequest({ senderId: currentUser.id, receiverId: Number(id) });
    setContact({ ...contact, status: 'accepted' } as ContactDetail);
  }, [currentUser, acceptFriendRequest, id, contact]);

  const friendButtonRecord: Record<
    string,
    { icon: ReactNode; text: string; onClick: MouseEventHandler<HTMLButtonElement> }
  > = useMemo(
    () => ({
      notAdded: {
        onClick: handleSendFriendRequest,
        icon: <BsPersonFillAdd className="w-6 h-6" />,
        text: 'Add friend',
      },
      pendingRequest: {
        onClick: handleCancelFriendRequest,
        icon: <BsPersonFillX className="w-6 h-6" />,
        text: 'Cancel request',
      },
      pendingAccept: {
        onClick: handleAcceptFriendRequest,
        icon: <BsPersonLinesFill className="w-6 h-6" />,
        text: 'Accept request',
      },
      accepted: {
        onClick: () => {},
        icon: <BsPersonFillCheck className="w-6 h-6" />,
        text: 'Friends',
      },
      rejected: {
        onClick: () => {},
        icon: <FiX className="w-6 h-6" />,
        text: 'Rejected',
      },
    }),
    [handleAcceptFriendRequest, handleCancelFriendRequest, handleSendFriendRequest],
  );

  const handleClickUnfriend = async () => {
    setShouldShowUnfriendModal(true);
  };

  const handleClickChat = async () => {
    const conversation = await getConversation({ targetId: Number(id) });
    console.log(conversation);
    if (conversation) {
      router.push('/app/conversations/' + conversation.id);
    }
  };

  const handleSaveEditProfile = async (data: ProfileData) => {
    await updateProfile(data);
    const c = await getContact(Number(id));
    setContact(c);
    setEditProfileOpen(false);
  };

  const handleConfirmUnfriend = async () => {
    if (!currentUser) return;
    setShouldShowUnfriendModal(false);
    await unfriend({ senderId: currentUser.id, receiverId: Number(id) });
    const c = await getContact(Number(id));
    setContact(c);
  };

  const shouldShowThreeDotBtn =
    contact?.status === 'accepted' || contact?.status === 'pendingAccept';

  if (!contact) {
    return null;
  }

  const {
    onClick: handleClickFriendBtn,
    icon: FriendBtnIcon,
    text: friendBtnText,
  } = friendButtonRecord[contact.status];

  return (
    <div className="w-full mx-4 my-4 relative">
      <div>
        <Image
          src={contact.backgroundUrl}
          width={300}
          height={600}
          alt=""
          className="w-full h-72"
        />
      </div>
      <div className="flex">
        <div>
          <Image
            src={contact.avatarUrl}
            width={100}
            height={100}
            alt=""
            className="translate-y-[-40%] ml-5 rounded-full"
          />
        </div>
        <div className="mt-2 ml-6">
          <div className="font-bold text-2xl">
            {contact.firstName} {contact.lastName}{' '}
            {contact.id === currentUser!.id && (
              <button
                onClick={() => setEditProfileOpen(true)}
                className="btn btn-ghost btn-circle hover:bg-transparent"
              >
                <FiEdit size={18} />
              </button>
            )}
          </div>
          {contact.id !== currentUser!.id && (
            <div className="flex gap-4 mt-3">
              <button onClick={handleClickFriendBtn} className="btn">
                {FriendBtnIcon}
                {friendBtnText}
              </button>
              <button onClick={handleClickChat} className="btn btn-primary">
                <BsChatDots className="w-5 h-5" /> Chat
              </button>
              {shouldShowThreeDotBtn && (
                <div className="dropdown">
                  <button className="btn">
                    <BsThreeDots className="w-6 h-6" />
                  </button>
                  <ul className="dropdown-content mt-2 menu p-2 shadow bg-base-100 rounded-box w-52 z-50">
                    {contact.status === 'accepted' && (
                      <li>
                        <button onClick={handleClickUnfriend} className="text-red-500">
                          <FiUserX size={20} />
                          Unfriend
                        </button>
                      </li>
                    )}
                    {contact.status === 'pendingAccept' && (
                      <li>
                        <button onClick={handleRejectFriendRequest} className="text-red-500">
                          <FiUserX size={20} />
                          Reject
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="divider"></div>
      <div>{contact.aboutMe}</div>
      {contact.id === currentUser!.id && (
        <ProfileEditModal
          initialValues={profileEditInitialValues}
          key={String(editProfileOpen)}
          onClose={() => setEditProfileOpen(false)}
          onSave={handleSaveEditProfile}
          open={editProfileOpen}
        />
      )}
      {shouldShowUnfriendModal && (
        <Modal
          open={true}
          onCancel={() => setShouldShowUnfriendModal(false)}
          onConfirm={handleConfirmUnfriend}
          confirmBtnText="Confirm"
          cancelBtnText="Cancel"
          title={`Unfriend ${contact.firstName} ${contact.lastName}`}
        >
          <div className="mt-4">
            This will unfriend {contact.firstName} {contact.lastName}. Are you sure?
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Profile;
