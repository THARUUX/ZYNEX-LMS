"use client" 

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "./Header"
import HeaderSM from "./HeaderSM"
import BackButton from "./BackBtn"
import Loading from "../../../../components/Loading"

export default function Layout({ children, isLoading }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [ dbError , setError ] = useState('');
  
  const checkDBStatus = async () => {
    try {
      const res = await fetch('/api/hello'); // Await the response
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
    if (!isLoaded) return // Wait for user to load
    checkDBStatus();

    // Get role from Clerk metadata
    const role = user?.publicMetadata?.role || "user"

    if (role !== "admin") {
      router.push("/") // Redirect if not admin
    } else {
      setIsAdmin(true)
    }
  }, [isLoaded, user])

  if (!isLoaded || !isAdmin) return <Loading />

  if (dbError) {
    return (
      <div className="fixed flex justify-center items-center top-0 left-0 bg-white w-screen h-screen text-error">
        <div className="flex flex-col justify-content-center items-center">
          <div className="text-3xl">Oops!</div>
          <div className="text-center">Could'nt connect to the database! Please refresh the page or try again later.</div>
        </div>
      </div>
    )
  } else {
      return (
        <div className="max-w-[2000px] bg-slate-50 w-full min-h-screen flex flex-col sm:flex-row">
          {isLoading ? <Loading /> : null}
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
}
