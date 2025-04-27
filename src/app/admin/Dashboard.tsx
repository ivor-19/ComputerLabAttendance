import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SchedulerComponent } from "@/components/SchedulerComponent"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import axios from "axios"
import { Boxes, ChevronLeft, ChevronRight, TrendingUpIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

interface ComputerLab {
  id: string;
  name: string;
}

export default function Dashboard() {
  const [totalStudents, setTotalStudents] = useState("");
  const [totalTeachers, setTotalTeachers] = useState("");
  const [totalComputerSets, setTotalComputerSets] = useState("");
  const [loading, setLoading] = useState(false);
  const [computerLabs, setComputerLabs] = useState<ComputerLab[]>([]);
  const [currentLabIndex, setCurrentLabIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        // Fetch students
        const responseStudents = await axios.get("https://comlab-backend.vercel.app/api/student/getStudents");
        setTotalStudents(responseStudents.data.length);

        // Fetch teachers
        const responseTeachers = await axios.get("https://comlab-backend.vercel.app/api/teacher/getTeachers");
        setTotalTeachers(responseTeachers.data.length);

        // Fetch computer sets
        const responseComputer = await axios.get("https://comlab-backend.vercel.app/api/computerStat/getList");
        setTotalComputerSets(responseComputer.data.com.length);

        // Fetch schedules to get computer labs
        const responseSchedules = await axios.get("https://comlab-backend.vercel.app/api/schedule/getSched");
        const schedules = responseSchedules.data;

        // Extract unique computer labs from schedules
        const labsMap = new Map<string, ComputerLab>();
        schedules.forEach((schedule: any) => {
          if (schedule.comlab_id && schedule.comlab) {
            labsMap.set(schedule.comlab_id, {
              id: schedule.comlab_id,
              name: schedule.comlab
            });
          }
        });

        const uniqueLabs = Array.from(labsMap.values());
        setComputerLabs(uniqueLabs);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNextLab = () => {
    setCurrentLabIndex((prevIndex) => 
      prevIndex === computerLabs.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevLab = () => {
    setCurrentLabIndex((prevIndex) => 
      prevIndex === 0 ? computerLabs.length - 1 : prevIndex - 1
    );
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        {loading ? (
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <Card className="@container/card cursor-pointer" onClick={() => navigate('/admin/course&section')}>
                <CardHeader className="relative">
                  <CardDescription>Total Students</CardDescription>
                  <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">{totalStudents || "0"}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                  <div className="line-clamp-1 flex gap-2 font-medium">
                    Student Enrolled. <TrendingUpIcon className="size-4" />
                  </div>
                  <div className="text-muted-foreground">
                    Showing total number of enrolled students.
                  </div>
                </CardFooter>
              </Card>
              <Card className="@container/card cursor-pointer" onClick={() => navigate('/admin/faculty')}>
                <CardHeader className="relative">
                  <CardDescription>Total Teachers</CardDescription>
                  <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">{totalTeachers || "0"}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                  <div className="line-clamp-1 flex gap-2 font-medium">
                    Teacher Staff. <TrendingUpIcon className="size-4" />
                  </div>
                  <div className="text-muted-foreground">
                    Current total number of teachers.
                  </div>
                </CardFooter>
              </Card>
              <Card className="@container/card cursor-pointer" onClick={() => navigate('/admin/computermanagement')}>
                <CardHeader className="relative">
                  <CardDescription>Total Computer Sets</CardDescription>
                  <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">{totalComputerSets || "0"}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                  <div className="line-clamp-1 flex gap-2 font-medium">
                    Computer Set Inventory. <Boxes className="size-4" />
                  </div>
                  <div className="text-muted-foreground">
                    Current total number of computer sets available.
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            {computerLabs.length > 0 ? (
              <Card className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min z-0">
                <div className="flex items-center justify-between p-4">
                  <button 
                    onClick={handlePrevLab}
                    className="p-2 rounded-full hover:bg-gray-100"
                    disabled={computerLabs.length <= 1}
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  
                  <h2 className="text-xl font-semibold">
                    {computerLabs[currentLabIndex]?.name || "Loading..."}
                  </h2>
                  
                  <button 
                    onClick={handleNextLab}
                    className="p-2 rounded-full hover:bg-gray-100"
                    disabled={computerLabs.length <= 1}
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
                
                <SchedulerComponent 
                  id={computerLabs[currentLabIndex]?.id} 
                  comlabname={computerLabs[currentLabIndex]?.name}
                />
              </Card>
            ) : (
              <Card className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min z-0 p-4">
                <p className="text-center text-muted-foreground">
                  No computer labs found. Please add some schedules first.
                </p>
              </Card>
            )}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}