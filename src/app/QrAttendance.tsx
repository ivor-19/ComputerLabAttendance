import { QRAttendanceTable } from '@/components/tables/QRAttendanceTable';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Scanner } from '@yudiel/react-qr-scanner';
import { useEffect, useState } from 'react';
import axios from 'axios';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChartNoAxesColumnIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

export const QrAttendance = () => {
  const navigate = useNavigate();

  // State variables
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [isStartClick, setIsStartClick] = useState<boolean>(false);
  const [isScanned, setIsScanned] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [course, setCourse] = useState<string>('')
  const [section, setSection] = useState<string>('')
  const [subject, setSubject] = useState<string>('')

  const [teacher, setTeacher] = useState<any>(null);
  const [teacherName, setTeacherName] = useState<string>('');
  const [teacherId, setTeacherId] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [classStarted, setClassStarted] = useState<boolean>(false);
  const [isEndClassEnabled, setIsEndClassEnabled] = useState<boolean>(false);

  // Time formatting function
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Handler for start time
  const handleStartTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(event.target.value);
  };

  // Handler for end time
  const handleEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(event.target.value);
  };

  const [startTime, setStartTime] = useState<string>(formatTime(new Date()));
  const [endTime, setEndTime] = useState<string>("");

  const fetchTeacher = async (result: any) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://comlab-backend.vercel.app/api/teacher/getSpecificTeacher/${result}`);
      const teacherData = response.data.teacher;
      setTeacher(teacherData);
      setTeacherName(`${teacherData.lastname}, ${teacherData.firstname}`);
      setTeacherId(teacherData.teacher_id);
      setLoading(false)
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        toast.error("Teacher do not exists.");
        setLoading(false);
        setIsStartClick(false);
        setIsScanned(false);
      } 
      else {
        toast.error("An unknown error has occurred.");
        setLoading(false);
        setIsStartClick(false);
        setIsScanned(false);
      }
    }
  };

  // Handle QR code scan
  const handleScan = async (result: any) => {
    const res = result.map((v: any) => v.rawValue.toString());
    console.log(res.toString());
    console.log(teacherId)
    console.log(course)
    console.log(section)
    try {
      const data = {
        student_id: res.toString(),
        teacher_id: teacherId, //teacher
        course: course, //teacher
        section: section, //teacher
        in_time: startTime,
        out_time: endTime
      };
      const response = await axios.post('https://comlab-backend.vercel.app/api/student/addAttendance', data);
      console.log(response);
      toast.error("Added");
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        toast.error("Student is not enrolled in this section.");
        setLoading(false);
      } 
      else if (error.response && error.response.status === 402) {
        toast.error("Cannot time out before the end time.");
        setLoading(false);
      } 
      else {
        toast.error("An unknown error has occurred.");
        setLoading(false);
      }
    }
  };

  const handleConfirm = async () => {
    try {
      await axios.delete("https://comlab-backend.vercel.app/api/student/deleteAllStudentAttendance")
      toast.success("Ended class successfully")
    } catch (error) {
      console.error(error)
    }

    setClassStarted(true);
    setIsStartClick(false);
    setIsPaused(false);
    setIsScanned(false);
  };

  const handleEndClass = async () => {
    try {
      await axios.delete("https://comlab-backend.vercel.app/api/student/deleteAllStudentAttendance")
      toast.success("Ended class successfully")
    } catch (error) {
      console.error(error)
    }

    setClassStarted(false);
    setIsEndClassEnabled(false);
    setIsPaused(true);

    setIsScanned(false);
  };

  // Function to check if the current time is past the end time
  const isTimePastEndTime = () => {
    const currentTime = new Date();
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const endTimeDate = new Date();
    endTimeDate.setHours(endHours, endMinutes, 0, 0);

    return currentTime >= endTimeDate;
  };

  useEffect(() => {
    if (classStarted && endTime) {
      const interval = setInterval(() => {
        if (isTimePastEndTime()) {
          setIsEndClassEnabled(true); // Enable "End Class" button
          setIsPaused(true); // Pause the scanner
          clearInterval(interval); // Stop checking
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [classStarted, endTime]);

  return (
    <>
      <Toaster />
      <div className="h-screen">
        <div className="h-full flex justify-center">
          <Button className="absolute left-5 top-5" onClick={() => navigate("/login")}>Login</Button>
          <div className="w-[60%] h-full flex justify-center items-center bg-gray-200">
            <div className="w-[500px] absolute top-28">
              <Scanner onScan={handleScan} paused={isPaused} />
            </div>
          </div>

          <div className="w-full h-[90%] p-4">
            <QRAttendanceTable />

            {classStarted && (
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-600">
                  Start Time: <strong>{startTime}</strong> | End Time: <strong>{endTime}</strong>
                </span>
              </div>
            )}
            {!classStarted && (
              <Button onClick={() => { setIsScanned(false); setIsStartClick(true);}}>Create New Class</Button>
            )}
            {classStarted && (
              <Button onClick={handleEndClass} disabled={!isEndClassEnabled}>End Class</Button>
            )}
            <Dialog open={isStartClick} onOpenChange={() => setIsStartClick(false)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className='text-center'>Set up class attendance</DialogTitle>

                  <div className={`w-full bg-red-200 ${isScanned ? 'hidden' : 'flex'}`}>
                    <Scanner onScan={(teacherResult) => { setIsScanned(true); fetchTeacher(teacherResult.map((v: any) => v.rawValue).toString()); }} paused={false} />
                  </div>
                  <div className={`w-full ${isScanned ? 'flex' : 'hidden'}`}>
                    {loading ? (
                      <div className="flex justify-center items-center">
                        <Loader2 className='animate-spin text-center' />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-5 w-full">
                        <div className="flex flex-col gap-3">
                          <div>
                            <Label htmlFor="teacher_id">ID</Label>
                            <Input id="teacher_id" placeholder="Teacher ID" value={teacherId} disabled />
                          </div>
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="Teacher Name" value={teacherName} disabled />
                          </div>
                          <div className='flex flex-col gap-2'>
                            <Label htmlFor="course">Course</Label>
                            <select id="course" className="w-[180px] p-2 border rounded-md" value={course} onChange={(e) => setCourse(e.target.value)}>
                              <option value="" disabled>Select a course</option>
                              {teacher?.courses?.map((course: string, index: number) => (
                                <option key={index} value={course}>{course}</option>
                              ))}
                            </select>
                          </div>
                          <div className='flex flex-col gap-2'>
                            <Label htmlFor="section">Section</Label>
                            <select id="section" className="w-[180px] p-2 border rounded-md" value={section} onChange={(e) => setSection(e.target.value)}>
                              <option value="" disabled>Select a section</option>
                              {teacher?.sections?.map((section: string, index: number) => (
                                <option key={index} value={section}>{section}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex flex-col">
                            <label htmlFor="time" className="text-sm font-medium mb-2">Select Time:</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                id="startTime"
                                value={startTime}
                                onChange={handleStartTimeChange}
                                className="border p-2 rounded-md"
                                disabled
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

                        <div className="w-full flex justify-between">
                          <Button type="button" onClick={() => { setIsStartClick(false); setIsScanned(false); }}>Cancel</Button>
                          <Button onClick={handleConfirm}>Start Class</Button>
                        </div>
                      </div>
                    )}

                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
};