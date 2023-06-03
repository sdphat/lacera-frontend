'use client';

import React from 'react';
import { logout } from '../_services/auth.service';

const AccessTest = () => {
  return (
    <div>
      Homepage
      <button onClick={logout} className="btn btn-primary">
        Logout
      </button>
    </div>
  );
};

export default AccessTest;
