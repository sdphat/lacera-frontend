import dynamic from 'next/dynamic';
import React from 'react';
const NonSSRWrapper: React.FC = (props: any) => <React.Fragment>{props.children}</React.Fragment>;
export default dynamic(() => Promise.resolve(NonSSRWrapper), {
  ssr: false,
});
