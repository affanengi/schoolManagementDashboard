"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

const Navebar = () => {
  const { user, role } = useAuth();

  // Determine display name: use displayName if available, otherwise format email prefix
  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : "User");
  // Capitalize role
  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Student";

  return (
    <div className='flex items-center justify-between p-4'>

      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[2px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={12} height={12} />
        <input type="text" placeholder="Search....." className="w-[200px] p-2 bg-transparent outline-none" />
      </div>

      <div className="flex items-center gap-4 justify-end w-full">
        <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer">
          <Image src="/message.png" alt="" width={18} height={18} />
        </div>
        <Link href="/list/announcements" className="bg-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer relative hover:ring-2 ring-lamaPurple transition-all">
          <Image src="/announcement.png" alt="" width={18} height={18} />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">1</div>
        </Link>
        <Link href="/profile" className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded-lg transition-colors cursor-pointer">
          <div className="flex flex-col">
            <span className="text-xs leading-3 font-medium">{displayName}</span>
            <span className="text-[10px] text-gray-500 text-right">{displayRole}</span>
          </div>
          <Image 
            src={user?.photoURL || "/avatar.png"} 
            alt="Profile" 
            width={34} 
            height={34} 
            className="rounded-full object-cover w-[34px] h-[34px]" 
          />
        </Link>
      </div>
    </div>
  )
}

export default Navebar;