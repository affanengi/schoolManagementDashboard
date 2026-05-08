"use client";

import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { useAuth } from "@/components/AuthProvider";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import FormModal from "@/components/FormModal";

type Parent = {
  id: number | string;
  name: string;
  email?: string;
  students: string[];
  phone: string;
  address: string;
};

const columns = [
  { header: "Info", accessor: "info" },
  { header: "Student Names", accessor: "students", className: "hidden md:table-cell" },
  { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
  { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "action" },
];

const ITEM_PER_PAGE = 10;

const ParentList = () => {
  const { role } = useAuth();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const searchParam = searchParams.get("search");

  const page = pageParam ? parseInt(pageParam) : 1;

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [allParents, setAllParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "parents"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Parent[];
        setAllParents(data);
      } catch (error) {
        console.error("Error fetching parents:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { displayedParents, totalCount } = useMemo(() => {
    let filtered = allParents;
    if (searchParam) {
      const lowerQuery = searchParam.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.students.some((s) => s.toLowerCase().includes(lowerQuery))
      );
    }
    filtered = [...filtered].sort((a, b) =>
      sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    const count = filtered.length;
    const startIndex = ITEM_PER_PAGE * (page - 1);
    const sliced = filtered.slice(startIndex, startIndex + ITEM_PER_PAGE);
    return { displayedParents: sliced, totalCount: count };
  }, [allParents, searchParam, page, sortOrder]);

  const renderRow = (item: Parent) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.students?.join(", ") || "-"}</td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal table="parent" type="update" data={item} />
              <FormModal table="parent" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Parents</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button
              onClick={() => setSortOrder((o) => o === "asc" ? "desc" : "asc")}
              title={`Sorted ${sortOrder === "asc" ? "A→Z" : "Z→A"}`}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow relative"
            >
              <Image src="/sort.png" alt="sort" width={14} height={14} />
              <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-white rounded-full px-0.5 shadow text-gray-500">
                {sortOrder === "asc" ? "↑" : "↓"}
              </span>
            </button>
            {role === "admin" && (
              <FormModal table="parent" type="create" />
            )}
          </div>
        </div>
      </div>
      {loading ? (
        <div className="p-10 text-center text-gray-500">Loading data from Firebase...</div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={displayedParents} />
      )}
      <Pagination page={page} count={totalCount} ITEM_PER_PAGE={ITEM_PER_PAGE} />
    </div>
  );
};

export default ParentList;
