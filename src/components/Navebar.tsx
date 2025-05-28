import Image from "next/image"

const Navebar = () => {
  return (
    <div className='flex items-center justify-between p-4'>

      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[2px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={12} height={12} />
        <input type="text" placeholder="Search....." className="w-[200px] p-2 bg-transparent outline-none" />
      </div>

      <div className="flex items-center gap-4 justify-end w-full">
        <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer">
          <Image src="/message.png" alt="" width={18} height={18} />
        </div>
        <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer relative">
          <Image src="/announcement.png" alt="" width={18} height={18} />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">1</div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">Erum Khan</span>
          <span className="text-[10px] text-gray-500 text-right">Admin</span>
        </div>
        <Image src="/avatar.png" alt="" width={34} height={34} className="rounded-full" />
      </div>
    </div>
  )
}

export default Navebar