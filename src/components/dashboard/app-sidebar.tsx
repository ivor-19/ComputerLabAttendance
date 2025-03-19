"use client"

import * as React from "react"
import {
  AudioWaveform,
  Bot,
  ChevronRight,
  Command,
  GalleryVerticalEnd,
  SquareTerminal,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useLocation } from "react-router-dom"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Overview",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "Dashboard",
          url: "",
          isActive: false,
        },
      ],
    },
    {
      title: "Student & Course Management",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Students",
          url: "/admin/studentsLists",
          isActive: false,
        },
        {
          title: "Course & Section",
          url: "/admin/course&section",
          isActive: false,
        },
        {
          title: "Subjects",
          url: "/admin/subjects",
          isActive: false,
        },
      ],
    },
  ],
};


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  const updatedNav = data.navMain.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      isActive: location.pathname === item.url, // Set isActive to true if path matches
    })),
  }));
  
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <GalleryVerticalEnd className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold text-white">---</span>
                    <span className="text-white">v1.0.0</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
      </SidebarHeader>
        <SidebarContent className="gap-0 px-2">
          {/* We create a collapsible SidebarGroup for each parent. */}
          {updatedNav.map((item) => (
            <Collapsible
              key={item.title}
              title={item.title}
              defaultOpen
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel
                  asChild
                  className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <CollapsibleTrigger className="bg-transparent text-white">
                    {item.title}{" "}
                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {item.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild isActive={item.isActive}>
                            <a href={item.url} className="text-gray-200">{item.title}</a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ))}
        </SidebarContent>
      <SidebarFooter>
       
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}