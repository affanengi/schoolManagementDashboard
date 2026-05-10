export type Conversation = {
  id: string;
  participants: string[]; // Emails or user IDs
  participantDetails: {
    email: string;
    name: string;
    avatar?: string;
    role: string;
  }[];
  lastMessage: string;
  lastMessageTime: Date | any; // Firestore Timestamp
  unreadCount: Record<string, number>;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string; // Email or user ID
  text: string;
  fileUrl?: string;
  audioUrl?: string;
  reactions?: Record<string, string[]>; // e.g., { "thumbsUp": ["user1@email.com"] }
  createdAt: Date | any; // Firestore Timestamp
};
