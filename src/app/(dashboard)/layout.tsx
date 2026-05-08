"use client";
import Menu from "@/components/Menu";
import Navebar from "@/components/Navebar";
import Image from "next/image";
import Link from "next/link";

import AuthProvider from "@/components/AuthProvider";

export default function DashboardLayout({
    children,
  }: Readonly<{
    children: React.ReactNode; 
  }>) {
    return (
     <AuthProvider>
      <div className="h-screen flex"> 
       <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4">
        <Link href="/" className="flex items-center justify-center lg:justify-start gap-2">
         <Image src="/logo.png" alt="logo" width={32} height={32} />
         <span className="hidden lg:block font-bold">SchoolDash</span>
        </Link>
        <Menu/>
       </div>

       <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col">
        <Navebar />
        {children}
       </div>
      </div>
     </AuthProvider>
    );
  }