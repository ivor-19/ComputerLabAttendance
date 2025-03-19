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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const QrAttendance = () => {
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState<boolean>(true)
  const [isStartClick, setIsStartClick] = useState<boolean>(false)
  const [isScanned, setIsScanned] = useState<boolean>(false)
  const [scannedData, setScannedData] = useState('')

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  const [startTime, setStartTime] = useState<string>(formatTime(new Date()));
  const handleStartTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(event.target.value);
  };

  const [endTime, setEndTime] = useState<string>("");
  const handleEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(event.target.value);
  };

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
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => { setIsPaused(false) }}>Start Class</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Scan QR Code</DialogTitle>
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
                        <div className="flex flex-col">
                          <label htmlFor="time" className="text-sm font-medium mb-2">Select Time:</label>
                          <div className='flex items-center gap-2'>
                            <input
                              type="time"
                              id="startTime"
                              value={startTime}
                              onChange={handleStartTimeChange}
                              className="border p-2 rounded-md"
                            />
                            to
                            <input
                              type="time"
                              id="endTime"
                              value={endTime}
                              onChange={handleEndTimeChange}
                              className="border p-2 rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                      <div className='w-full flex justify-between'>
                        <Button type='button' onClick={() => { setIsStartClick(false); setIsScanned(false) }}>Cancel</Button>
                        <Button>Confirm</Button>
                      </div>
                    </form>
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  )
}
