"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormModal from "@/components/FormModal";
import Image from "next/image";

type Announcement = { id: string; title: string; class?: string; date: any; description?: string };

const columns = [
  { header: "Title", accessor: "title" },
  { header: "Class", accessor: "class", className: "hidden md:table-cell" },
  { header: "Date", accessor: "date", className: "hidden md:table-cell" },
  { header: "Actions", accessor: "action" },
];

const ITEM_PER_PAGE = 10;

const AnnouncementList = () => {
  const { role } = useAuth();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const searchParam = searchParams.get("search") || "";
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [allData, setAllData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, "announcements"))
      .then(snap => setAllData(snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement))))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (date: any) => {
    if (!date) return "—";
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const getDateMs = (date: any) => {
    if (!date) return 0;
    return (date?.toDate ? date.toDate() : new Date(date)).getTime();
  };

  const { displayed, total } = useMemo(() => {
    let filtered = allData.filter(a =>
      !searchParam ||
      a.title.toLowerCase().includes(searchParam.toLowerCase()) ||
      a.class?.toLowerCase().includes(searchParam.toLowerCase())
    );
    filtered = [...filtered].sort((a, b) =>
      sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
    const total = filtered.length;
    return { displayed: filtered.slice((page - 1) * ITEM_PER_PAGE, page * ITEM_PER_PAGE), total };
  }, [allData, searchParam, page, sortOrder]);

  const renderRow = (item: Announcement) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4 font-semibold">{item.title}</td>
      <td className="hidden md:table-cell p-4">{item.class || "All Classes"}</td>
      <td className="hidden md:table-cell p-4">{formatDate(item.date)}</td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <><FormModal table="announcement" type="update" data={item} /><FormModal table="announcement" type="delete" id={item.id} /></>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Announcements</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")} title={`Sort by title ${sortOrder === "asc" ? "Z→A" : "A→Z"}`}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow relative">
              <Image src="/sort.png" alt="sort" width={14} height={14} />
              <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-white rounded-full px-0.5 shadow text-gray-500">
                {sortOrder === "asc" ? "↑" : "↓"}
              </span>
            </button>
            {role === "admin" && <FormModal table="announcement" type="create" />}
          </div>
        </div>
      </div>
      {loading ? <div className="p-10 text-center text-gray-400 animate-pulse">Loading...</div>
        : <Table columns={columns} renderRow={renderRow} data={displayed} />}
      <Pagination page={page} count={total} ITEM_PER_PAGE={ITEM_PER_PAGE} />
    </div>
  );
};
export default AnnouncementList;
