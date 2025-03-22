import Image from 'next/image'
import React from 'react'
import logo from '../../public/Assets/logo-home-dark.png'
import { UserButton , SignedIn , SignedOut , SignInButton} from '@clerk/nextjs'

export default function login() {
  return (
    <div className='bg-slate-100 w-screen h-screen'>
      <div className='w-full max-w-[1900px] min-h-screen flex bg-gradient-to-l from-black to-transparent'>
        <div className='w-1/2 flex justify-center items-center p-10'>
            <Image className='w-1/2' src={logo} width={0} height={0} />

        </div>
        <div className='w-1/2 flex flex-col justify-center items-center'>
        <div className='mb-10 text-slate-100 tracking-widest text-xl'>Sign in to ZYNEX LMS</div>
        <SignedOut>
            <SignInButton mode='modal' className="bg-slate-100 cursor-pointer py-2 px-3 rounded shadow-sm duration-200 hover:bg-slate-300 scale-105 hover:shadow-md"/>
        </SignedOut>
        <SignedIn>
            <UserButton />
        </SignedIn>
        </div>
      </div>
    </div>
  )
}
