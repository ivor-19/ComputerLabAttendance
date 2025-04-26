
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TeacherScheduler } from "@/components/TeacherScheduler";
import { AppSidebarTeacher } from "@/components/teacher/app-sidebar";

// interface ScheduleDetailsProps {
//   // You can add any props you need here
// }

export default function TScheduleDetails() {
  const navigate = useNavigate();
  const { name } = useParams<{ name: string }>();
  const location = useLocation();
  const { room } = location.state || {};


  return (
    <SidebarProvider style={{"--sidebar-width": "19rem",} as React.CSSProperties}>
      <AppSidebarTeacher />
      <SidebarInset>
        <div className="flex flex-col h-full">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/teacher/schedule");
                    }}
                  >
                    Schedules
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {name && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{decodeURIComponent(name)}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="px-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{decodeURIComponent(name || '')}</h2>
              <p className="text-muted-foreground">Room {room}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Schedule for {decodeURIComponent(name || '')}</h3>
              </div>
            </div>
                
            <TeacherScheduler />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}