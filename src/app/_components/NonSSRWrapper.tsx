import dynamic from 'next/dynamic';
import React, { ReactNode } from 'react';

const NonSSRWrapper: React.FC<{ children: ReactNode }> = (props) => (
  <React.Fragment>{props.children}</React.Fragment>
);

export default dynamic(() => Promise.resolve(NonSSRWrapper), {
  ssr: false,
});
