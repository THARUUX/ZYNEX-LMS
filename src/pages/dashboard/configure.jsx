import React from 'react';
import Layout from './components/Layout';

export default function Configure() {
  const iframeurl = process.env.NEXT_PUBLIC_CLERK_UP_URL;

  return (
    <Layout>
      {/*<iframe 
        src={`https://dashboard.clerk.com`} 
        className='w-full h-screen z-10' 
        allowFullScreen
        style={{ border: "none" }} 
      />*/}
      <div className='flex gap-3'><div>To Add Users:</div> <code>{iframeurl}</code></div>
    </Layout>
  );
}
