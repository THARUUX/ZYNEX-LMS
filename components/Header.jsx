import React from 'react'
import Link from 'next/link'

export default function Header() {
  return (
    <div className='flex justify-between py-3 px-4'>
        <div>
            <Link href='/dashboard/' >Dashboard</Link>
        </div>
    </div>
  )
}
