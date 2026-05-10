"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect, useRef, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { Conversation, Message } from "@/types/chat";

type Contact = {
  email: string;
  name: string;
  avatar: string;
  role: "admin" | "teacher" | "student" | "parent";
};

const ADMIN_CONTACT: Contact = {
  email: "mohammedaffanrazvi604@gmail.com",
  name: "Mohammed Affan Razvi",
  avatar: "/avatar.png",
  role: "admin"
};

const DoubleTickIcon = ({ isRead }: { isRead: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isRead ? "#3b82f6" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1">
    <path d="M18 6 7 17l-5-5" />
    <path d="m22 10-7.5 7.5L13 16" />
  </svg>
);

export default function MessagesPage() {
  const { user, role } = useAuth();
  const currentRole = role || "student";
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [selectedContactEmail, setSelectedContactEmail] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const homeLink = `/dashboard/${currentRole}`;

  // 1. Fetch Contacts based on Role
  useEffect(() => {
    if (!user?.email) return;

    const fetchContacts = async () => {
      let fetchedContacts: Contact[] = [];
      
      // Admin is always available to talk to (except to themselves)
      if (user.email !== ADMIN_CONTACT.email) {
        fetchedContacts.push(ADMIN_CONTACT);
      }

      // Helper to fetch and map a collection
      const fetchRole = async (colName: string, roleName: Contact['role']) => {
        const snap = await getDocs(collection(db, colName));
        const items = snap.docs.map(d => {
          const data = d.data();
          return {
            email: data.email,
            name: data.name || data.username || "Unknown",
            avatar: data.photo || "/avatar.png",
            role: roleName
          };
        }).filter(c => c.email && c.email !== user.email); // Don't chat with self
        return items;
      };

      if (currentRole === "admin" || currentRole === "teacher") {
        const [teachers, students, parents] = await Promise.all([
          fetchRole("teachers", "teacher"),
          fetchRole("students", "student"),
          fetchRole("parents", "parent"),
        ]);
        fetchedContacts = [...fetchedContacts, ...teachers, ...students, ...parents];
      } else if (currentRole === "student" || currentRole === "parent") {
        const teachers = await fetchRole("teachers", "teacher");
        fetchedContacts = [...fetchedContacts, ...teachers];
      }

      setContacts(fetchedContacts);
    };

    fetchContacts();
  }, [user?.email, currentRole]);

  // 2. Fetch Active Conversations
  useEffect(() => {
    if (!user?.email) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
      setConversations(convos);
    });

    return () => unsubscribe();
  }, [user?.email]);

  // 3. Merge Contacts and Conversations for the UI
  const chatList = useMemo(() => {
    let list = contacts.map(contact => {
      // Find if a conversation exists with this contact
      const conv = conversations.find(c => c.participants.includes(contact.email));
      return {
        contact,
        conversation: conv
      };
    });

    // Apply Filter
    if (activeFilter !== "All") {
      list = list.filter(item => item.contact.role.toLowerCase() === activeFilter.toLowerCase().replace(/s$/, ""));
    }

    // Apply Search
    if (searchQuery.trim() !== "") {
      list = list.filter(item => item.contact.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Sort by lastMessageTime if conversation exists, otherwise put at bottom
    list.sort((a, b) => {
      const timeA = a.conversation?.lastMessageTime?.toMillis?.() || 0;
      const timeB = b.conversation?.lastMessageTime?.toMillis?.() || 0;
      return timeB - timeA; // Descending
    });

    return list;
  }, [contacts, conversations, activeFilter, searchQuery]);

  // Determine currently selected Chat Data
  const selectedChatData = chatList.find(c => c.contact.email === selectedContactEmail);
  const selectedConversationId = selectedChatData?.conversation?.id;

  // 4. Fetch Messages for selected conversation
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", selectedConversationId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      // Sort in memory to avoid needing a Firestore composite index
      msgs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeA - timeB; // Ascending order
      });
      
      setMessages(msgs);
    }, (error) => {
      console.error("Messages query error:", error);
    });

    return () => unsubscribe();
  }, [selectedConversationId]);

  // 5. Mark messages as read and clear unreadCount
  useEffect(() => {
    if (!selectedChatData?.conversation || !user?.email) return;

    // Clear unread count for current user
    const unread = selectedChatData.conversation.unreadCount?.[user.email];
    if (unread && unread > 0) {
      updateDoc(doc(db, "conversations", selectedChatData.conversation.id), {
        [`unreadCount.${user.email}`]: 0
      }).catch(console.error);
    }
  }, [selectedChatData, user?.email]);

  useEffect(() => {
    if (!user?.email || messages.length === 0) return;
    
    // Find unread messages sent by the OTHER person
    const unreadMessages = messages.filter(m => m.senderId !== user.email && !m.seen);
    
    if (unreadMessages.length > 0) {
      unreadMessages.forEach(msg => {
        updateDoc(doc(db, "messages", msg.id), {
          seen: true
        }).catch(console.error);
      });
    }
  }, [messages, user?.email]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDeleteMessage = async (msgId: string) => {
    if (confirm("Delete this message?")) {
      try {
        await deleteDoc(doc(db, "messages", msgId));
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedChatData || !user?.email) return;

    const messageText = newMessage.trim();
    setNewMessage(""); // Optimistic UI clear
    
    const contact = selectedChatData.contact;

    try {
      // Use existing conversation ID if available, otherwise fallback to deterministic ID
      const convId = selectedChatData.conversation?.id || [user.email, contact.email].sort().join("_");
      
      // Ensure conversation exists
      const convRef = doc(db, "conversations", convId);
      await setDoc(convRef, {
        participants: [user.email, contact.email],
        participantDetails: [
          { email: user.email, name: user.displayName || user.email.split('@')[0], avatar: user.photoURL || "/avatar.png", role: currentRole },
          { email: contact.email, name: contact.name, avatar: contact.avatar, role: contact.role }
        ],
        lastMessage: messageText,
        lastMessageTime: serverTimestamp(),
        unreadCount: {
          [user.email]: selectedChatData.conversation?.unreadCount?.[user.email] || 0,
          [contact.email]: (selectedChatData.conversation?.unreadCount?.[contact.email] || 0) + 1
        }
      }, { merge: true });

      // Add message
      await addDoc(collection(db, "messages"), {
        conversationId: convId,
        senderId: user.email,
        text: messageText,
        createdAt: serverTimestamp(),
        seen: false
      });

    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determine available filters
  let filters = ["All", "Admin", "Teachers"];
  if (currentRole === "admin") {
    filters = ["All", "Teachers", "Students", "Parents"];
  } else if (currentRole === "teacher") {
    filters = ["All", "Admin", "Teachers", "Students", "Parents"];
  }

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
        {/* Left Column: Conversation/Contact List */}
        <div className={`w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col ${selectedContactEmail ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-100 shrink-0">
            <h2 className="font-semibold text-lg mb-3">Directory Chats</h2>
            
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {filters.map(f => (
                <button 
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeFilter === f 
                      ? "bg-lamaSky text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="p-3 shrink-0 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
              <Image src="/search.png" alt="" width={14} height={14} className="opacity-50" />
              <input 
                type="text" 
                placeholder="Search name..." 
                className="bg-transparent outline-none text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* List of Contacts/Chats */}
          <div className="flex-1 overflow-y-auto">
            {chatList.length === 0 ? (
              <div className="text-center text-gray-400 p-4 text-sm mt-4 flex flex-col items-center">
                <Image src="/message.png" alt="" width={32} height={32} className="opacity-30 mb-2" />
                No contacts found.
              </div>
            ) : (
              chatList.map(({ contact, conversation }) => {
                const isSelected = selectedContactEmail === contact.email;
                const unreadCount = conversation?.unreadCount?.[user?.email || ""] || 0;

                return (
                  <div 
                    key={contact.email}
                    onClick={() => setSelectedContactEmail(contact.email)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-gray-50 ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}
                  >
                    <Image src={contact.avatar} alt="" width={40} height={40} className="rounded-full object-cover w-[40px] h-[40px]" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-medium text-sm truncate">{contact.name}</h3>
                        <span className="text-[10px] text-gray-400">{formatTime(conversation?.lastMessageTime)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className={`text-xs truncate ${unreadCount > 0 ? "text-gray-800 font-semibold" : "text-gray-500"}`}>
                          {conversation?.lastMessage || <span className="italic opacity-60">Start a chat</span>}
                        </p>
                        {/* Role Badge */}
                        <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-wider ml-2 shrink-0">
                          {contact.role}
                        </span>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <div className="w-4 h-4 bg-lamaPurple rounded-full flex items-center justify-center text-white text-[10px] shrink-0">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className={`flex-1 flex flex-col bg-[#F7F8FA] ${!selectedContactEmail ? 'hidden md:flex' : 'flex'}`}>
          {selectedChatData ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-gray-200 bg-white flex items-center px-4 justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <button 
                    className="md:hidden mr-2 p-1 text-gray-500"
                    onClick={() => setSelectedContactEmail(null)}
                  >
                    ←
                  </button>
                  <Image src={selectedChatData.contact.avatar} alt="" width={36} height={36} className="rounded-full object-cover w-[36px] h-[36px]" />
                  <div>
                    <h3 className="font-semibold text-sm">{selectedChatData.contact.name}</h3>
                    <span className="text-xs text-gray-500 capitalize">{selectedChatData.contact.role}</span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  ⋮
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm mt-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <Image src={selectedChatData.contact.avatar} alt="" width={48} height={48} className="rounded-full object-cover w-[48px] h-[48px]" />
                    </div>
                    Say hello to {selectedChatData.contact.name}!
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === user?.email;
                    // Show avatar if it's the last message in a sequence from the other person
                    const showAvatar = !isMe && (idx === messages.length - 1 || messages[idx + 1].senderId !== msg.senderId);
                    
                    return (
                      <div key={msg.id} className={`group flex max-w-[80%] gap-2 relative ${isMe ? "self-end" : "self-start"}`}>
                        
                        {/* Delete Button for my message */}
                        {isMe && (
                          <button 
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                            title="Delete Message"
                          >
                            🗑️
                          </button>
                        )}

                        {!isMe && (
                          <div className="w-[28px] shrink-0 flex flex-col justify-end">
                            {showAvatar && (
                              <Image 
                                src={selectedChatData.contact.avatar} 
                                alt="" 
                                width={28} 
                                height={28} 
                                className="rounded-full object-cover w-[28px] h-[28px]" 
                              />
                            )}
                          </div>
                        )}
                        <div>
                          <div className={`p-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap ${isMe ? "bg-lamaSky text-gray-800 rounded-br-none" : "bg-white text-gray-700 rounded-bl-none"}`}>
                            {msg.text}
                          </div>
                          <span className={`text-[10px] text-gray-400 mt-1 flex items-center ${isMe ? "justify-end mr-1" : "ml-1"}`}>
                            {formatTime(msg.createdAt)}
                            {isMe && <DoubleTickIcon isRead={!!msg.seen} />}
                          </span>
                        </div>

                        {/* Delete Button for their message */}
                        {!isMe && (
                          <button 
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                            title="Delete Message"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                <form 
                  onSubmit={handleSendMessage}
                  className="flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200"
                >
                  <button type="button" className="p-2 text-gray-400 hover:text-lamaSky transition-colors shrink-0">
                    📎
                  </button>
                  <textarea 
                    placeholder="Type a message..." 
                    className="flex-1 bg-transparent outline-none text-sm px-2 resize-none py-2 scrollbar-hide max-h-[120px]"
                    rows={Math.max(1, Math.min(5, newMessage.split('\n').length))}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <button type="button" className="p-2 text-gray-400 hover:text-lamaSky transition-colors shrink-0 mb-1">
                    😀
                  </button>
                  <button type="button" className="p-2 text-gray-400 hover:text-lamaSky transition-colors shrink-0 mb-1">
                    🎤
                  </button>
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="bg-lamaSky text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors ml-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0 mb-1"
                  >
                    ➤
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Image src="/message.png" alt="" width={40} height={40} className="opacity-50" />
              </div>
              <p className="text-lg font-medium text-gray-500">Your Directory</p>
              <p className="text-sm">Select a contact to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
