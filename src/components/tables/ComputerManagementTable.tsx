"use client"

import * as React from "react"
import { ArrowUpDown, GanttChart, Loader2, MoreHorizontal, Pencil, Monitor, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import DeleteModal from "../DeleteModal"
import { AddCom } from "../addModals/AddCom"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Skeleton } from "../ui/skeleton"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export type ComLabList = {
  _id: string
  name: string
  room: string
}

const FormSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  room: z.string().min(1, { message: "Room is required" }),
  computerSets: z.string().optional(),
})

type FormData = z.infer<typeof FormSchema>

export function ComputerManagementTable() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })

  const [selectedItems, setSelectedItems] = React.useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = React.useState("")

  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)
  const [openDelete, setOpenDelete] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [list, setList] = React.useState<ComLabList[]>([])
  const [loadingTable, setLoadingTable] = React.useState(true)
  const [openEdit, setOpenEdit] = React.useState(false)
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: "asc" | "desc" }>({
    key: "name",
    direction: "asc",
  })

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

  const handleEditClick = (lab: ComLabList) => {
    reset({
      _id: lab._id,
      name: lab.name,
      room: lab.room,
    })
    setOpenEdit(true)
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      if (data._id) {
        await axios.post(`https://comlab-backend.vercel.app/api/computer/editCom/${data._id}`, {
          name: data.name,
          room: data.room,
        })
        fetchList()
        toast.success("Computer lab updated successfully")
        window.location.reload()
      }
    } catch (error) {
      console.error("Error updating lab", error)
      toast.error("Failed to update computer lab")
      window.location.reload()
    } finally {
      setLoading(false)
      setOpenEdit(false)
      reset()
      window.location.reload()
    }
  }

  const deleteCom = async () => {
    setLoading(true)
    try {
      const selectedIds = Object.keys(selectedItems).filter((id) => selectedItems[id])
      for (const comId of selectedIds) {
        await axios.delete(`https://comlab-backend.vercel.app/api/computer/deleteCom/${comId}`)
      }
      toast.success(`${selectedIds.length} computer lab(s) deleted successfully`)
      fetchList()
      setSelectedItems({})
    } catch (error) {
      console.error("Error deleting computer lab", error)
      toast.error("Failed to delete computer lab(s)")
    } finally {
      setLoading(false)
      setOpenDelete(false)
    }
  }

  const handleRowClick = (row: ComLabList): void => {
    navigate(`/admin/computermanagement/${encodeURIComponent(row.name)}`, {
      state: {
        name: row.name,
        room: row.room,
        id: row._id,
      },
    })
  }

  const toggleSelectAll = (checked: boolean) => {
    const newSelectedItems: Record<string, boolean> = {}
    if (checked) {
      filteredList.forEach((item) => {
        newSelectedItems[item._id] = true
      })
    }
    setSelectedItems(newSelectedItems)
  }

  const toggleSelectItem = (id: string, checked: boolean) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: checked,
    }))
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

  const selectedCount = Object.values(selectedItems).filter(Boolean).length

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
              <div className="flex gap-2 ml-auto">
                {selectedCount > 0 && (
                  <DeleteModal
                    title={`Delete ${selectedCount} computer lab(s)`}
                    description="This action cannot be undone. Are you sure you want to delete these computer labs?"
                    open={openDelete}
                    setOpen={setOpenDelete}
                    onClick={deleteCom}
                    loading={loading}
                  />
                )}
                <AddCom open={open} setOpen={setOpen} fetch={fetchList} />
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center">
            <Checkbox
              checked={paginatedList.length > 0 && paginatedList.every((item) => selectedItems[item._id])}
              onCheckedChange={(checked) => toggleSelectAll(!!checked)}
              id="select-all"
              className="mr-2"
            />
            <Label htmlFor="select-all">Select all</Label>
            {selectedCount > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                {selectedCount} of {filteredList.length} selected
              </span>
            )}
          </div>

          {paginatedList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginatedList.map((lab) => (
                <Card
                  key={lab._id}
                  className={`h-full transition-all ${
                    selectedItems[lab._id] ? "border-primary ring-1 ring-primary" : "hover:border-primary hover:shadow-md"
                  }`}
                >
                  <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Monitor className="h-5 w-5" />
                        {lab.name}
                      </CardTitle>
                      <CardDescription>Room {lab.room}</CardDescription>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedItems[lab._id] || false}
                        onCheckedChange={(checked) => toggleSelectItem(lab._id, !!checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="mr-2"
                      />
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
                          <DropdownMenuItem onClick={() => handleEditClick(lab)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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

          <Dialog 
            open={openEdit} 
            onOpenChange={(open) => {
              if (!open) {
                reset()
              }
              setOpenEdit(open)
            }}
          >
            <DialogContent className="sm:max-w-[425px] font-geist">
              <DialogHeader>
                <DialogTitle>Edit Computer Lab</DialogTitle>
                <DialogDescription>
                  Make changes to the computer lab details. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <input type="hidden" {...register("_id")} />
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="name"
                        className="col-span-3"
                        {...register("name")}
                        placeholder="Computer Lab Name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="room" className="text-right">
                      Room
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="room"
                        className="col-span-3"
                        {...register("room")}
                        placeholder="Room Number"
                      />
                      {errors.room && (
                        <p className="text-red-500 text-xs mt-1">{errors.room.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setOpenEdit(false);
                      window.location.reload(); // Reload on cancel
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : "Save changes"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  )
}