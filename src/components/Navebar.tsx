"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const Navebar = () => {
  const { user, role } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Determine display name: use displayName if available, otherwise format email prefix
  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : "User");
  // Capitalize role
  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Student";

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setIsSearching(true);
      const q = searchQuery.trim().toLowerCase();
      
      // 1. Check static routes
      const staticRoutes = ["teachers", "students", "parents", "subjects", "classes", "lessons", "exams", "assignments", "results", "attendance", "events", "announcements"];
      if (staticRoutes.includes(q)) {
        router.push(`/list/${q}`);
        setIsSearching(false);
        setSearchQuery("");
        return;
      }
      if (q === "profile") {
        router.push(`/profile`);
        setIsSearching(false);
        setSearchQuery("");
        return;
      }

      // 2. Check for specific student or teacher by fetching and finding a case-insensitive match
      try {
        const [studentsSnap, teachersSnap] = await Promise.all([
          getDocs(collection(db, "students")),
          getDocs(collection(db, "teachers"))
        ]);

        const studentMatch = studentsSnap.docs.find(d => 
          d.data().name?.toLowerCase() === q || d.data().studentId?.toLowerCase() === q
        );

        if (studentMatch) {
          router.push(`/list/students/${studentMatch.id}`);
          setIsSearching(false);
          setSearchQuery("");
          return;
        }

        const teacherMatch = teachersSnap.docs.find(d => 
          d.data().name?.toLowerCase() === q || d.data().teacherId?.toLowerCase() === q
        );

        if (teacherMatch) {
          router.push(`/list/teachers/${teacherMatch.id}`);
          setIsSearching(false);
          setSearchQuery("");
          return;
        }

        // 3. Fallback: navigate to students list with search query
        router.push(`/list/students?search=${encodeURIComponent(searchQuery)}`);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setIsSearching(false);
        setSearchQuery("");
      }
    }
  };

  return (
    <div className='flex items-center justify-between p-4'>

      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[2px] ring-gray-300 px-2 relative">
        <Image src="/search.png" alt="" width={12} height={12} />
        <input 
          type="text" 
          placeholder="Search....." 
          className="w-[200px] p-2 bg-transparent outline-none disabled:opacity-50" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          disabled={isSearching}
        />
        {isSearching && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-lamaSky border-t-transparent rounded-full animate-spin"></span>}
      </div>

      <div className="flex items-center gap-4 justify-end w-full">
        <Link href="/list/messages" className="bg-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer relative hover:ring-2 ring-lamaPurple transition-all">
          <Image src="/message.png" alt="" width={18} height={18} />
        </Link>
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