import { QRAttendanceTable } from '@/components/tables/QRAttendanceTable';
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Scanner } from '@yudiel/react-qr-scanner';
import { useState } from 'react';

export const QrAttendance = () => {
  const navigate = useNavigate();

  return (
    <div className='h-screen'>
      <Button onClick={() => navigate("/login")}>Login</Button>
      <div className='h-full w-full grid grid-cols-2 gap-10 p-10 items-center justify-center'>
        <div className='w-full h-[90%] bg-gray-200'>
          <Scanner onScan={(result) => console.log(result.map((v) => v.rawValue))} />
          <span>push</span>
        </div>
        <div className='w-full h-[50%] p-4'>
          <QRAttendanceTable />
        </div>
      </div>
    </div>
  )
}
