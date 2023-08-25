'use client';

import React, { ChangeEventHandler, useState } from 'react';
import { MdLockOutline, MdPerson, MdSmartphone } from 'react-icons/md';
import bg from '/public/auth_background.png';
import { useForm } from 'react-hook-form';
import PhoneNumberSelector from '../_components/PhoneNumberSelector';
import { cva } from 'class-variance-authority';
import { getCountryCallingCode } from 'libphonenumber-js';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../_store/auth.store';
import Link from 'next/link';

const inputClasses = 'input input-md input-bordered w-full focus:outline-none';
const headerClasses =
  'text-center mb-1 mt-10 bg-clip-text text-transparent bg-gradient-to-tr from-primary to-secondary';
const submitButtonClasses = cva('btn btn-primary w-full max-w-sm', {
  variants: {
    state: {
      valid: '',
      invalid: 'btn-disabled',
      submitting: 'btn-disabled',
    },
  },
});

const Register = () => {
  const {
    register: registerField,
    handleSubmit,
    setValue,
    trigger,
    setError,
    formState: { isValid, isSubmitting, errors },
  } = useForm({ mode: 'onChange' });
  const [countryCode, setCountryCode] = useState('VN');
  const router = useRouter();
  const { register } = useAuthStore();
  const submitButtonState = !isValid ? 'invalid' : isSubmitting ? 'submitting' : 'valid';

  const onSubmit = handleSubmit(async (data) => {
    const response = await register({
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: `+${getCountryCallingCode(countryCode as any)}${data.phoneNumber}`,
      password: data.password,
    });

    if (response) {
      if (response.error === 'existed') {
        setError('root.existed', {
          type: 'existed',
          message: 'This phone number is already registered. Please check again.',
        });
      }
    } else {
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
                {/* Name */}
                <div className="flex gap-4">
                  <div className="form-control w-full">
                    <label className="input-group">
                      <span>
                        <MdPerson size={16} />
                      </span>
                      <input
                        placeholder="First name"
                        className={inputClasses}
                        {...registerField('firstName', { required: true, minLength: 1 })}
                      />
                    </label>
                  </div>
                  <div className="form-control w-full">
                    <label className="input-group">
                      <span>
                        <MdPerson size={16} />
                      </span>
                      <input
                        placeholder="Last name"
                        className={inputClasses}
                        {...registerField('lastName', { required: true, minLength: 1 })}
                      />
                    </label>
                  </div>
                </div>
                {/* Phone number */}
                <div className="form-control w-full mt-4">
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
                      {...registerField('phoneNumber', {
                        required: true,
                        minLength: 4,
                      })}
                      onChange={handlePhoneNumberChange}
                    />
                  </label>
                </div>
                {/* Password */}
                <div className="form-control w-full mt-4">
                  <label className="input-group">
                    <span>
                      <MdLockOutline size={16} />
                    </span>
                    <input
                      type="password"
                      placeholder="Password"
                      className={inputClasses}
                      {...registerField('password', { required: true, minLength: 8 })}
                    />
                  </label>
                </div>
                {/* Password confirm */}
                <div className="form-control w-full mt-4">
                  <label className="input-group">
                    <span>
                      <MdLockOutline size={16} />
                    </span>
                    <input
                      type="password"
                      placeholder="Confirm password"
                      className={inputClasses}
                      {...registerField('passwordConfirm', {
                        required: true,
                        minLength: 8,
                        validate: (confirmPassword, { password }) => confirmPassword === password,
                      })}
                    />
                  </label>
                </div>
                {errors.root?.existed && (
                  <div className="text-error text-sm w-full mt-1">
                    {errors.root.existed.message}
                  </div>
                )}
                <div className="flex flex-col items-center mt-8">
                  <button
                    className={submitButtonClasses({
                      state: submitButtonState,
                    })}
                    disabled={submitButtonState !== 'valid'}
                  >
                    <span
                      className={
                        submitButtonState === 'submitting' ? 'loading loading-spinner' : ''
                      }
                    ></span>
                    {!isSubmitting && 'Register'}
                  </button>
                  <div className="text-sm mt-4">
                    Already have an acount?{' '}
                    <Link href="/login" className="link link-primary">
                      Sign in now
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
