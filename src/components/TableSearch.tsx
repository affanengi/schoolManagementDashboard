"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const TableSearch = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Populate from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const existing = params.get("search") || "";
    setValue(existing);
  }, []);

  const pushSearch = (query: string) => {
    const params = new URLSearchParams(window.location.search);
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    // Debounce: wait 350ms after user stops typing before updating URL
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushSearch(v);
    }, 350);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushSearch(value);
  };

  const handleClear = () => {
    setValue("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushSearch("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-3 py-1 focus-within:ring-lamaSky transition-all"
    >
      <Image src="/search.png" alt="search" width={14} height={14} />
      <input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={handleChange}
        className="w-[180px] bg-transparent outline-none text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="text-gray-400 hover:text-gray-600 text-xs font-bold"
          title="Clear search"
        >
          ✕
        </button>
      )}
    </form>
  );
};

export default TableSearch;
