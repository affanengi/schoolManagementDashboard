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

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/drxphrtzb/auto/upload";
const CLOUDINARY_PRESET = "school_chat";

const CustomAudioPlayer = ({ src }: { src: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (Number(e.target.value) / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(Number(e.target.value));
    }
  };

  const togglePlaybackRate = () => {
    if (audioRef.current) {
      let newRate = 1;
      if (playbackRate === 1) newRate = 1.5;
      else if (playbackRate === 1.5) newRate = 2;
      else newRate = 1;
      
      audioRef.current.playbackRate = newRate;
      setPlaybackRate(newRate);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 bg-black/10 rounded-full px-3 py-1.5 w-[240px]">
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      <button 
        onClick={togglePlayPause} 
        className="text-gray-700 hover:opacity-80 flex-shrink-0"
      >
        {isPlaying ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={progress} 
          onChange={handleSeek}
          className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#00a884]"
        />
        <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>

      <button 
        onClick={togglePlaybackRate}
        className="bg-gray-200 text-gray-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md hover:bg-gray-300 transition-colors"
      >
        {playbackRate}x
      </button>
    </div>
  );
};

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [deleteModalMsg, setDeleteModalMsg] = useState<Message | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewCaption, setPreviewCaption] = useState("");
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    if (activeFilter === "Unread") {
      list = list.filter(item => (item.conversation?.unreadCount?.[user?.email || ""] || 0) > 0);
    } else if (activeFilter !== "All") {
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
        unreadCount: {
          ...selectedChatData.conversation.unreadCount,
          [user.email]: 0
        }
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

  // Auto-sync lastMessage preview if the actual last message in the active chat is deleted
  useEffect(() => {
    if (messages.length > 0 && selectedChatData?.conversation?.id) {
      const lastMsg = messages[messages.length - 1];
      const isDeleted = lastMsg.deletedForEveryone || lastMsg.deletedFor?.includes(user?.email || "");
      if (isDeleted && selectedChatData.conversation.lastMessage !== "🚫 This message was deleted") {
        updateDoc(doc(db, "conversations", selectedChatData.conversation.id), {
          lastMessage: "🚫 This message was deleted"
        }).catch(console.error);
      }
    }
  }, [messages, selectedChatData?.conversation, user?.email]);

  const handleDeleteMessage = (msg: Message) => {
    setDeleteModalMsg(msg);
  };

  const handleConfirmDelete = async (type: "me" | "everyone") => {
    if (!deleteModalMsg || !user?.email) return;
    try {
      const msgRef = doc(db, "messages", deleteModalMsg.id);
      if (type === "everyone") {
        await updateDoc(msgRef, { deletedForEveryone: true });
      } else {
        const currentDeletedFor = deleteModalMsg.deletedFor || [];
        await updateDoc(msgRef, { deletedFor: [...currentDeletedFor, user.email] });
      }

      // Update the chat list preview if this was the last message
      if (messages.length > 0 && messages[messages.length - 1].id === deleteModalMsg.id) {
        if (selectedChatData?.conversation?.id) {
          await updateDoc(doc(db, "conversations", selectedChatData.conversation.id), {
            lastMessage: "🚫 This message was deleted"
          });
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
    setDeleteModalMsg(null);
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email || !selectedChatData) return;
    setPreviewFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadPreviewFile = async () => {
    if (!previewFile || !user?.email || !selectedChatData) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", previewFile);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    try {
      const res = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.secure_url) {
        const isPdf = previewFile.type === "application/pdf";
        const convId = selectedChatData.conversation?.id || [user.email, selectedChatData.contact.email].sort().join("_");
        const convRef = doc(db, "conversations", convId);
        
        await setDoc(convRef, {
          participants: [user.email, selectedChatData.contact.email],
          participantDetails: [
            { email: user.email, name: user.displayName || user.email.split('@')[0], avatar: user.photoURL || "/avatar.png", role: currentRole },
            { email: selectedChatData.contact.email, name: selectedChatData.contact.name, avatar: selectedChatData.contact.avatar, role: selectedChatData.contact.role }
          ],
          lastMessage: isPdf ? "📄 PDF Document" : "📷 Image",
          lastMessageTime: serverTimestamp(),
          unreadCount: {
            [user.email]: selectedChatData.conversation?.unreadCount?.[user.email] || 0,
            [selectedChatData.contact.email]: (selectedChatData.conversation?.unreadCount?.[selectedChatData.contact.email] || 0) + 1
          }
        }, { merge: true });

        await addDoc(collection(db, "messages"), {
          conversationId: convId,
          senderId: user.email,
          text: previewCaption, 
          mediaUrl: data.secure_url,
          mediaType: isPdf ? "pdf" : "image",
          createdAt: serverTimestamp(),
          seen: false
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload file.");
    } finally {
      setIsUploading(false);
      setPreviewFile(null);
      setPreviewCaption("");
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    if (audioBlob.size === 0 || !user?.email || !selectedChatData) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", audioBlob, "voicenote.webm");
    formData.append("upload_preset", CLOUDINARY_PRESET);

    try {
      const res = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.secure_url) {
        const convId = selectedChatData.conversation?.id || [user.email, selectedChatData.contact.email].sort().join("_");
        const convRef = doc(db, "conversations", convId);
        
        await setDoc(convRef, {
          participants: [user.email, selectedChatData.contact.email],
          participantDetails: [
            { email: user.email, name: user.displayName || user.email.split('@')[0], avatar: user.photoURL || "/avatar.png", role: currentRole },
            { email: selectedChatData.contact.email, name: selectedChatData.contact.name, avatar: selectedChatData.contact.avatar, role: selectedChatData.contact.role }
          ],
          lastMessage: "🎤 Voice Note",
          lastMessageTime: serverTimestamp(),
          unreadCount: {
            [user.email]: selectedChatData.conversation?.unreadCount?.[user.email] || 0,
            [selectedChatData.contact.email]: (selectedChatData.conversation?.unreadCount?.[selectedChatData.contact.email] || 0) + 1
          }
        }, { merge: true });

        await addDoc(collection(db, "messages"), {
          conversationId: convId,
          senderId: user.email,
          text: "", 
          mediaUrl: data.secure_url,
          mediaType: "audio",
          createdAt: serverTimestamp(),
          seen: false
        });
      }
    } catch (err) {
      console.error("Audio upload error:", err);
      alert("Failed to send voice note. Check Cloudinary settings.");
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await uploadAudio(audioBlob);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Microphone access is required to send voice notes.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      audioChunksRef.current = []; // Empty chunks so it doesn't upload
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
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

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Determine available filters
  let filters = ["All", "Unread", "Admin", "Teachers"];
  if (currentRole === "admin") {
    filters = ["All", "Unread", "Teachers", "Students", "Parents"];
  } else if (currentRole === "teacher") {
    filters = ["All", "Unread", "Admin", "Teachers", "Students", "Parents"];
  }

  const filteredMessages = messages.filter(msg => !msg.deletedFor?.includes(user?.email || ""));

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
        <div className={`flex-1 flex flex-col bg-[#F7F8FA] relative ${!selectedContactEmail ? 'hidden md:flex' : 'flex'}`}>
          {previewFile ? (
            <div className="absolute inset-0 z-50 bg-[#E9EDEF] flex flex-col">
              {/* Preview Header */}
              <div className="h-16 flex items-center px-4 justify-between bg-[#F0F2F5] shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                  <button onClick={() => { setPreviewFile(null); setPreviewCaption(""); }} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                  <h3 className="font-semibold text-lg text-gray-800">Preview</h3>
                </div>
              </div>
              {/* Preview Content */}
              <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[#E9EDEF]">
                {previewFile.type.startsWith("image/") ? (
                   <img src={URL.createObjectURL(previewFile)} alt="Preview" className="max-w-full max-h-full object-contain drop-shadow-md rounded-md" />
                ) : (
                  <div className="bg-[#202C33] p-12 rounded-xl shadow-lg flex flex-col items-center gap-4 text-white">
                     <div className="w-16 h-20 bg-white/10 rounded flex items-center justify-center text-white text-3xl">📄</div>
                     <p className="font-medium">No preview available</p>
                     <p className="text-sm opacity-60">{Math.round(previewFile.size / 1024)} KB - PDF</p>
                  </div>
                )}
              </div>
              {/* Preview Input */}
              <div className="p-4 bg-[#F0F2F5] shrink-0">
                <div className="max-w-3xl mx-auto flex items-end gap-2 bg-white px-2 py-1.5 rounded-xl shadow-sm">
                   <button type="button" className="p-2 text-gray-400 hover:text-gray-600 shrink-0">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                   </button>
                   <textarea 
                     placeholder="Add a caption..." 
                     className="flex-1 bg-transparent outline-none text-sm px-2 py-2.5 resize-none max-h-[120px]"
                     rows={Math.max(1, Math.min(5, previewCaption.split('\n').length))}
                     value={previewCaption}
                     onChange={(e) => setPreviewCaption(e.target.value)}
                     disabled={isUploading}
                     onKeyDown={(e) => {
                       if (e.key === "Enter" && !e.shiftKey) {
                         e.preventDefault();
                         uploadPreviewFile();
                       }
                     }}
                   />
                   <button 
                     onClick={uploadPreviewFile}
                     disabled={isUploading}
                     className="bg-[#00a884] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#008f6f] transition-colors shadow-md disabled:opacity-50 shrink-0 mb-0.5"
                   >
                     {isUploading ? (
                       <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     ) : (
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                     )}
                   </button>
                </div>
              </div>
            </div>
          ) : null}

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
                {filteredMessages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm mt-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <Image src={selectedChatData.contact.avatar} alt="" width={48} height={48} className="rounded-full object-cover w-[48px] h-[48px]" />
                    </div>
                    Say hello to {selectedChatData.contact.name}!
                  </div>
                ) : (
                  filteredMessages.map((msg, idx) => {
                    const isMe = msg.senderId === user?.email;
                    // Show avatar if it's the last message in a sequence from the other person
                    const showAvatar = !isMe && (idx === filteredMessages.length - 1 || filteredMessages[idx + 1].senderId !== msg.senderId);
                    
                    return (
                      <div key={msg.id} className={`group flex max-w-[80%] gap-2 relative ${isMe ? "self-end" : "self-start"}`}>
                        
                        {/* Delete Button for my message */}
                        {isMe && !msg.deletedForEveryone && (
                          <button 
                            onClick={() => handleDeleteMessage(msg)}
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
                          {msg.deletedForEveryone ? (
                            <div className={`p-3 rounded-2xl shadow-sm text-sm italic text-gray-400 border border-gray-200 ${isMe ? "bg-lamaSkyLight rounded-br-none" : "bg-gray-50 rounded-bl-none"}`}>
                              🚫 This message was deleted
                            </div>
                          ) : (
                            <div className={`p-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap ${isMe ? "bg-lamaSky text-gray-800 rounded-br-none" : "bg-white text-gray-700 rounded-bl-none"}`}>
                              {msg.mediaUrl && (
                                <div className="mb-2">
                                  {msg.mediaType === "audio" ? (
                                    <CustomAudioPlayer src={msg.mediaUrl} />
                                  ) : msg.mediaType === "image" ? (
                                    <a href={msg.mediaUrl} target="_blank" rel="noreferrer">
                                      <Image src={msg.mediaUrl} alt="Shared Image" width={200} height={200} className="rounded-lg object-cover" />
                                    </a>
                                  ) : (
                                    <a href={msg.mediaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded-lg hover:underline">
                                      📄 <span>View PDF</span>
                                    </a>
                                  )}
                                </div>
                              )}
                              {msg.text}
                            </div>
                          )}
                          <span className={`text-[10px] text-gray-400 mt-1 flex items-center ${isMe ? "justify-end mr-1" : "ml-1"}`}>
                            {formatTime(msg.createdAt)}
                            {isMe && !msg.deletedForEveryone && <DoubleTickIcon isRead={!!msg.seen} />}
                          </span>
                        </div>

                        {/* Delete Button for their message */}
                        {!isMe && !msg.deletedForEveryone && (
                          <button 
                            onClick={() => handleDeleteMessage(msg)}
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
                {isRecording ? (
                  <div className="flex items-center justify-between bg-red-50 p-2 rounded-2xl border border-red-200">
                    <div className="flex items-center gap-3 px-3 text-red-500 font-medium text-sm">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                      Recording... {formatRecordingTime(recordingTime)}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={cancelRecording} className="text-gray-500 hover:text-red-600 px-3 py-1 text-sm font-medium">Cancel</button>
                      <button type="button" onClick={stopRecording} className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shrink-0">
                        ➤
                      </button>
                    </div>
                  </div>
                ) : (
                  <form 
                    onSubmit={handleSendMessage}
                    className="flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 relative"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      hidden 
                      onChange={handleFileUpload} 
                      accept="image/*,application/pdf" 
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-400 hover:text-lamaSky transition-colors shrink-0"
                      disabled={isUploading}
                    >
                      📎
                    </button>
                    <textarea 
                      placeholder={isUploading ? "Uploading..." : "Type a message..."} 
                      className="flex-1 bg-transparent outline-none text-sm px-2 resize-none py-2 scrollbar-hide max-h-[120px]"
                      rows={Math.max(1, Math.min(5, newMessage.split('\n').length))}
                      value={newMessage}
                      disabled={isUploading}
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
                    <button type="button" onClick={startRecording} disabled={isUploading} className="p-2 text-gray-400 hover:text-lamaSky transition-colors shrink-0 mb-1 disabled:opacity-50">
                      🎤
                    </button>
                    <button 
                      type="submit" 
                      disabled={!newMessage.trim() || isUploading}
                      className="bg-lamaSky text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors ml-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0 mb-1"
                    >
                      ➤
                    </button>
                  </form>
                )}
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
      {/* Delete Confirmation Modal */}
      {deleteModalMsg && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete message?</h3>
              <p className="text-sm text-gray-500">This action cannot be undone.</p>
            </div>
            <div className="flex flex-col border-t border-gray-100">
              {/* Show 'Delete for everyone' if it's my message OR if I am an Admin */}
              {(deleteModalMsg.senderId === user?.email || currentRole === "admin") && (
                <button 
                  onClick={() => handleConfirmDelete("everyone")}
                  className="w-full py-3 text-red-500 font-medium hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  Delete for everyone
                </button>
              )}
              <button 
                onClick={() => handleConfirmDelete("me")}
                className="w-full py-3 text-red-500 font-medium hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                Delete for me
              </button>
              <button 
                onClick={() => setDeleteModalMsg(null)}
                className="w-full py-3 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
