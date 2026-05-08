"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormModal from "@/components/FormModal";
import Image from "next/image";

type Attendance = { id: string; studentId: string; studentName?: string; date: string; status: "Present" | "Absent" | "Late"; class?: string };

const columns = [
  { header: "Student ID", accessor: "studentId" },
  { header: "Student Name", accessor: "studentName", className: "hidden md:table-cell" },
  { header: "Class", accessor: "class", className: "hidden md:table-cell" },
  { header: "Date", accessor: "date", className: "hidden md:table-cell" },
  { header: "Status", accessor: "status" },
  { header: "Actions", accessor: "action" },
];

const ITEM_PER_PAGE = 10;

const statusColors = {
  Present: "bg-green-100 text-green-700",
  Absent: "bg-red-100 text-red-700",
  Late: "bg-yellow-100 text-yellow-700",
};

const AttendanceList = () => {
  const { role, user } = useAuth();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const searchParam = searchParams.get("search") || "";
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [allData, setAllData] = useState<Attendance[]>([]);
  const [childNames, setChildNames] = useState<string[] | null>(null); // null = not a parent / not loaded yet
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // If parent — resolve child names first
        if (role === "parent" && user?.email) {
          const pSnap = await getDocs(query(collection(db, "parents"), where("email", "==", user.email)));
          if (!pSnap.empty) {
            const names: string[] = pSnap.docs[0].data().students || [];
            setChildNames(names);
          } else {
            setChildNames([]);
          }
        }
        const snap = await getDocs(collection(db, "attendance"));
        setAllData(snap.docs.map(d => ({ id: d.id, ...d.data() } as Attendance)));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [role, user]);

  const { displayed, total } = useMemo(() => {
    let filtered = allData;
    // Parent: only their child's records
    if (role === "parent" && childNames !== null) {
      filtered = filtered.filter(a => childNames.some(n => n.toLowerCase() === a.studentName?.toLowerCase()));
    }
    filtered = filtered.filter(a =>
      !searchParam ||
      a.studentId.toLowerCase().includes(searchParam.toLowerCase()) ||
      a.studentName?.toLowerCase().includes(searchParam.toLowerCase()) ||
      a.class?.toLowerCase().includes(searchParam.toLowerCase()) ||
      a.status.toLowerCase().includes(searchParam.toLowerCase())
    );
    filtered = [...filtered].sort((a, b) =>
      sortOrder === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
    );
    const total = filtered.length;
    return { displayed: filtered.slice((page - 1) * ITEM_PER_PAGE, page * ITEM_PER_PAGE), total };
  }, [allData, childNames, searchParam, page, sortOrder, role]);

  const renderRow = (item: Attendance) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4 font-medium">{item.studentId}</td>
      <td className="hidden md:table-cell p-4">{item.studentName || "—"}</td>
      <td className="hidden md:table-cell p-4">{item.class || "—"}</td>
      <td className="hidden md:table-cell p-4">{item.date}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status] || ""}`}>
          {item.status}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <><FormModal table="attendance" type="update" data={item} /><FormModal table="attendance" type="delete" id={item.id} /></>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Attendance Records</h1>
          {role === "parent" && childNames !== null && (
            <p className="text-xs text-lamaSky font-medium mt-0.5">
              Showing: {childNames.length > 0 ? childNames.join(" & ") + "'s attendance" : "No children linked"}
            </p>
          )}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")} title="Toggle date sort"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="sort" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && <FormModal table="attendance" type="create" />}
          </div>
        </div>
      </div>
      {loading ? <div className="p-10 text-center text-gray-400 animate-pulse">Loading...</div>
        : <Table columns={columns} renderRow={renderRow} data={displayed} />}
      <Pagination page={page} count={total} ITEM_PER_PAGE={ITEM_PER_PAGE} />
    </div>
  );
};
export default AttendanceList;
