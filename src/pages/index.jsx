"use client"

import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import Layout from "../../components/Layout";
import logo from "../../public/Assets/logo-home-dark.png";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AiFillHome } from "react-icons/ai";
import { SiGoogledocs } from "react-icons/si";
import { FaMoneyCheck } from "react-icons/fa6";
import { FaPhone } from "react-icons/fa6";
import { FaBuildingCircleCheck } from "react-icons/fa6";
import { RiMacLine } from "react-icons/ri";
import { BsAndroid2 } from "react-icons/bs";
import { RiLoginBoxFill } from "react-icons/ri";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { MdCastForEducation } from "react-icons/md";
import { FaBuilding } from "react-icons/fa6";
import { TbReport } from "react-icons/tb";


const geistMain = Montserrat({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Dynamically create and append the script tag
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs';
    script.type = 'module';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up the script tag if component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      className="w-screen  h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-white"
    >
      {/* Section 1: Logo Intro */}
      <section className="snap-start w-screen h-screen flex justify-center items-center bg-1 relative">
        <Image
          src={logo}
          alt="Logo"
          className="w-4/5 sm:w-1/3 animate-fade animate-duration-[5000ms] animate-ease-in-out"
          width={0}
          height={0}
        />
        <div className="absolute w-full flex justify-center items-center bottom-0">
          <dotlottie-player
            src="https://lottie.host/bbd5d0f9-b3ad-4b5e-8a19-a514a5ec0704/51H6W5ySBt.lottie"
            background="transparent"
            speed="1"
            style={{ width: '150px', height: '150px' }}
            loop
            autoplay
          ></dotlottie-player>
        </div>
      </section>

      <section className={`snap-start w-screen min-h-screen flex flex-col items-center bg-2 text-main py-20 sm:py-0`}>
          <div className="w-full min-h-screen flex flex-col  justify-center items-center">
            <div className="text-5xl sm:text-7xl text-center font-black text-main animate-fade">Welcome to <span className="bg-gradient-to-r from-blue-700 to-purple-500 bg-clip-text text-transparent">ZYNEX LMS</span></div>
            <div className="flex flex-row flex-wrap justify-center sm:flex-row py-20 text-xl sm:text-2xl gap-5 sm:gap-20">
              <div className="flex gap-2 justify-center items-center cursor-pointer py-4 px-1 border-b border-0 text-center border-[#330063] text-[#330063] hover:text-[#3300ff] duration-300 hover:border-[#3300ff]"><AiFillHome /> Home 
              </div>
              <div className="flex gap-2 justify-center items-center cursor-pointer py-4 px-1 border-b border-0 text-center border-[#330063] text-[#330063] hover:text-[#3300ff] duration-300 hover:border-[#3300ff]"><SiGoogledocs /> Guide</div>
              <div className="flex gap-2 justify-center items-center cursor-pointer py-4 px-1 border-b border-0 text-center border-[#330063] text-[#330063] hover:text-[#3300ff] duration-300 hover:border-[#3300ff]"><FaMoneyCheck /> Pricing</div>
              <div className="flex gap-2 justify-center items-center cursor-pointer py-4 px-1 border-b border-0 text-center border-[#330063] text-[#330063] hover:text-[#3300ff] duration-300 hover:border-[#3300ff]"><FaPhone /> Contact</div>
              <div className="flex gap-2 justify-center items-center cursor-pointer py-4 px-1 border-b border-0 text-center border-[#330063] text-[#330063] hover:text-[#3300ff] duration-300 hover:border-[#3300ff]"><FaBuildingCircleCheck /> About</div>
            </div>
            <div className="">Specially Developed for Dilshan Sir</div>
          </div>
          <div className="w-full min-h-screen flex flex-col pb-30 sm-pb-0 px-5 gap-10 sm:gap-0">
            <div className="flex w-full text-3xl sm:text-5xl justify-center font-black"  >Keep the first step</div>
            <div className="w-full flex flex-col sm:flex-row gap-10 sm:gap-0">
              <div className="w-full sm:w-1/2 p-5 sm:p-40 tracking-widest flex-col gap-5 text-xl text-slate-800 animate-fade-up flex sm:h-full justify-center items-center">
                <div className="w-full text-xl sm:text-3xl font-bold flex gap-2  items-center"><RiMacLine /> Try it online!</div>
                Zynex LMS is a powerful, intuitive, and modern Learning Management System built to empower institutions, educators, and learners. Whether you're a school, university, training center, or a corporate team, Zynex transforms the way you deliver, manage, and experience learning.
                  <div className="w-full mt-10 flex ">
                    <Link href="/login" className="text-white flex items-center gap-2 py-3 rounded hover:scale-105 shadow-lg px-8 bg-gradient-to-r from-blue-700 to-purple-500 bg-[length:150%_150%] bg-left hover:bg-right duration-500 transition-all cursor-pointer ease-in-out">
                    <RiLoginBoxFill />
                      Login
                    </Link>
                  </div>
              </div>
              <div className="w-full sm:w-1/2 p-5 sm:p-40 tracking-widest flex-col gap-5 text-xl text-slate-800 animate-fade-up flex sm:h-full justify-center items-center">
                  <div className="w-full text-xl sm:text-3xl font-bold flex gap-2  items-center"><BsAndroid2 />Download the App Now!</div>
                  <div> Experience smooth learning on your phone.
                    Available now for Android devices — try it out today!</div>
                  <div className="w-full mt-10 ">
                    <a href="/Application/zynex-lms.apk" download target="_blank" rel="noopener noreferrer" className="flex w-fit items-center gap-2 text-white py-3 rounded hover:scale-105 shadow-lg px-8 bg-gradient-to-r from-blue-700 to-purple-500 bg-[length:150%_150%] bg-left hover:bg-right duration-500 transition-all cursor-pointer ease-in-out">
                    <FaCloudDownloadAlt />
                      Download <span className="text-xs">(6MB)</span>
                    </a>
                  </div>
              </div>
            </div>
          </div>
          <div className="w-full min-h-screen">
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
              <div className="flex flex-col w-full h-auto sm:w-1/4  text-white gap-5 rounded-lg shadow-lg bg-gradient-to-r from-blue-700 to-purple-500 p-10">
                <div className="w-full flex justify-center text-9xl">
                  <MdCastForEducation />
                </div>
                <div className="text-xl w-full text-center">
                  For Educators & Institutions
                </div>
                <div>
                Deliver more than content — deliver impact. With Zynex, educators can automate administrative tasks, engage learners deeply, and focus more on teaching.
                </div>
              </div>
              <div className="flex flex-col w-full h-auto sm:w-1/4  text-white gap-5 rounded-lg shadow-lg bg-gradient-to-r from-blue-700 to-purple-500 p-10">
                <div className="w-full flex justify-center text-9xl">
                  <FaBuilding />
                </div>
                <div className="text-xl w-full text-center">
                  For Corporates & Enterprises
                </div>
                <div>
                Train teams, onboard employees, and upskill your workforce with Zynex’s dynamic tools for compliance, performance, and knowledge retention.
                </div>
              </div>
              <div className="flex flex-col w-full h-auto sm:w-1/4  text-white gap-5 rounded-lg shadow-lg bg-gradient-to-r from-blue-700 to-purple-500 p-10">
                <div className="w-full flex justify-center text-9xl">
                  <TbReport />
                </div>
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
