"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Loading from "./Loading"
import Header from "./Header"

export default function Layout({ children }) {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login") // Redirects if not signed in
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return <Loading />
  }

  return (
    <div className="w-full max-w-[2000px] h-screen min-h-screen flex flex-col bg-slate-50">
        <Header/>
      {children}
    </div>
  )
}
