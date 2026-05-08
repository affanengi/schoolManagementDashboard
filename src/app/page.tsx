import Link from "next/link";
import Image from "next/image";

const Homepage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] font-sans overflow-hidden">
      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center bg-white shadow-sm z-10 relative">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="logo" width={40} height={40} />
          <span className="text-xl font-bold text-gray-800">SchoolDash</span>
        </div>
        <div>
          <Link href="/sign-in" className="bg-lamaSky text-white px-6 py-2 rounded-full font-semibold hover:bg-lamaSkyLight transition-all shadow-md hover:shadow-lg">
            Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center text-center p-6 mt-16 z-10 relative">
        <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-lamaPurple opacity-20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute top-[10%] right-[-50px] w-80 h-80 bg-lamaYellow opacity-20 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-100px] left-[20%] w-96 h-96 bg-lamaSky opacity-20 blur-[100px] rounded-full pointer-events-none"></div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight z-10">
          Manage your school <br />
          <span className="text-lamaPurple">effortlessly.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed z-10">
          The ultimate school management dashboard designed to bring teachers, students, and parents together in one beautifully simple platform.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 z-10">
          <Link href="/sign-in" className="bg-lamaPurple text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-lamaPurpleLight transition-all shadow-md hover:shadow-lg">
            Get Started
          </Link>
          <Link href="/dashboard/admin" className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all shadow-sm">
            View Demo Dashboard
          </Link>
        </div>
        
        {/* Placeholder for illustration */}
        <div className="mt-20 w-full max-w-5xl relative z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F7F8FA] z-20 pointer-events-none bottom-[-20px]"></div>
          <div className="relative bg-white p-2 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden group">
            {/* Window Controls */}
            <div className="flex gap-1.5 p-3 border-b border-gray-100 bg-gray-50">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
             <div className="h-[400px] md:h-[500px] w-full bg-slate-50 flex items-center justify-center">
               <div className="flex flex-col items-center opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                  <Image src="/logo.png" alt="logo" width={80} height={80} className="mb-4 grayscale group-hover:grayscale-0 transition-all duration-500" />
                  <span className="text-gray-400 font-medium tracking-widest uppercase text-sm">Dashboard Interface Preview</span>
               </div>
             </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full py-6 text-center text-gray-400 mt-auto z-10 text-sm">
        <p>© {new Date().getFullYear()} SchoolDash. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Homepage;