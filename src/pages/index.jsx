import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import Layout from "../../components/Layout";
import logo from "../../public/Assets/logo-home-dark.png";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const geistMain = Montserrat({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Home() {
  const router = useRouter();

  return (
    <div
      className="w-screen h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
    >
      {/* Section 1: Logo Intro */}
      <section className="snap-start w-screen h-screen flex justify-center items-center bg-white">
        <Image
          src={logo}
          alt="Logo"
          className="w-4/5 sm:w-1/3 animate-fade animate-duration-[5000ms] animate-ease-in-out"
          width={0}
          height={0}
        />
      </section>

      <section className={`snap-start w-screen min-h-screen flex flex-col items-center bg-gradient-to-tl from-blue-100 to-purple-50 text-main`}>
          <div className="w-full h-screen flex flex-col  justify-center items-center">
            <div className="text-5xl sm:text-7xl text-center font-black text-main animate-fade">🚀 Welcome to <span className="bg-gradient-to-r from-blue-700 to-purple-500 bg-clip-text text-transparent">ZYNEX LMS</span></div>
          </div>
          <div className="w-full h-screen flex flex-col sm:flex-row">
            <div className="w-full sm:w-1/2 p-5 sm:p-40 tracking-widest text-xl text-slate-800 animate-fade-up flex sm:h-full justify-center items-center">
              Zynex LMS is a powerful, intuitive, and modern Learning Management System built to empower institutions, educators, and learners. Whether you're a school, university, training center, or a corporate team, Zynex transforms the way you deliver, manage, and experience learning.
            </div>
            <div className="w-full sm:w-1/2 p-5 py-20 sm:py-0 sm:p-40 tracking-widest text-xl text-slate-800 animate-fade-up flex sm:h-full justify-center items-center">

                <Link href="/dashboard/" className="text-white py-3 rounded hover:scale-105 shadow-lg px-8 bg-gradient-to-r from-blue-700 to-purple-500 bg-[length:150%_150%] bg-left hover:bg-right duration-500 transition-all cursor-pointer ease-in-out">
                  Dashboard
                </Link>
            </div>
          </div>
          <div className="w-full h-screen">
            <div className="w-full gap-10 p-5 sm:p-40 tracking-widest text-slate-800 animate-fade-up flex h-full flex-col justify-center items-center">
              <div className="text-3xl tracking-widest font-bold">🔍 <span className="bg-gradient-to-r from-blue-700 to-purple-500 bg-clip-text text-transparent">Why ZYNEX?</span></div>
              <div className="flex flex-col gap-10 mt-10">
                <div>
                  <div className="text-xl">
                    📚 Seamless Course Management
                  </div>
                  <div className="px-5">Create, manage, and update courses effortlessly. Drag-and-drop content, schedule classes, assign assessments, and track progress — all in one place.</div>
                </div>
                <div>
                  <div className="text-xl">
                  🧠 Personalized Learning Journeys
                  </div>
                  <div className="px-5">Adaptive paths, smart recommendations, and progress tracking tailored to each learner's pace and style.</div>
                </div>
                <div>
                  <div className="text-xl">
                  📈 Real-Time Analytics
                  </div>
                  <div className="px-5">Gain powerful insights into learner performance, engagement, and content effectiveness with detailed dashboards and reports.</div>
                </div>
                <div>
                  <div className="text-xl">
                  🔐 Secure & Scalable
                  </div>
                  <div className="px-5">Built with enterprise-grade security and cloud scalability — whether you have 10 learners or 10,000.</div>
                </div>
                <div>
                  <div className="text-xl">
                  🌐 Accessible Anytime, Anywhere
                  </div>
                  <div className="px-5"> Mobile-friendly and cloud-based. Learn on the go, from any device, anywhere in the world.</div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full min-h-screen sm:h-screen flex flex-col sm:p-20 p-10">
            <div className="sm:p-20 py-20 flex flex-col sm:flex-row gap-10 justify-between  flex-wrap">
              <div className="flex flex-col w-full sm:w-1/4 h-fit text-white gap-5 rounded-lg shadow-lg bg-gradient-to-r from-blue-700 to-purple-500 p-10">
                <div className="text-xl w-full text-center">
                  For Educators & Institutions
                </div>
                <div>
                Deliver more than content — deliver impact. With Zynex, educators can automate administrative tasks, engage learners deeply, and focus more on teaching.
                </div>
              </div>
              <div className="flex flex-col w-full sm:w-1/4 h-fit text-white gap-5 rounded-lg shadow-lg bg-gradient-to-r from-blue-700 to-purple-500 p-10">
                <div className="text-xl w-full text-center">
                  For Corporates & Enterprises
                </div>
                <div>
                Train teams, onboard employees, and upskill your workforce with Zynex’s dynamic tools for compliance, performance, and knowledge retention.
                </div>
              </div>
              <div className="flex flex-col w-full sm:w-1/4 h-fit text-white gap-5 rounded-lg shadow-lg bg-gradient-to-r from-blue-700 to-purple-500 p-10">
                <div className="text-xl w-full text-center">
                Integrate. Expand. Evolve.
                </div>
                <div>
                Zynex supports integrations with major tools like Zoom, Google Workspace, Microsoft Teams, and more. Extend the power of your LMS with plugins, APIs, and custom workflows.
                </div>
              </div>
            </div>
            <div className="mt-52 w-full flex justify-center items-center tracking-widest">
              Developed by ZYNEX Developments - THARUUX
            </div>
          </div>
      </section>
    </div>
  );
}
