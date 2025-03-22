import { SignedIn , UserButton } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import Layout from "../../components/Layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <Layout className="w-screen h-screen bg-slate-50">
      <div className="w-full flex justify-end">
        
      </div>
    </Layout>
  );
}
