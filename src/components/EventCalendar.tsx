"use client"

import { time } from "console";
import Image from "next/image";
import { title } from "process";
import { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';


type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const events = [
    {
        id: 1,
        title: "Lorem ipsum dolor",
        time: "12.00 PM - 2.00 PM",
        description: "Lorem ipsum dolor sit amet, consectetur elit.", 
    },
    {
        id: 2,
        title: "Lorem ipsum dolor",
        time: "12.00 PM - 2.00 PM",
        description: "Lorem ipsum dolor sit amet, consectetur elit.", 
    },
    {
        id: 3,
        title: "Lorem ipsum dolor",
        time: "12.00 PM - 2.00 PM",
        description: "Lorem ipsum dolor sit amet, consectetur elit.", 
    }
];

const EventCalendar = () => {
    const [value, onChange] = useState<Value>(new Date());

  return (
    <div className='bg-white p-3 rounded-md'> 
        <Calendar onChange={onChange} value={value}/> 
        <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold my-4">Events</h1>
            <Image src="/moreDark.png" alt="" width={18} height={18} />
        </div>
        <div className="flex flex-col gap-4">
            {events.map(event=>(
                <div className="p-1.5 rounded-md border-2 border-gray-100 border-t-3 odd:border-t-lamaSky even:border-t-lamaPurple" key={event.id}>
                    <div className="flex items-center justify-between">
                        <h1 className="font-semibold text-gray-600">{event.title}</h1>
                        <span className="text-gray-400 text-xs">{event.time}</span>
                    </div>
                    <p className="mt-1 text-gray-450 text-sm">{event.description}</p>
                </div>
            ))}
        </div>
    </div>
  )
}

export default EventCalendar