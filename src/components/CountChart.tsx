"use client"

import Image from 'next/image';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Total',
    count: 106,
    fill: 'white',
  },
  {
    name: 'Girls',
    count: 47,
    fill: '#FAE27C',
  },
  {
    name: 'Boys',
    count: 53,
    fill: '#C3EBFA',
  },
];

const CountChart = () => {
  return (
    <div className='bg-white rounded-xl w-full h-96 p-3'>

        <div className='flex justify-between items-center'>
            <h1 className='text-lg font-semibold'>Students</h1>
            <Image src="/moreDark.png" alt="" width={18} height={18} />
        </div>

        <div className='relative w-full h-[75%]'>
        <ResponsiveContainer >
        <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="100%" barSize={32} data={data}>
          <RadialBar
            background
            dataKey="count"
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <Image src="/maleFemale.png" alt="" width={45} height={45} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className='flex justify-center gap-20'>
            <div className='flex flex-col gap-1'>
                <div className='w-4 h-4 bg-lamaSky rounded-full' />
                <h1 className='font-bold'>1,234</h1>
                <h2 className='text-xs text-gray-300'>Boys (51%)</h2>
            </div>
            <div className='flex flex-col gap-1'>
                <div className='w-4 h-4 bg-lamaYellow rounded-full' />
                <h1 className='font-bold'>1,234</h1>
                <h2 className='text-xs text-gray-300'>Girls (49%)</h2>
            </div>
        </div>
    </div>
  )
}

export default CountChart