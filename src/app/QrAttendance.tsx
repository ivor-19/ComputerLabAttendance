import { QRAttendanceTable } from '@/components/tables/QRAttendanceTable';
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Scanner } from '@yudiel/react-qr-scanner';
import { useState } from 'react';

export const QrAttendance = () => {
  const navigate = useNavigate();

  return (
    <div className='h-screen'>
      <div className='h-full flex flex-1 justify-center'>
      <Button className='absolute left-5 top-5' onClick={() => navigate("/login")}>Login</Button>
        <div className='w-full flex justify-center items-center bg-gray-200'>
          <div className='w-1/2'>
            <Scanner onScan={(result) => console.log(result.map((v) => v.rawValue))} />
          </div>
        </div>
        <div className='w-full h-[90%] p-4'>
          <QRAttendanceTable />
        </div>
      </div>
    </div>
  )
}
