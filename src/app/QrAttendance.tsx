import { QRAttendanceTable } from '@/components/tables/QRAttendanceTable';
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Scanner } from '@yudiel/react-qr-scanner';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const QrAttendance = () => {
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState<boolean>(true)
  const [isStartClick, setIsStartClick] = useState<boolean>(false)
  const [scannedData, setScannedData] = useState('')

  return (
    <>
      <div className='h-screen'>
        <div className='h-full flex flex-1 justify-center'>
          <Button className='absolute left-5 top-5' onClick={() => navigate("/login")}>Login</Button>
          <div className='w-[60%] h-full flex justify-center items-center bg-gray-200'>
           <div className='w-[500px] absolute top-28'>
            <Scanner onScan={(result) => console.log(result.map((v) => v.rawValue))} paused={true} />
           </div>
          </div>
          <div className='w-full h-[90%] p-4'>
            <QRAttendanceTable />
            <Button onClick={() => { setIsStartClick(true); setIsPaused(false) }}>Start Class</Button>
          </div>
        </div>
      </div>

      <div className='w-full h-full z-2 absolute bg-transparent backdrop-blur-sm inset-0 flex justify-center items-center flex-1' style={{ display: isStartClick ? 'flex' : 'none' }}>
        <Card className='w-1/4'>
          <CardHeader>
            <CardTitle className='text-2xl text-center'>Scan Your QR here!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='w-full bg-red-200'>
              <Scanner onScan={(result) => { setScannedData(result.map((v) => v.rawValue).toString()) }} paused={isPaused} />
            </div>
            {scannedData &&
              <p>{scannedData}</p>
            }
          </CardContent>
        </Card>
      </div>
    </>
  )
}
