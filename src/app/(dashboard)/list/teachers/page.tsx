"use client";

import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { useAuth } from "@/components/AuthProvider";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import FormModal from "@/components/FormModal";

type Teacher = {
  id: number | string;
  teacherId: string;
  name: string;
  email?: string;
  photo: string;
  phone: string;
  subjects: string[];
  classes: string[];
  address: string;
  bloodType?: string;
  emergencyContact?: string;
};

const columns = [
  { header: "Info", accessor: "info" },
  { header: "Teacher ID", accessor: "teacherId", className: "hidden md:table-cell" },
  { header: "Subjects", accessor: "subjects", className: "hidden md:table-cell" },
  { header: "Classes", accessor: "classes", className: "hidden md:table-cell" },
  { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
  { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "action" },
];

const ITEM_PER_PAGE = 10;

const TeacherList = () => {
  const { role } = useAuth();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const searchParam = searchParams.get("search");
  const page = pageParam ? parseInt(pageParam) : 1;
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all teachers once from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "teachers"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Teacher[];
        setAllTeachers(data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter, Sort and Paginate dynamically based on URL params
  const { displayedTeachers, totalCount } = useMemo(() => {
    let filtered = allTeachers;
    if (searchParam) {
      const lowerQuery = searchParam.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(lowerQuery) ||
          t.subjects?.some((s) => s.toLowerCase().includes(lowerQuery)) ||
          t.classes?.some((c) => c.toLowerCase().includes(lowerQuery))
      );
    }
    filtered = [...filtered].sort((a, b) =>
      sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    const count = filtered.length;
    const startIndex = ITEM_PER_PAGE * (page - 1);
    const sliced = filtered.slice(startIndex, startIndex + ITEM_PER_PAGE);
    return { displayedTeachers: sliced, totalCount: count };
  }, [allTeachers, searchParam, page, sortOrder]);

  const renderRow = (item: Teacher) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="flex items-center gap-4 p-4">
        {item.photo && item.photo !== "/avatar.png" ? (
          <Image src={item.photo} alt="" width={40} height={40} className="md:hidden xl:block w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className={`md:hidden xl:flex w-10 h-10 rounded-full items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
            ["bg-lamaSky","bg-lamaPurple","bg-pink-400","bg-green-400","bg-amber-400","bg-indigo-400"][item.name.charCodeAt(0) % 6]
          }`}>
            {item.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.teacherId}</td>
      <td className="hidden md:table-cell">{item.subjects?.join(",") || "-"}</td>
      <td className="hidden md:table-cell">{item.classes?.join(",") || "-"}</td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <>
              <FormModal table="teacher" type="update" data={item} />
              <FormModal table="teacher" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Teachers</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button
              onClick={() => setSortOrder((o) => o === "asc" ? "desc" : "asc")}
              title={`Sorted ${sortOrder === "asc" ? "A→Z (click for Z→A)" : "Z→A (click for A→Z)"}`}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow relative group"
            >
              <Image src="/sort.png" alt="sort" width={14} height={14} />
              <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-white rounded-full px-0.5 shadow text-gray-500">
                {sortOrder === "asc" ? "↑" : "↓"}
              </span>
            </button>
            {role === "admin" && (
              <FormModal table="teacher" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      {loading ? (
        <div className="p-10 text-center text-gray-500">Loading data from Firebase...</div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={displayedTeachers} />
      )}
      {/* PAGINATION */}
      <Pagination page={page} count={totalCount} ITEM_PER_PAGE={ITEM_PER_PAGE} />
    </div>
  );
};

export default TeacherList;
