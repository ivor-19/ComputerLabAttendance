import { useParams, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddComputerStat } from "@/components/AddComputerStat";
import { useEffect, useState } from "react";
import axios from "axios";

interface ComputerItem {
  _id: string;
  pc_id: string;
  comlabid: string;
  name: string;
  condition: string;
  status: string;
  dateAdded: string;
}

export default function CMDetails() {
  const { name } = useParams(); // Get name from URL params
  const location = useLocation(); // Get location object to access state
  const { room, id } = location.state || {}; // Extract room and id from state
  
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<ComputerItem[]>([]);

  const fetchList = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/computerStat/getList");
      setList(response.data.com);
      console.log("Response: ", response.data.com);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  // Filter the list based on the `name` field
  const filteredList = list.filter(item => item.comlabid === name);

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              value={name || ""}
              disabled
              placeholder="Name"
            />
            <Input 
              value={room || ""}
              disabled
              placeholder="Room"
            />
          </div>
          <div className="flex flex-row justify-end gap-5">
            <Accordion type="multiple" className="w-full">
              {filteredList.length > 0 ? (
                filteredList.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index + 1}`}>
                    <AccordionTrigger className="px-2">{item.name}</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col p-4 gap-2">
                        <span>ID: {item.pc_id}</span>
                        <span>Name: {item.name}</span>
                        <span>Condition: <Badge className={
                          item.condition === "Good" ? "bg-green-500" : 
                          item.condition === "Fair" ? "bg-yellow-500" : "bg-red-500"
                        }>{item.condition}</Badge></span>
                        <span>Status: <Badge className={
                          item.status === "Active" ? "bg-green-500" : "bg-red-500"
                        }>{item.status}</Badge></span>
                        <span>Date Added: {item.dateAdded}</span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
              ) : (
                <div className="flex justify-center items-center h-32">
                  <p className="text-gray-500">No results found.</p>
                </div>
              )}
            </Accordion>
            <AddComputerStat open={open} setOpen={setOpen} id={String(name)} fetch={fetchList} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}