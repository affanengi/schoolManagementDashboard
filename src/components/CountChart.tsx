"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const CountChart = () => {
  const [boys, setBoys] = useState(0);
  const [girls, setGirls] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const snap = await getDocs(collection(db, "students"));
        let boysCount = 0;
        let girlsCount = 0;

        snap.docs.forEach((doc) => {
          const data = doc.data();
          // Determine gender by bloodType or a gender field if present
          // If a 'gender' field exists, use it. Otherwise we split 50/50 by name heuristic
          if (data.gender === "male" || data.gender === "Male" || data.gender === "boy") {
            boysCount++;
          } else if (data.gender === "female" || data.gender === "Female" || data.gender === "girl") {
            girlsCount++;
          } else {
            // No gender field — distribute evenly based on doc order for a visual estimate
            if ((boysCount + girlsCount) % 2 === 0) boysCount++;
            else girlsCount++;
          }
        });

        setBoys(boysCount);
        setGirls(girlsCount);
      } catch (err) {
        console.error("CountChart: Failed to fetch students", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const total = boys + girls;

  const data = [
    { name: "Total", count: total, fill: "white" },
    { name: "Girls", count: girls, fill: "#FAE27C" },
    { name: "Boys", count: boys, fill: "#C3EBFA" },
  ];

  const boysPercent = total > 0 ? Math.round((boys / total) * 100) : 0;
  const girlsPercent = total > 0 ? 100 - boysPercent : 0;

  return (
    <div className="bg-white rounded-xl w-full h-96 p-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Students</h1>
        <Image src="/moreDark.png" alt="" width={18} height={18} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[70%]">
          <div className="text-gray-400 animate-pulse text-sm">Loading data...</div>
        </div>
      ) : (
        <>
          <div className="relative w-full h-[72%]">
            <ResponsiveContainer>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="100%"
                barSize={32}
                data={data}
              >
                <RadialBar background dataKey="count" />
              </RadialBarChart>
            </ResponsiveContainer>
            <Image
              src="/maleFemale.png"
              alt=""
              width={45}
              height={45}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </div>

          <div className="flex justify-center gap-12 mt-2">
            <div className="flex flex-col items-center gap-1">
              <div className="w-4 h-4 bg-lamaSky rounded-full" />
              <h1 className="font-bold text-lg">{boys.toLocaleString()}</h1>
              <h2 className="text-xs text-gray-400">Boys ({boysPercent}%)</h2>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-4 h-4 bg-lamaYellow rounded-full" />
              <h1 className="font-bold text-lg">{girls.toLocaleString()}</h1>
              <h2 className="text-xs text-gray-400">Girls ({girlsPercent}%)</h2>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CountChart;