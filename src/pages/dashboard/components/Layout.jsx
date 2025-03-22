"use client" 

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "./Header"
import Loading from "../../../../components/Loading"
import HeaderSM from "./HeaderSM"
import BackButton from "./BackBtn"

export default function Layout({ children }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!isLoaded) return // Wait for user to load

    // Get role from Clerk metadata
    const role = user?.publicMetadata?.role || "user"

    if (role !== "admin") {
      router.push("/") // Redirect if not admin
    } else {
      setIsAdmin(true)
    }
  }, [isLoaded, user])

  if (!isLoaded || !isAdmin) return <Loading />
  return (
    <div className="max-w-[2000px] bg-slate-50 w-full min-h-screen flex flex-col sm:flex-row">
      <div className="w-80 h-screen bg-slate-200 hidden sm:flex">
        <Header/>
      </div>
      <div className="w-screen sm:hidden">
        <HeaderSM />
      </div>
      <div className="w-full h-screen overflow-y-scroll">
        {children}
      </div>
      <div className="w-full text-xs text-center sm:hidden py-10">Developed with ❤️ by THARUUX</div>
      <div className="hidden sm:fixed z-10 bottom-0 w-screen text-end tracking-widest text-sm text-gray-500 p-3">Developed with ❤️ by THARUUX</div>
      <div className="fixed bottom-0 right-0 p-10">
        <BackButton />
      </div>
    </div>
  )
}
