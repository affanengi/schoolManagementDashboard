"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import Link from "next/link";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type FirebaseEvent = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  class?: string;
};

const bgColors = [
  "border-t-lamaSky",
  "border-t-lamaPurple",
  "border-t-lamaYellow",
];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());
  const [allEvents, setAllEvents] = useState<FirebaseEvent[]>([]);
  const [visibleEvents, setVisibleEvents] = useState<FirebaseEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all events once
  useEffect(() => {
    getDocs(collection(db, "events"))
      .then((snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirebaseEvent));
        // Sort by date ascending
        data.sort((a, b) => a.date.localeCompare(b.date));
        setAllEvents(data);
        // Default: show events for today or upcoming
        filterEvents(new Date(), data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filterEvents = (selectedDate: Date, events: FirebaseEvent[]) => {
    const selected = selectedDate.toISOString().split("T")[0];
    const matching = events.filter((e) => e.date === selected);

    if (matching.length > 0) {
      setVisibleEvents(matching);
    } else {
      // Show next 3 upcoming events from selected date
      const upcoming = events
        .filter((e) => e.date >= selected)
        .slice(0, 3);
      setVisibleEvents(upcoming.length > 0 ? upcoming : events.slice(0, 3));
    }
  };

  const handleDateChange = (newValue: Value) => {
    onChange(newValue);
    if (newValue instanceof Date) {
      filterEvents(newValue, allEvents);
    }
  };

  // Dates that have events — highlight them
  const eventDates = new Set(allEvents.map((e) => e.date));
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const d = date.toISOString().split("T")[0];
      if (eventDates.has(d)) return "has-event";
    }
    return null;
  };

  return (
    <>
      <style>{`
        .has-event {
          position: relative;
        }
        .has-event abbr::after {
          content: "";
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #C3EBFA;
        }
        .react-calendar {
          border: none !important;
          width: 100% !important;
          font-family: inherit !important;
        }
        .react-calendar__tile--active {
          background: #C3EBFA !important;
          color: #111 !important;
          border-radius: 6px;
        }
        .react-calendar__tile--now {
          background: #FAE27C !important;
          border-radius: 6px;
        }
        .react-calendar__navigation button:hover,
        .react-calendar__tile:hover {
          background: #f1f5f9 !important;
          border-radius: 6px;
        }
      `}</style>
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <Calendar
          onChange={handleDateChange}
          value={value}
          tileClassName={tileClassName}
        />

        <div className="flex items-center justify-between mt-4 mb-2">
          <h1 className="text-lg font-semibold">
            {visibleEvents.length > 0 &&
            value instanceof Date &&
            visibleEvents.some((e) => e.date === value.toISOString().split("T")[0])
              ? "Today's Events"
              : "Upcoming Events"}
          </h1>
          <Link href="/list/events">
            <Image src="/moreDark.png" alt="more" width={18} height={18} />
          </Link>
        </div>

        {loading ? (
          <div className="text-sm text-gray-400 animate-pulse py-4 text-center">
            Loading events...
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="text-sm text-gray-400 py-4 text-center">
            No events scheduled.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visibleEvents.map((event, i) => (
              <div
                key={event.id}
                className={`p-3 rounded-md border-2 border-gray-100 border-t-4 ${bgColors[i % bgColors.length]}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700 text-sm">{event.title}</h3>
                  <span className="text-gray-400 text-xs font-medium">
                    {event.startTime} – {event.endTime}
                  </span>
                </div>
                {event.description && (
                  <p className="mt-1 text-gray-500 text-xs line-clamp-2">{event.description}</p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">{event.date}</span>
                  {event.class && (
                    <span className="text-xs bg-lamaSkyLight text-lamaSky px-2 py-0.5 rounded-full">
                      {event.class}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default EventCalendar;