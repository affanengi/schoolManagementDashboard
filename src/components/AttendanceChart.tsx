"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

type DayStats = { name: string; present: number; absent: number };

const AttendanceChart = () => {
  const [chartData, setChartData] = useState<DayStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState<string>("");

  useEffect(() => {
    const buildChart = async () => {
      try {
        const snap = await getDocs(collection(db, "attendance"));
        const records = snap.docs.map((d) => d.data());

        // Get the current Monday's date
        const now = new Date();
        const monday = new Date(now);
        const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        monday.setDate(now.getDate() + diff);

        // Build the week date strings
        const weekDates: { label: string; dateStr: string }[] = DAYS.map((label, i) => {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          const dateStr = d.toISOString().split("T")[0];
          return { label, dateStr };
        });

        setWeek(
          `${weekDates[0].dateStr} — ${weekDates[4].dateStr}`
        );

        // Aggregate counts per day
        const dayMap: Record<string, { present: number; absent: number }> = {};
        weekDates.forEach(({ dateStr }) => {
          dayMap[dateStr] = { present: 0, absent: 0 };
        });

        records.forEach((r: any) => {
          if (dayMap[r.date] !== undefined) {
            if (r.status === "Present" || r.status === "Late") {
              dayMap[r.date].present++;
            } else if (r.status === "Absent") {
              dayMap[r.date].absent++;
            }
          }
        });

        const data: DayStats[] = weekDates.map(({ label, dateStr }) => ({
          name: label,
          present: dayMap[dateStr]?.present ?? 0,
          absent: dayMap[dateStr]?.absent ?? 0,
        }));

        setChartData(data);
      } catch (err) {
        console.error("AttendanceChart: Failed to fetch data", err);
        // Fallback to empty state
        setChartData(DAYS.map((name) => ({ name, present: 0, absent: 0 })));
      } finally {
        setLoading(false);
      }
    };
    buildChart();
  }, []);

  return (
    <div className="bg-white rounded-xl p-4 h-full shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">Attendance</h1>
          {week && <p className="text-xs text-gray-400">{week}</p>}
        </div>
        <Image src="/moreDark.png" alt="" width={18} height={18} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[80%]">
          <div className="text-gray-400 animate-pulse text-sm">Loading attendance data...</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="88%">
          <BarChart data={chartData} barSize={20} margin={{ top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: "10px", borderColor: "#e5e7eb" }}
              cursor={{ fill: "#f9fafb" }}
            />
            <Legend
              align="left"
              verticalAlign="top"
              wrapperStyle={{ paddingTop: "10px", paddingBottom: "20px" }}
            />
            <Bar
              dataKey="present"
              name="Present"
              fill="#FAE27C"
              legendType="circle"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="absent"
              name="Absent"
              fill="#C3EBFA"
              legendType="circle"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AttendanceChart;