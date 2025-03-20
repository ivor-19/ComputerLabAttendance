import { useParams } from "react-router-dom";
import { AppSidebar } from "@/components/dashboard/app-sidebar"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CMDetailsParams = {
  name: string;
}

export default function CMDetails() {
  const { name } = useParams<CMDetailsParams>();
  
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
                <BreadcrumbLink href="/admin/computermanagement">Computer Management</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Display computer lab details for {name} */}
          <h2 className="text-2xl font-semibold">Details for {name}</h2>
          <Input placeholder="Name"></Input>
          <Input placeholder="Room"></Input>
          <Button>Update</Button>
          <div>
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="px-2">Computer Set #1</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col p-4 gap-2">
                    <span>ID: 1342423</span>
                    <span>Name: asdasd</span>
                    <span>Condition: <Badge>Good</Badge></span>
                    <span>Status: <Badge>Good</Badge></span>
                    <span>Date Added: </span>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="px-2">Computer Set #1</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col p-4 gap-2">
                    <span>ID: 1342423</span>
                    <span>Name: asdasd</span>
                    <span>Condition: <Badge>Good</Badge></span>
                    <span>Status: <Badge>Good</Badge></span>
                    <span>Date Added: </span>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="px-2">Computer Set #1</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col p-4 gap-2">
                    <span>ID: 1342423</span>
                    <span>Name: asdasd</span>
                    <span>Condition: <Badge>Good</Badge></span>
                    <span>Status: <Badge>Good</Badge></span>
                    <span>Date Added: </span>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}