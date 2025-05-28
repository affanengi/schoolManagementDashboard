import Announcements from "@/components/Announcements"
import AttendanceChart from "@/components/AttendanceChart"
import CountChart from "@/components/CountChart"
import EventCalendar from "@/components/EventCalendar"
import FinanceChart from "@/components/FinanceChart"
import UserCard from "@/components/UserCard"

const AdminPage = () => {
  return (
    <div className='p-3 flex gap-3 flex-col md:flex-row'>

      <div className="w-full lg:w-2/3 flex flex-col">
      
        <div className="flex gap-3 justify-between flex-wrap mb-12">
          <UserCard type="Students" />
          <UserCard type="Teachers" />
          <UserCard type="Parents" />
          <UserCard type="Staffs" />
        </div>

        <div className="flex gap-3 flex-col lg:flex-row mb-12">
          <div className="w-full lg:w-1/3 flex-grow">
            <CountChart />
          </div>

          <div className="w-full lg:w-2/3 flex-grow">
            <AttendanceChart />
          </div>
        </div>
      
        <div className="w-full flex-grow">
          <FinanceChart />
        </div>
      </div>

      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>

    </div>
  )
}

export default AdminPage