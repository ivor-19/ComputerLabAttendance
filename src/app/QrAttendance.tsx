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
} from "@/components/ui/dialog"
import { Loader2, School } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Semester {
  _id: string;
  semester_type: string;
  school_year: string;
  start: string;
  end: string;
  status: string;
  __v: number;
}

export const QrAttendance = () => {
  const navigate = useNavigate();

  // State variables
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [isStartClick, setIsStartClick] = useState<boolean>(false);
  const [isScanned, setIsScanned] = useState<boolean>(false);
  const [course, setCourse] = useState<string>('')
  const [section, setSection] = useState<string>('')
  const [subject, setSubject] = useState<string>('')
  const [comlab, setComLab] = useState<string>('')
  const [teacher, setTeacher] = useState<any>(null);
  const [teacherName, setTeacherName] = useState<string>('');
  const [teacherId, setTeacherId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [classStarted, setClassStarted] = useState<boolean>(false);
  const [isEndClassEnabled, setIsEndClassEnabled] = useState<boolean>(false);
  const [endClassLoading, setEndClassLoading] = useState(false);
  const [startClassLoading, setStartClassLoading] = useState(false);
  const [ongoingSemester, setOngoingSemester] = useState<{
    schoolYear: string;
    semesterType: string;
  } | null>(null);
  const [refresh, setRefresh] = useState<number>(0);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [loginDisabled, setLoginDisabled] = useState(false);
  const [randomCode, setRandomCode] = useState<string>('');
  const [labs, setLabs] = useState<{ _id: string, name: string; }[]>([])
  const [timeError, setTimeError] = useState<string>('');

  // Time dropdown options
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ['AM', 'PM'];

  // Format current time as HH:MM
  const formatTime = (date: Date) => {
    return date.toTimeString().slice(0, 5);
  };

  // Convert 24-hour time to 12-hour format with period
  const to12HourFormat = (time24: string) => {
    if (!time24) return { hour: '12', minute: '00', period: 'AM' };
    
    const [hours, minutes] = time24.split(':');
    const hourNum = parseInt(hours);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    
    return {
      hour: hour12.toString(),
      minute: minutes,
      period
    };
  };

  // Convert 12-hour format back to 24-hour time
  const to24HourFormat = (hour: string, minute: string, period: string) => {
    let hourNum = parseInt(hour);
    if (period === 'PM' && hourNum !== 12) {
      hourNum += 12;
    } else if (period === 'AM' && hourNum === 12) {
      hourNum = 0;
    }
    
    return `${hourNum.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
  };

  // Handle end time change with validation
  const handleEndTimeChange = (hour: string, minute: string, period: string) => {
    const newEndTime = to24HourFormat(hour, minute, period);
    setEndTime(newEndTime);
    
    // Validate end time is after start time
    if (startTime && newEndTime <= startTime) {
      setTimeError('End time must be after start time');
    } else {
      setTimeError('');
    }
  };

  // Generate random code for class session
  const generateUniqueRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({length: 16}, () => 
      characters[Math.floor(Math.random() * characters.length)]
    ).join('');
  };

  // Check if a time option should be disabled
  const isOptionDisabled = (type: 'hour' | 'minute' | 'period', value: string, current: any) => {
    if (!startTime) return false;
    
    const start12 = to12HourFormat(startTime);
    const current12 = current || to12HourFormat(startTime);
    
    if (type === 'hour') {
      // If same period, disable hours before start hour
      if (current12.period === start12.period) {
        return parseInt(value) < parseInt(start12.hour);
      }
      // If switching to AM from PM start time, disable all AM hours
      if (current12.period === 'AM' && start12.period === 'PM') {
        return true;
      }
      return false;
    }
    
    if (type === 'minute') {
      // If same period and same hour, disable minutes before start minute
      if (current12.period === start12.period && current12.hour === start12.hour) {
        return parseInt(value) < parseInt(start12.minute);
      }
      return false;
    }
    
    if (type === 'period') {
      // Disable AM if start time is PM
      return value === 'AM' && start12.period === 'PM';
    }
    
    return false;
  };

  // Fetch teacher data
  const fetchTeacher = async (result: any) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://comlab-backend.vercel.app/api/teacher/getSpecificTeacher/${result}`);
      const teacherData = response.data.teacher;
      setTeacher(teacherData);
      setTeacherName(`${teacherData.lastname}, ${teacherData.firstname}`);
      setTeacherId(teacherData.teacher_id);
      setLoading(false);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error("Teacher does not exist.");
      } else {
        toast.error("An unknown error has occurred.");
      }
      setLoading(false);
      setIsStartClick(false);
      setIsScanned(false);
    }
  };

  // Handle QR code scan for student attendance
  const handleScan = async (result: any) => {
    if (!result?.length) return;
    
    const studentId = result.map((v: any) => v.rawValue.toString()).toString();
    
    try {
      const data = {
        student_id: studentId,
        in_time: startTime,
        out_time: endTime
      };
      
      await axios.post('https://comlab-backend.vercel.app/api/student/updateAttendance', data);
      toast.success("Attendance recorded");
      setRefresh(prev => prev + 1);
    } catch (error: any) {
      const errorCode = error.response?.status;
      const errorMessages = {
        402: "Cannot time out before the end time.",
        403: "You cannot enter this class now.",
        404: "Student not found or failed to update.",
        405: "Failed to update in-time.",
        406: "Cannot time in now.",
        default: "An unknown error has occurred."
      };
      
      toast.error(errorMessages[errorCode as keyof typeof errorMessages] || errorMessages.default);
    }
  };

  // Start class session
  const handleConfirm = async () => {
    if (timeError) {
      toast.error("Please fix time selection errors");
      return;
    }

    setStartClassLoading(true);
    const newData = {
      teacher_id: teacherId, 
      course, 
      section, 
      subject, 
      semester: ongoingSemester?.semesterType, 
      school_year: ongoingSemester?.schoolYear
    };
    
    const teacherAttendance = {
      teacher_id: teacherId, 
      course, 
      section, 
      subject, 
      time_in: startTime, 
      unique: randomCode, 
      comlab
    };

    try {
      await axios.delete("https://comlab-backend.vercel.app/api/student/deleteAllStudentAttendance");
      await axios.post("https://comlab-backend.vercel.app/api/teacher/addToAttendance", teacherAttendance);
      await axios.post("https://comlab-backend.vercel.app/api/student/addToClass", newData);
      
      toast.success("Class is starting! Scan your QR code to mark attendance.");
      setRefresh(prev => prev + 1);
      
      setLoginDisabled(true);
      setClassStarted(true);
      setIsStartClick(false);
      setIsPaused(false);
      setIsScanned(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to start class");
    } finally {
      setStartClassLoading(false);
    }
  };

  // End class session
  const handleEndClass = async () => {
    setEndClassLoading(true);
    const teacherData = { unique: randomCode, time_out: endTime };
    
    try {
      await axios.post("https://comlab-backend.vercel.app/api/student/transferToRecords");
      await axios.post("https://comlab-backend.vercel.app/api/teacher/updateAttendance", teacherData);
      await axios.delete("https://comlab-backend.vercel.app/api/student/deleteAllStudentAttendance");
      
      toast.success("Class ended successfully. Attendance records transferred.");
      setRefresh(prev => prev + 1);
      
      // Reset states
      setClassStarted(false);
      setIsEndClassEnabled(false);
      setIsPaused(true);
      setLoginDisabled(false);
      setIsScanned(false);
      setCourse('');
      setSection('');
      setSubject('');
      setComLab('');
      setStartTime('');
      setEndTime('');
      setRandomCode(generateUniqueRandomCode());
    } catch (error) {
      console.error(error);
      toast.error("Failed to end class");
    } finally {
      setEndClassLoading(false);
    }
  };

  // Check if current time is past end time
  const isTimePastEndTime = () => {
    if (!endTime) return false;
    
    const currentTime = new Date();
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const endTimeDate = new Date();
    endTimeDate.setHours(endHours, endMinutes, 0, 0);

    return currentTime >= endTimeDate;
  };

  // Effect to check end time periodically
  useEffect(() => {
    if (!classStarted || !endTime) return;
    
    const checkTime = () => {
      if (isTimePastEndTime()) {
        setIsEndClassEnabled(true);
      } else {
        setTimeout(checkTime, 10000); // Check every 10 seconds
      }
    };

    checkTime();
  }, [classStarted, endTime]);

  // Fetch computer labs
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await axios.get("https://comlab-backend.vercel.app/api/computer/getList");
        setLabs(response.data.com);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load computer labs");
      }
    };
    fetchLabs();
  }, []);

  // Fetch ongoing semester
  useEffect(() => {
    const fetchOngoing = async () => {
      try {
        const response = await axios.get<Semester[]>(
          "https://comlab-backend.vercel.app/api/acads/getSemester"
        );
        
        const ongoing = response.data.find(semester => semester.status === "Ongoing");
        
        if (ongoing) {
          setOngoingSemester({
            schoolYear: ongoing.school_year,
            semesterType: ongoing.semester_type
          });
        } else {
          toast.error("No ongoing semester found");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load semester information");
      }
    };

    fetchOngoing();
  }, []);

  // Generate random code on mount
  useEffect(() => {
    setRandomCode(generateUniqueRandomCode());
  }, []);

  // Parse current end time for dropdowns
  const currentEndTime = to12HourFormat(endTime || startTime);
  const [selectedHour, setSelectedHour] = useState(currentEndTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(currentEndTime.minute);
  const [selectedPeriod, setSelectedPeriod] = useState(currentEndTime.period);

  // Update end time when dropdowns change
  useEffect(() => {
    handleEndTimeChange(selectedHour, selectedMinute, selectedPeriod);
  }, [selectedHour, selectedMinute, selectedPeriod]);

  return (
    <>
      <Toaster />
      <div className="h-screen">
        <div className="h-full flex justify-center">
          <Button 
            className="absolute left-5 top-5" 
            onClick={() => navigate("/login")} 
            disabled={loginDisabled}
          >
            Login
          </Button>
          
          <div className="w-[60%] h-full flex justify-center items-center bg-[#18181b] border-r border-gray-200">
            <div className="w-[500px] absolute top-28">
              <Scanner 
                onScan={handleScan} 
                paused={isPaused} 
                allowMultiple={true} 
                scanDelay={1500}
              />
            </div>
          </div>
          
          <div className="w-full h-[90%] p-4 flex flex-col items-center">
            <QRAttendanceTable refreshKey={refresh} />
            
            {!classStarted ? (
              <Button 
                onClick={() => { 
                  setIsScanned(false); 
                  setIsStartClick(true); 
                  setStartTime(formatTime(new Date()));
                }} 
                className='w-[20%] bg-[#022c22] hover:bg-[#064e3b]'
              >
                Create New Class
              </Button>
            ) : (
              <div className="mt-4 text-center flex flex-col gap-4 items-center bg-green-100 w-[50%] py-8 rounded-md">
                <span className="text-sm text-gray-600">
                  Start Time: <strong className={`${isEndClassEnabled ? 'text-green-700' : 'text-yellow-700'}`}>{startTime}</strong> | 
                  End Time: <strong className={`${isEndClassEnabled ? 'text-green-700' : 'text-yellow-700'}`}>{endTime}</strong>
                </span>
                
                <div className={`flex flex-col ${isEndClassEnabled ? 'text-green-700' : 'text-yellow-700'} text-sm`}>
                  <strong>{teacherName}</strong>
                  <span className="text-gray-500">Teacher</span>
                </div>
                
                <div className='mt-8 w-full'>
                  <div className='flex flex-col gap-2 items-center'>
                    <Button 
                      onClick={handleEndClass} 
                      disabled={!isEndClassEnabled} 
                      className='w-[40%] bg-green-600 hover:bg-green-700 text-white'
                    >
                      {endClassLoading ? (
                        <Loader2 className='animate-spin mx-2'/>
                      ) : (
                        'End Class'
                      )}
                    </Button>
                    <span className={`${isEndClassEnabled ? 'text-green-700' : 'text-yellow-700'} text-xs`}>
                      {isEndClassEnabled ? 'Class ended' : 'Class can only be ended after the scheduled end time'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <Dialog open={isStartClick} onOpenChange={() => setIsStartClick(false)}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className='text-center'>Set up class attendance</DialogTitle>
                  
                  {!isScanned ? (
                    <div className="w-full bg-red-200 p-4 rounded-md">
                      <Scanner 
                        onScan={(teacherResult) => { 
                          setIsScanned(true); 
                          fetchTeacher(teacherResult.map((v: any) => v.rawValue).toString()); 
                        }} 
                        paused={false}
                      />
                      <p className="text-center mt-2 text-sm">Scan your teacher QR code</p>
                    </div>
                  ) : loading ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className='animate-spin' />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5 w-full">
                      <div className="flex flex-col gap-3">
                        <div>
                          <Label htmlFor="teacher_id">ID</Label>
                          <Input id="teacher_id" value={teacherId} disabled />
                        </div>
                        
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" value={teacherName} disabled />
                        </div>
                        
                        <div className='flex flex-col gap-2'>
                          <Label htmlFor="subject">Subject</Label>
                          <Select value={subject} onValueChange={setSubject}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Subjects</SelectLabel>
                                {teacher?.subjects?.map((subject: string, index: number) => (
                                  <SelectItem key={index} value={subject}>{subject}</SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className='flex flex-col gap-2'>
                          <Label htmlFor="course">Course</Label>
                          <Select value={course} onValueChange={setCourse}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Courses</SelectLabel>
                                {teacher?.courses?.map((course: string, index: number) => (
                                  <SelectItem key={index} value={course}>{course}</SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className='flex flex-col gap-2'>
                          <Label htmlFor="section">Section</Label>
                          <Select value={section} onValueChange={setSection}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a section" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Sections</SelectLabel>
                                {teacher?.sections?.map((section: string, index: number) => (
                                  <SelectItem key={index} value={section}>{section}</SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className='flex flex-col gap-2'>
                          <Label htmlFor="section">Computer Lab</Label>
                          <Select value={comlab} onValueChange={setComLab}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a lab" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Computer Labs</SelectLabel>
                                {labs.map((lab) => (
                                  <SelectItem key={lab._id} value={lab.name}>
                                    {lab.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Label className="text-sm font-medium">Class Time</Label>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <Label htmlFor="startTime" className="text-xs text-gray-500">Start Time</Label>
                              <Input
                                type="time"
                                id="startTime"
                                value={startTime}
                                className="w-full"
                                disabled
                              />
                            </div>
                            <span className="mt-5">to</span>
                            <div className="flex-1">
                              <Label htmlFor="endTime" className="text-xs text-gray-500">End Time</Label>
                              <div className="flex gap-2">
                                <Select 
                                  value={selectedHour}
                                  onValueChange={setSelectedHour}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Hour" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      {hours.map((hour) => (
                                        <SelectItem 
                                          key={hour} 
                                          value={hour.toString()}
                                          disabled={isOptionDisabled('hour', hour.toString(), {
                                            hour: selectedHour,
                                            minute: selectedMinute,
                                            period: selectedPeriod
                                          })}
                                        >
                                          {hour}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                                
                                <Select 
                                  value={selectedMinute}
                                  onValueChange={setSelectedMinute}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Min" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      {minutes.map((minute) => (
                                        <SelectItem 
                                          key={minute} 
                                          value={minute.toString().padStart(2, '0')}
                                          disabled={isOptionDisabled('minute', minute.toString(), {
                                            hour: selectedHour,
                                            minute: selectedMinute,
                                            period: selectedPeriod
                                          })}
                                        >
                                          {minute.toString().padStart(2, '0')}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                                
                                <Select 
                                  value={selectedPeriod}
                                  onValueChange={setSelectedPeriod}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="AM/PM" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      {periods.map((period) => (
                                        <SelectItem 
                                          key={period} 
                                          value={period}
                                          disabled={isOptionDisabled('period', period, {
                                            hour: selectedHour,
                                            minute: selectedMinute,
                                            period: selectedPeriod
                                          })}
                                        >
                                          {period}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          {timeError && (
                            <p className="text-xs text-red-500">{timeError}</p>
                          )}
                        </div>
                      </div>

                      <div className="w-full flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => { setIsStartClick(false); setIsScanned(false); }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleConfirm} 
                          disabled={!subject || !course || !section || !comlab || !endTime || !!timeError}
                        >
                          {startClassLoading ? (
                            <>
                              Starting
                              <Loader2 className="animate-spin ml-2 h-4 w-4" />
                            </>
                          ) : (
                            'Start Class'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
};