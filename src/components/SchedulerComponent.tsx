import { useEffect, useState } from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import axios from "axios";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";

interface Event {
  event_id: string;
  title: string;
  start: Date;
  end: Date;
  teacher_name: string;
  subject: string;
  course: string;
  section: string;
  subtitle: string;
  comlab: string;
  comlab_id: string;
}

interface ApiResponse {
  event_id: string;
  title: string;
  start: string;
  end: string;
  teacher_name: string;
  subject: string;
  course: string;
  section: string;
  subtitle: string;
  comlab: string;
  comlab_id: string;
}

interface Option {
  id: number;
  text: string;
  value: string;
}

interface SchedulerComponentProps {
  id: string;
  comlabname?: string;
}

export const SchedulerComponent = ({ id, comlabname = '' }: SchedulerComponentProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<Option[]>([]);
  const [coursesOptions, setCoursesOptions] = useState<Option[]>([]);
  const [subjectsOptions, setSubjectsOptions] = useState<Option[]>([]);
  const [sectionsOptions, setSectionsOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false); // New state for action loading

  const fetchData = async (endpoint: string, transformFn: (item: any, index: number) => Option) => {
    try {
      const response = await axios.get(`https://comlab-backend.vercel.app/api/${endpoint}`);
      return response.data.map(transformFn);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return [];
    }
  };

  const fetchTeachers = async () => {
    const teachers = await fetchData("teacher/getTeachers", (teacher, index) => ({
      id: index + 1,
      text: `${teacher.firstname} ${teacher.lastname}`,
      value: `${teacher.firstname} ${teacher.lastname}`,
    }));
    setTeacherOptions(teachers);
  };

  const fetchSections = async () => {
    const sections = await fetchData("acads/getSections", (section, index) => ({
      id: index + 1,
      text: section.section,
      value: section.section,
    }));
    setSectionsOptions(sections);
  };

  const fetchCourses = async () => {
    const courses = await fetchData("acads/getCourses", (course, index) => ({
      id: index + 1,
      text: course.course,
      value: course.course,
    }));
    setCoursesOptions(courses);
  };

  const fetchSubjects = async () => {
    const subjects = await fetchData("acads/getSubjects", (subject, index) => ({
      id: index + 1,
      text: subject.subject,
      value: subject.subject,
    }));
    setSubjectsOptions(subjects);
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get<ApiResponse[]>("https://comlab-backend.vercel.app/api/schedule/getSched");
      
      const parsedEvents = response.data
        .filter(event => event.comlab_id === id)
        .map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          comlab: comlabname || '',
        }));

      setEvents(parsedEvents);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const handleApiError = (error: unknown, defaultMessage: string) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        return Promise.reject(error.response.data);
      }
    }
    console.error(defaultMessage, error);
    toast.error(defaultMessage);
    return Promise.reject(error);
  };

  const handleConfirm = async (event: Event, action: "create" | "edit") => {
    setIsActionLoading(true); // Start loading
    try {
      const eventPayload = {
        ...event,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        comlab: comlabname || '',
        comlab_id: id,
      };

      if (action === "create") {
        await axios.post("https://comlab-backend.vercel.app/api/schedule/addSchedule", {
          ...eventPayload,
          event_id: Date.now().toString(),
        });
        toast.success("Event created successfully");
      } else {
        await axios.put("https://comlab-backend.vercel.app/api/schedule/updateSched", eventPayload);
        toast.success("Event updated successfully");
      }

      await fetchSchedules();
      return event;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 400) {
            toast.error("Conflict on schedule");
        } else {
            console.error("Server responded with:", error.response.data);
            toast.error(`Server error: ${error.response.status}`);
        }
    } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("Network error - no response from server");
    } else {
        console.error("Request setup error:", error.message);
        toast.error("Request error");
    }
      return handleApiError(error, "Error saving event");
    } finally {
      setIsActionLoading(false); // End loading
    }
  };

  const handleDelete = async (event_id: string) => {
    setIsActionLoading(true); // Start loading
    try {
      await axios.delete(`https://comlab-backend.vercel.app/api/schedule/deleteSched/${event_id}`);
      setEvents(prev => prev.filter(event => event.event_id !== event_id));
      toast.success("Event deleted successfully");
      return event_id;
    } catch (error) {
      return handleApiError(error, "Error deleting event");
    } finally {
      setIsActionLoading(false); // End loading
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchTeachers(),
          fetchSchedules(),
          fetchCourses(),
          fetchSubjects(),
          fetchSections(),
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    initializeData();
  }, [id, comlabname]);

  if (isLoading) {
    return <Skeleton className="flex justify-center items-center h-full" />;
  }

  return (
    <div className="flex justify-center w-full">
      <div className="w-full relative">
        {isActionLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-center">Processing...</p>
            </div>
          </div>
        )}
        <Scheduler
          height={600}
          draggable={false}
          events={events}
          week={{
            weekDays: [0, 1, 2, 3, 4, 5],
            weekStartOn: 6,
            startHour: 6,
            endHour: 22,
            step: 60,
          }}
          day={{
            startHour: 6,
            endHour: 22,
            step: 60,
          }}
          fields={[
            {
              name: "teacher_name",
              type: "select",
              options: teacherOptions,
              config: { label: "Teacher", required: true, errMsg: "Please select a teacher" },
            },
            {
              name: "subject",
              type: "select",
              options: subjectsOptions,
              config: { label: "Subject", required: true, errMsg: "Please select a subject" },
            },
            {
              name: "course",
              type: "select",
              options: coursesOptions,
              config: { label: "Course", required: true, errMsg: "Please select a course" },
            },
            {
              name: "section",
              type: "select",
              options: sectionsOptions,
              config: { label: "Section", required: true, errMsg: "Please select a section" },
            },
          ]}
          onConfirm={handleConfirm}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};