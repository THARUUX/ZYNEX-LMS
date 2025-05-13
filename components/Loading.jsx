import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

export default function Loading() {
  const [ dbError , setError ] = useState('');

  const checkDBStatus = async () => {
    try {
      const res = await fetch('/api/hello'); // Await the response
      //console.log(res);
      if (res.ok) {
        setError(false);
      } else {
        setError(true);
      }
    } catch (error) {
      console.error("Database check failed:", error);
      setError(true); // Set error if fetch fails
    }
  };
  

  useEffect(() => {
    checkDBStatus();
  })

  if(dbError) {
    toast.error('Error connecting to the database!' , {position: "top-center"});
  } else {
    return (
      <div className='fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-white/50'>
        <div class="spinner"></div>
      </div>
    )
  }
}
