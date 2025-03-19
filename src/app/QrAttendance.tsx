import { QRAttendanceTable } from '@/components/tables/QRAttendanceTable';
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Scanner } from '@yudiel/react-qr-scanner';
import { useState } from 'react';

export const QrAttendance = () => {
  const navigate = useNavigate();

  const [scanResult, setScanResult] = useState('');
  const handleScan = (data: string | null) => {
    if (data) {
      setScanResult(data); 
    }
  };

  const handleError = (err: any) => {
    console.error('Error scanning QR code: ', err); 
  };

  return (
    <div className='h-screen'>
      <Button onClick={() => navigate("/login")}>Login</Button>
      <div className='h-full w-full grid grid-cols-2 gap-10 p-10 items-center justify-center'>
        <div className='w-full h-[90%] bg-gray-200'>
         <Scanner onScan={(result) => console.log(result)} />;
        </div>
        <div className='w-full h-[90%] p-4'>
          <QRAttendanceTable />
        </div>
      </div>
    </div>
  )
}
