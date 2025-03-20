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
import { Loader2 } from 'lucide-react';

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

  // Time formatting function
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [startTime, setStartTime] = useState<string>(formatTime(new Date()));
  const [endTime, setEndTime] = useState<string>("");

  // Handler for start time
  const handleStartTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(event.target.value);
  };

  // Handler for end time
  const handleEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(event.target.value);
  };

  const [loading, setLoading] = useState(false);
  const fetchTeacher = async (result: any) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://comlab-backend.vercel.app/api/teacher/getSpecificTeacher/${result}`);
      const teacherData = response.data.teacher;
      setTeacher(teacherData);
      setTeacherName(`${teacherData.lastname}, ${teacherData.firstname}`);
      setTeacherId(teacherData.teacher_id);
      setLoading(false)
    } catch (error) {
      console.error("Error fetching teacher data", error);
      setLoading(false)
    }
  };

  // Handle QR code scan
  const handleScan = async (result: any) => {
    const res = result.map((v: any) => v.rawValue.toString());
    console.log(res.toString());
    try {
      const data = {
        student_id: res.toString(),
        teacher_id: teacherId, //teacher
        course: course, //teacher
        section: section //teacher
      };
      const response = await axios.post('https://comlab-backend.vercel.app/api/student/addAttendance', data);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleConfirm = () => {
    console.log(section)
    console.log(course)
    console.log(teacherId)
  }

  return (
    <>
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
            <Button onClick={() => { setIsStartClick(true); }}>Start Class</Button>
            <Dialog open={isStartClick}>
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
                            <select id="course" className="w-[180px] p-2 border rounded-md" onChange={(e) => setCourse(e.target.value)}>
                              <option value="" disabled>Select a course</option>
                              {teacher?.courses?.map((course: string, index: number) => (
                                <option key={index} value={course}>{course}</option>
                              ))}
                            </select>
                          </div>
                          <div className='flex flex-col gap-2'>
                            <Label htmlFor="section">Section</Label>
                            <select id="section" className="w-[180px] p-2 border rounded-md" onChange={(e) => setSection(e.target.value)}>
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
                          <Button onClick={() => { setIsStartClick(false); setIsPaused(false) }}>Confirm</Button>
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
