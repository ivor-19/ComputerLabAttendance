"use client"

import * as React from "react"
import { ArrowUpDown, GanttChart, MoreHorizontal, Search, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Skeleton } from "../ui/skeleton"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export type ComLabList = {
  _id: string
  name: string
  room: string
}

export function ComManagementTable() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: "asc" | "desc" }>({
    key: "name",
    direction: "asc"
  })
  
  const navigate = useNavigate()
  const [list, setList] = React.useState<ComLabList[]>([])
  const [loadingTable, setLoadingTable] = React.useState(true)

  const fetchList = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/computer/getList")
      setList(response.data.com)
      setLoadingTable(false)
    } catch (error) {
      console.error("Error fetching users", error)
      toast.error("Failed to fetch computer labs")
      setLoadingTable(false)
    }
  }

  React.useEffect(() => {
    fetchList()
  }, [])

  const handleRowClick = (row: ComLabList): void => {
    navigate(`/teacher/comManagement/${encodeURIComponent(row.name)}`, {
      state: {
        name: row.name,
        room: row.room,
        id: row._id
      }
    })
  }

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const filteredList = React.useMemo(() => {
    let result = [...list]
    if (searchQuery) {
      result = result.filter((item) => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.room.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    result.sort((a, b) => {
      if (sortConfig.key === "name") {
        return sortConfig.direction === "asc" 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name)
      } else if (sortConfig.key === "room") {
        return sortConfig.direction === "asc" 
          ? a.room.localeCompare(b.room) 
          : b.room.localeCompare(a.room)
      }
      return 0
    })
    return result
  }, [list, searchQuery, sortConfig])

  const [currentPage, setCurrentPage] = React.useState(0)
  const itemsPerPage = 8
  const pageCount = Math.ceil(filteredList.length / itemsPerPage)
  const paginatedList = filteredList.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  return (
    <>
      {loadingTable ? (
        <div className="w-full">
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min relative">
            <div className="flex items-center py-4 font-geist justify-between">
              <div className="w-1/2 flex gap-2">
                <Skeleton className="w-[30%] h-10" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="w-20 h-10" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
            <div className="flex items-center justify-between space-x-2 py-4 font-geist">
              <Skeleton className="h-10 w-20"></Skeleton>
              <div className="space-x-2 flex">
                <Skeleton className="w-20 h-8" />
                <Skeleton className="w-20 h-8" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or room"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(0)
                }}
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1"
                >
                  Name
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("room")}
                  className="flex items-center gap-1"
                >
                  Room
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {paginatedList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginatedList.map((lab) => (
                <Card
                  key={lab._id}
                  className="h-full transition-all hover:border-primary hover:shadow-md"
                >
                  <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Monitor className="h-5 w-5" />
                        {lab.name}
                      </CardTitle>
                      <CardDescription>Room {lab.room}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleRowClick(lab)}>
                          <GanttChart className="mr-2 h-4 w-4" />
                          View & Manage
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Click to view details and manage computers</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full" onClick={() => handleRowClick(lab)}>
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-muted-foreground">No computer labs found. Try adjusting your search.</p>
            </div>
          )}

          {pageCount > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {pageCount} • Showing {paginatedList.length} of {filteredList.length} items
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(pageCount - 1, prev + 1))}
                  disabled={currentPage >= pageCount - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}