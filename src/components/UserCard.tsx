"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

const cardConfigs = [
  {
    label: "Students",
    collection: "students",
    href: "/list/students",
    bg: "bg-lamaSkyLight",
    icon: "👨‍🎓",
  },
  {
    label: "Teachers",
    collection: "teachers",
    href: "/list/teachers",
    bg: "bg-lamaPurpleLight",
    icon: "👩‍🏫",
  },
  {
    label: "Parents",
    collection: "parents",
    href: "/list/parents",
    bg: "bg-lamaYellowLight",
    icon: "👪",
  },
  {
    label: "Staff",
    collection: "users",
    href: "/list/teachers",
    bg: "bg-pink-50",
    icon: "🏫",
  },
];

const UserCard = ({ type }: { type: string }) => {
  const [count, setCount] = useState<number | null>(null);
  const config = cardConfigs.find((c) => c.label === type);

  useEffect(() => {
    if (!config) return;
    const fetchCount = async () => {
      try {
        const coll = collection(db, config.collection);
        const snap = await getCountFromServer(coll);
        setCount(snap.data().count);
      } catch {
        setCount(0);
      }
    };
    fetchCount();
  }, [config]);

  if (!config) return null;

  return (
    <div
      className={`${config.bg} rounded-2xl p-4 flex-1 min-w-[140px] flex flex-col gap-3 transition-all hover:shadow-md`}
    >
      <div className="flex justify-between items-start">
        <span className="text-[11px] bg-white px-2 py-1 rounded-full text-green-600 font-semibold shadow-sm">
          2024/25
        </span>
        <Link href={config.href} title={`View all ${type}`}>
          <Image src="/more.png" alt="more" width={18} height={18} className="opacity-60 hover:opacity-100" />
        </Link>
      </div>
      <div>
        {count === null ? (
          <div className="h-8 w-16 bg-white/60 rounded-lg animate-pulse mb-1" />
        ) : (
          <h1 className="text-3xl font-bold text-gray-700">{count.toLocaleString()}</h1>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg">{config.icon}</span>
          <h2 className="text-sm font-semibold text-gray-600">{type}</h2>
        </div>
      </div>
    </div>
  );
};

export default UserCard;