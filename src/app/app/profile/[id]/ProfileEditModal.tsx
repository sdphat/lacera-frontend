import Modal from '@/app/_components/Modal';
import { validateMaxFileSize } from '@/app/_lib/helper';
import React, { ReactNode, useEffect } from 'react';
import ContentEditable from 'react-contenteditable';
import { useForm } from 'react-hook-form';
import sanitizeHtml from 'sanitize-html';

export interface ProfileData {
  firstName: string;
  lastName: string;
  description: string;
  avatar: string;
  background: string;
}

export interface FormProfileData {
  firstName: string;
  lastName: string;
  description: string;
  avatar: string;
  background: string;
}

export interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  initialValues: Partial<ProfileData>;
  onSave: (data: ProfileData) => void;
}

const maxDescriptionLength = 250;

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  onClose,
  onSave,
  open,
  initialValues,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { isValid },
  } = useForm<any>({
    mode: 'onChange',
    defaultValues: {
      ...initialValues,
    },
  });

  useEffect(() => {
    register('description', { minLength: 4, maxLength: maxDescriptionLength });
  }, [register]);

  const descriptionInputText: string = getValues().description ?? '';

  const descriptionHtmlText = `<span>${descriptionInputText.slice(0, maxDescriptionLength)}</span>${
    descriptionInputText.length > maxDescriptionLength
      ? `<span class="text-red-500">${descriptionInputText.slice(maxDescriptionLength)}</span>`
      : ''
  }
</>`;

  return (
    <Modal
      open={open}
      canSubmit={isValid}
      onCancel={onClose}
      onConfirm={handleSubmit((data) =>
        onSave({
          firstName: data.firstName,
          lastName: data.lastName,
          description: data.description,
          avatar: data.avatar[0],
          background: data.background[0],
        }),
      )}
      cancelBtnText="Cancel"
      confirmBtnText="Save changes"
      title="Edit profile"
    >
      <form>
        <div className="mt-3">
          <div className="flex gap-4">
            {/* First name */}
            <div className="form-control w-[48%]">
              <label htmlFor="first-name" className="label">
                First name
              </label>
              <input
                id="first-name"
                className="input input-bordered focus:outline-none"
                type="text"
                placeholder="First name"
                {...register('firstName', { required: true, maxLength: 25 })}
              />
            </div>
            {/* Last name */}
            <div className="form-control w-[48%]">
              <label htmlFor="last-name" className="label">
                Last name
              </label>
              <input
                id="last-name"
                className="input input-bordered focus:outline-none"
                type="text"
                placeholder="Last name"
                {...register('lastName', { required: true, maxLength: 25 })}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="form-control">
          <label htmlFor="description" className="label">
            Description
          </label>
          <ContentEditable
            html={descriptionHtmlText}
            className="textarea textarea-bordered focus:outline-none text-base"
            onChange={(e) => {
              setValue(
                'description',
                sanitizeHtml(e.target.value, {
                  allowedTags: [],
                  allowedAttributes: {},
                }),
                {
                  shouldValidate: true,
                },
              );
            }}
          ></ContentEditable>
        </div>

        {/* Avatar */}
        <div className="form-control">
          <label className="label">New avatar</label>
          <input
            accept="image/*"
            className="file-input file-input-bordered focus:outline-none"
            type="file"
            {...register('avatar', {
              validate: (fileList: FileList) =>
                !fileList[0]?.size || validateMaxFileSize(fileList[0], 25),
            })}
          />
        </div>

        {/* Background */}
        <div className="form-control mt-4">
          <label className="label">New background</label>
          <input
            accept="image/*"
            className="file-input file-input-bordered focus:outline-none"
            type="file"
            {...register('background', {
              validate: (fileList: FileList) =>
                !fileList[0]?.size || validateMaxFileSize(fileList[0], 25),
            })}
          />
        </div>
      </form>
    </Modal>
  );
};

export default ProfileEditModal;
