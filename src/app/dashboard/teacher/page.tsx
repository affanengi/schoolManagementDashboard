import Announcements from "@/components/Announcements"
import BigCalendar from "@/components/BigCalendar"
import EventCalendar from "@/components/EventCalendar"

const TeacherPage = () => {
    return (
      <div className='flex-1 p-3 flex gap-3 flex-col xl:flex-row'>

        {/* LEFT */}

        <div className="w-full xl:w-2/3">
          <div className="h-full bg-white p-3 rounded-md">
            <h1 className="text-xl font-semibold">Schedule</h1>
            <BigCalendar />
          </div>
        </div>

        {/* RIGHT */}

        <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
      </div>
    )
  }
  
  export default TeacherPage