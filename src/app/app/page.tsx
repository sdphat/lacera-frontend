'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import api from '../_services/authAxiosInstance';

const AppPage = () => {
  const { register, handleSubmit } = useForm();

  return (
    <form
      onSubmit={handleSubmit((values) => {
        const formData = new FormData();
        formData.append('avatar', values.avatar[0]);
        api.post('http://localhost:3001/user/upload', formData, {
          onUploadProgress(progressEvent) {
            console.log(progressEvent.progress);
          },
        });
      })}
    >
      <input type="file" {...register('avatar')} />
      <button>Submit</button>
    </form>
  );
};

export default AppPage;
