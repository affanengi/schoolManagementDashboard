"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import Link from "next/link";

type Announcement = {
  id: string;
  title: string;
  description: string;
  date: any;
  color?: string;
};

const bgColors = ["bg-lamaSkyLight", "bg-lamaPurpleLight", "bg-lamaYellowLight"];

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "announcements"),
          orderBy("date", "desc"),
          limit(3)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Announcement[];
        setAnnouncements(data);
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
        // Fallback to placeholder data if collection doesn't exist yet
        setAnnouncements([
          { id: "1", title: "Welcome to SchoolDash!", description: "The school management system is now live. Add your first announcement from the Announcements list.", date: new Date() },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (date: any) => {
    if (!date) return "";
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <Link href="/list/announcements" className="text-xs text-gray-400 hover:text-lamaSky transition-colors">
          View All
        </Link>
      </div>
      <div className="flex flex-col gap-3 mt-3">
        {loading ? (
          <div className="text-sm text-gray-400 animate-pulse py-4 text-center">
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-sm text-gray-400 py-4 text-center">
            No announcements yet.
          </div>
        ) : (
          announcements.map((ann, i) => (
            <div
              key={ann.id}
              className={`${bgColors[i % bgColors.length]} rounded-md p-3`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-sm">{ann.title}</h2>
                <span className="text-xs text-gray-400 bg-white rounded-md px-2 py-1">
                  {formatDate(ann.date)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{ann.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;