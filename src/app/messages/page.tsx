"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";

export default function MessagesPage() {
  const { user, role } = useAuth();
  const currentRole = role || "student";
  
  // Dummy state for selected conversation
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Escape Hatch Link
  const homeLink = `/dashboard/${currentRole}`;

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      {/* 1. Escape Hatch Navbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0">
        <Link href={homeLink} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="logo" width={32} height={32} />
          <span className="font-bold text-xl hidden sm:block">SchoolDash</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium">{user?.displayName || (user?.email?.split('@')[0]) || "User"}</span>
            <span className="text-xs text-gray-500 capitalize">{currentRole}</span>
          </div>
          <Image 
            src={user?.photoURL || "/avatar.png"} 
            alt="Profile" 
            width={36} 
            height={36} 
            className="rounded-full object-cover w-[36px] h-[36px] border border-gray-200" 
          />
        </div>
      </div>

      {/* 2. Main 2-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Conversation List */}
        <div className={`w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {/* Header & New Chat Button */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <h2 className="font-semibold text-lg">Messages</h2>
            <button className="bg-lamaSky text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors shadow-sm">
              <span className="text-xl leading-none mb-1">+</span>
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="p-3 shrink-0">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
              <Image src="/search.png" alt="" width={14} height={14} className="opacity-50" />
              <input 
                type="text" 
                placeholder="Search chats..." 
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>
          </div>

          {/* List of Chats (Dummy Data) */}
          <div className="flex-1 overflow-y-auto">
            {/* Dummy Item 1 */}
            <div 
              onClick={() => setSelectedConversation("1")}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${selectedConversation === "1" ? "bg-blue-50" : "hover:bg-gray-50"}`}
            >
              <Image src="/avatar.png" alt="" width={40} height={40} className="rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-medium text-sm truncate">Affan Razvi</h3>
                  <span className="text-[10px] text-gray-400">10:42 AM</span>
                </div>
                <p className="text-xs text-gray-500 truncate">Are you coming to class today?</p>
              </div>
              <div className="w-4 h-4 bg-lamaPurple rounded-full flex items-center justify-center text-white text-[10px]">
                2
              </div>
            </div>

            {/* Dummy Item 2 */}
            <div 
              onClick={() => setSelectedConversation("2")}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${selectedConversation === "2" ? "bg-blue-50" : "hover:bg-gray-50"}`}
            >
              <Image src="/avatar.png" alt="" width={40} height={40} className="rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-medium text-sm truncate">John Doe</h3>
                  <span className="text-[10px] text-gray-400">Yesterday</span>
                </div>
                <p className="text-xs text-gray-500 truncate">Thanks for the assignment details!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className={`flex-1 flex flex-col bg-[#F7F8FA] ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-gray-200 bg-white flex items-center px-4 justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <button 
                    className="md:hidden mr-2 p-1 text-gray-500"
                    onClick={() => setSelectedConversation(null)}
                  >
                    ←
                  </button>
                  <Image src="/avatar.png" alt="" width={36} height={36} className="rounded-full" />
                  <div>
                    <h3 className="font-semibold text-sm">Affan Razvi</h3>
                    <span className="text-xs text-gray-500">Teacher</span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  ⋮
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {/* Dummy Message Received */}
                <div className="flex max-w-[80%] self-start gap-2">
                  <Image src="/avatar.png" alt="" width={28} height={28} className="rounded-full self-end" />
                  <div>
                    <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm text-sm text-gray-700">
                      Hello! Please make sure to submit your homework by tomorrow.
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 ml-1">10:40 AM</span>
                  </div>
                </div>

                {/* Dummy Message Sent */}
                <div className="flex max-w-[80%] self-end gap-2">
                  <div>
                    <div className="bg-lamaSky p-3 rounded-2xl rounded-br-none shadow-sm text-sm text-white">
                      Yes sir, I have already completed it. I will upload it soon!
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 mr-1 block text-right">10:42 AM</span>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-full border border-gray-200">
                  <button className="p-2 text-gray-400 hover:text-lamaSky transition-colors">
                    📎
                  </button>
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 bg-transparent outline-none text-sm px-2"
                  />
                  <button className="p-2 text-gray-400 hover:text-lamaSky transition-colors">
                    😀
                  </button>
                  <button className="p-2 text-gray-400 hover:text-lamaSky transition-colors">
                    🎤
                  </button>
                  <button className="bg-lamaSky text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors ml-1 shadow-sm">
                    ➤
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Image src="/message.png" alt="" width={40} height={40} className="opacity-50" />
              </div>
              <p className="text-lg font-medium text-gray-500">Your Messages</p>
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
