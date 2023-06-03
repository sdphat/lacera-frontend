'use client';

import React, { ChangeEventHandler, useState } from 'react';
import { MdLockOutline, MdSmartphone } from 'react-icons/md';
import bg from './trianglify-lowres.png';
import { Metadata } from 'next';
import { useForm } from 'react-hook-form';
import PhoneNumberSelector from './PhoneNumberSelector';
import { cva } from 'class-variance-authority';
import { login } from '../_services/auth.service';
import { getCountryCallingCode } from 'libphonenumber-js';
import { useRouter } from 'next/navigation';

const inputClasses = 'input input-md input-bordered w-full focus:outline-none';
const headerClasses =
  'text-center mb-1 mt-10 bg-clip-text text-transparent bg-gradient-to-tr from-primary to-secondary';
const submitButtonClasses = cva('btn btn-primary w-full max-w-sm', {
  variants: {
    state: {
      valid: '',
      invalid: 'btn-disabled',
      submitting: 'loading',
    },
  },
});

export const metadata: Metadata = {
  title: 'Lacera',
};

const Login = () => {
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    setError,
    formState: { isValid, isSubmitting, errors },
  } = useForm({ mode: 'onChange' });
  const [countryCode, setCountryCode] = useState('VN');
  const router = useRouter();
  const submitButtonState = !isValid ? 'invalid' : isSubmitting ? 'submitting' : 'valid';

  const onSubmit = handleSubmit(async (data) => {
    const responseData = await login({
      phoneNumber: `+${getCountryCallingCode(countryCode as any)}${data.phoneNumber}`,
      password: data.password,
    });

    if ('error' in responseData) {
      if (responseData.error === 'mismatch') {
        setError('root.mismatch', {
          type: 'mismatch',
          message: 'Username or password is incorrect. Please check again.',
        });
      }
    } else {
      window.localStorage.setItem('refresh_token', responseData.refreshToken);
      router.push('/app');
    }
  });

  const handlePhoneNumberChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const inputValue = e.target.value;
    const sanitizedValue = inputValue.replace(/[^0-9]/g, '');
    trigger('phoneNumber');
    setValue('phoneNumber', sanitizedValue);
  };

  return (
    <div
      className="flex flex-col items-center h-screen bg-primary bg-opacity-80"
      style={{
        background: `url(${bg.src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="container px-4 flex justify-center">
        <div>
          <div className="prose">
            <h1 className={headerClasses}>Lacera</h1>
            <p className="mt-0 text-center">
              Connect people from different places around the world
            </p>
          </div>
          <div className="card card-normal bg-base-100 shadow-xl mt-20 w-full max-w-lg">
            <div className="px-4 md:px-12 pb-7 pt-7">
              <form onSubmit={onSubmit}>
                <div className="form-control w-full">
                  <label className="input-group">
                    <span>
                      <MdSmartphone size={16} />
                    </span>
                    <PhoneNumberSelector
                      key={countryCode}
                      countryCode={countryCode}
                      onChange={(country) => setCountryCode(country.code)}
                    />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      className={inputClasses}
                      {...register('phoneNumber', {
                        required: true,
                        minLength: 4,
                      })}
                      onChange={handlePhoneNumberChange}
                    />
                  </label>
                </div>
                <div className="form-control w-full mt-4">
                  <label className="input-group">
                    <span>
                      <MdLockOutline size={16} />
                    </span>
                    <input
                      type="password"
                      placeholder="Password"
                      className={inputClasses}
                      {...register('password', { required: true, minLength: 8 })}
                    />
                  </label>
                </div>
                {errors.root?.mismatch && (
                  <div className="text-error text-sm w-full mt-1">
                    {errors.root.mismatch.message}
                  </div>
                )}
                <div className="flex flex-col items-center mt-8">
                  <button
                    className={submitButtonClasses({
                      state: submitButtonState,
                    })}
                    disabled={submitButtonState !== 'valid'}
                  >
                    {!isSubmitting && 'Login'}
                  </button>
                  <a className="link link-primary text-sm mt-4">Forgot password?</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
