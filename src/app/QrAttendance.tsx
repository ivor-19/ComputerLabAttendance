import { QRAttendanceTable } from '@/components/tables/QRAttendanceTable';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Scanner } from '@yudiel/react-qr-scanner';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const QrAttendance = () => {
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState<boolean>(true)
  const [isStartClick, setIsStartClick] = useState<boolean>(false)
  const [isScanned, setIsScanned] = useState<boolean>(false)
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
            <CardTitle className='text-2xl text-center'>Scan Your QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='w-full bg-red-200' style={{ display: isScanned ? 'none' : 'flex' }}>
              <Scanner onScan={(result) => { setScannedData(result.map((v) => v.rawValue).toString()); setIsScanned(true) }} paused={isPaused} />
            </div>
            <div style={{ display: isScanned ? 'flex' : 'none' }}>
              <form action="" className='flex flex-col gap-5 w-full'>
                <div className='flex flex-col gap-3'>
                  <div>
                    <Label htmlFor='name'>Name</Label>
                    <Input id='name' placeholder='fetch to database' />
                  </div>
                  <div>
                    <Label htmlFor='subj'>Subject</Label>
                    <Input id='subj' placeholder='fetch to database' />
                  </div>
                  <div>
                    <Label htmlFor='time'>Time</Label>
                    <Input id='time' value={new Date().toLocaleTimeString()} readOnly />
                  </div>
                </div>
                <div className='w-full flex justify-between'>
                  <Button type='button' onClick={() => { setIsStartClick(false); setIsScanned(false) }}>Cancel</Button>
                  <Button>Confirm</Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
