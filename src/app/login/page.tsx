import React from 'react';
import { MdLockOutline, MdSmartphone } from 'react-icons/md';
import bg from './trianglify-lowres.png';
import { Metadata } from 'next';

const inputClasses = 'input input-md input-bordered w-full focus:outline-none';
const headerClasses =
  'text-center mb-1 mt-10 bg-clip-text text-transparent bg-gradient-to-tr from-primary to-secondary';

export const metadata: Metadata = {
  title: 'Lacera',
};

const Login = () => {
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
              <form>
                <div className="form-control w-full">
                  <label className="input-group">
                    <span>
                      <MdSmartphone size={16} />
                    </span>
                    <input type="tel" placeholder="Phone number" className={inputClasses} />
                  </label>
                </div>
                <div className="form-control w-full mt-4">
                  <label className="input-group">
                    <span>
                      <MdLockOutline size={16} />
                    </span>
                    <input type="password" placeholder="Password" className={inputClasses} />
                  </label>
                </div>
                <div className="flex flex-col items-center mt-8">
                  <button className="btn btn-primary w-full max-w-sm">Login</button>
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
