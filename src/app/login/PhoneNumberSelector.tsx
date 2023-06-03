'use-client';

import React, { useState } from 'react';
import { getCodes } from 'iso-3166-1-alpha-2';
import '/node_modules/flag-icons/css/flag-icons.min.css';
import { getCountryCallingCode, isSupportedCountry } from 'libphonenumber-js';

export interface PhoneNumberSelectorProps {
  onChange: (value: Country) => void;
  countryCode: string;
}

interface Country {
  callingCode: string;
  code: string;
}

const countryCodes = getCodes();

const PhoneNumberSelector: React.FC<PhoneNumberSelectorProps> = ({ countryCode, onChange }) => {
  const [country, setCountry] = useState<Country>({
    code: countryCode,
    callingCode: getCountryCallingCode(countryCode as any),
  });

  const handleChange = (code: string) => {
    const newCountry = { code, callingCode: getCountryCallingCode(code as any) };
    setCountry(newCountry);
    onChange(newCountry);
  };

  return (
    <div className="dropdown">
      <label
        tabIndex={0}
        className="select select-bordered leading-[3rem] border-l-0 border-r-0 rounded-none focus:outline-none pr-8 w-24"
      >
        +{country.callingCode}
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content max-h-64 overflow-y-scroll flex-nowrap menu p-2 shadow bg-base-100 w-52"
      >
        {countryCodes
          .filter((code) => isSupportedCountry(code))
          .map((code) => (
            <li onClick={() => handleChange(code)} key={code}>
              <a>
                <div className={`fi fi-${code.toLowerCase()}`}></div>
                <div>+{getCountryCallingCode(code as any)}</div>
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default PhoneNumberSelector;
