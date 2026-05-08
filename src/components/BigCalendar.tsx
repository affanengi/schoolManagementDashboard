"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const localizer = momentLocalizer(moment);

type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  resource?: string;
};

// Parse "HH:MM" time string into a full Date on a given weekday index (0=Mon)
const buildEventDate = (weekdayIndex: number, timeStr: string): Date => {
  const now = new Date();
  const monday = new Date(now);
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(now.getDate() + diff);

  const target = new Date(monday);
  target.setDate(monday.getDate() + weekdayIndex);

  const [hours, minutes] = timeStr.split(":").map(Number);
  target.setHours(hours || 8, minutes || 0, 0, 0);
  return target;
};

const DAY_MAP: Record<string, number> = {
  Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5,
};

const BigCalendar = ({ filterClass, filterTeacher }: { filterClass?: string; filterTeacher?: string }) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [lessonsSnap, eventsSnap] = await Promise.all([
          getDocs(collection(db, "lessons")),
          getDocs(collection(db, "events")),
        ]);

        const calEvents: CalendarEvent[] = [];

        // Build calendar events from lessons (recurring weekly)
        lessonsSnap.docs.forEach((doc) => {
          const d = doc.data();
          if (filterClass && d.class !== filterClass) return;
          if (filterTeacher && d.teacher !== filterTeacher) return;
          const dayIndex = DAY_MAP[d.day];
          if (dayIndex === undefined) return;
          const start = buildEventDate(dayIndex, d.startTime || "08:00");
          const end = buildEventDate(dayIndex, d.endTime || "09:00");
          calEvents.push({
            title: `${d.subject} (${d.class})`,
            start,
            end,
            resource: "lesson",
          });
        });

        // Build calendar events from the events collection (one-time)
        eventsSnap.docs.forEach((doc) => {
          const d = doc.data();
          if (!d.date || !d.startTime || !d.endTime) return;

          const [startH, startM] = d.startTime.split(":").map(Number);
          const [endH, endM] = d.endTime.split(":").map(Number);
          const baseDate = new Date(d.date);

          const start = new Date(baseDate);
          start.setHours(startH || 9, startM || 0, 0, 0);

          const end = new Date(baseDate);
          end.setHours(endH || 10, endM || 0, 0, 0);

          calEvents.push({
            title: `📅 ${d.title}${d.class ? ` (${d.class})` : ""}`,
            start,
            end,
            resource: "event",
          });
        });

        setEvents(calEvents);
      } catch (err) {
        console.error("BigCalendar: Failed to load events", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filterClass]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const isEvent = event.resource === "event";
    return {
      style: {
        backgroundColor: isEvent ? "#C3EBFA" : "#FAE27C",
        color: "#333",
        border: "none",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: 500,
      },
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px] text-gray-400 animate-pulse">
        Loading schedule...
      </div>
    );
  }

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      views={["work_week", "day"]}
      view={view}
      style={{ height: "100%" }}
      onView={setView}
      min={new Date(2026, 1, 0, 7, 0, 0)}
      max={new Date(2026, 1, 0, 18, 0, 0)}
      eventPropGetter={eventStyleGetter}
      popup
    />
  );
};

export default BigCalendar;