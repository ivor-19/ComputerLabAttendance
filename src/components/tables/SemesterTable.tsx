"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, CheckCircle, Clock, Loader, MoreHorizontal, Pencil } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import DeleteModal from "../DeleteModal"
import axios from "axios"
import { Skeleton } from "../ui/skeleton"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { AddSemester } from "../addModals/AddSemester"
import { format, parse } from "date-fns"
import { Badge } from "../ui/badge"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Loader2 } from "lucide-react"

export type SemesterList = {
  _id: string;
  semester_type: string;
  school_year: string;
  start: Date | string;
  end: Date | string;
  status: string;
}

const FormSchema = z.object({
  semester_type: z.enum(["1st", "2nd", "3rd", "Summer Class"]),
  school_year: z.string().min(1, { message: "School year is required" }),
  start: z.string().min(1, { message: "Start date is required" }),
  end: z.string().min(1, { message: "End date is required" }),
  status: z.enum(["Upcoming", "Ongoing", "Finished"]),
})

type FormData = z.infer<typeof FormSchema>;

export function SemesterTable() {
  const { handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      semester_type: "1st",
      school_year: "",
      start: "",
      end: "",
      status: "Upcoming"
    }
  })

  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "status",
      desc: false, // Sort in ascending order to put Ongoing first
    }
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [sem, setSem] = React.useState<SemesterList | null>(null)
  const [open, setOpen] = React.useState(false)
  const [openDelete, setOpenDelete] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [list, setList] = React.useState<SemesterList[]>([])
  const [loadingTable, setLoadingTable] = React.useState(true)
  const [editMode, setEditMode] = React.useState(false)
  const [openEdit, setOpenEdit] = React.useState(false)
  const [startYear, setStartYear] = React.useState<number>(new Date().getFullYear())
  const [endYear, setEndYear] = React.useState<number>(new Date().getFullYear() + 1)

  // Generate years from current year to 2099
  const years = Array.from({ length: 2099 - new Date().getFullYear() + 1 }, (_, i) => new Date().getFullYear() + i)

  // Function to get current date in Philippine time (UTC+8)
  // const getCurrentPhilippineDate = () => {
  //   const now = new Date();
  //   const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  //   return phTime;
  // };

  // Function to parse date string with Philippine timezone
  const parsePhilippineDate = (dateString: string) => {
    try {
      // Parse as MM-DD-YYYY in Philippine time (UTC+8)
      const parsed = parse(dateString, 'MM-dd-yyyy', new Date());
      return new Date(parsed.getTime() - (8 * 60 * 60 * 1000)); // Convert to UTC
    } catch (e) {
      console.error("Error parsing date:", dateString, e);
      return new Date();
    }
  };

  const columns: ColumnDef<SemesterList>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "semester_type",
      header: ({ column }) => {
        return (
          <div className="text-left">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="text-xs pl-0 bg-transparent"
            >
              Semester Type
              <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => <div>{row.getValue("semester_type")}</div>,
    },
    {
      accessorKey: "school_year",
      header: ({ column }) => {
        return (
          <div className="text-left">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="text-xs pl-0 bg-transparent"
            >
              School Year
              <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => <div>{row.getValue("school_year")}</div>,
    },
    {
      accessorKey: "start",
      header: ({ column }) => {
        return (
          <div className="text-left">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="text-xs pl-0 bg-transparent"
            >
              Start Date
              <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => <div>{row.getValue("start")}</div>,
    },
    {
      accessorKey: "end",
      header: ({ column }) => {
        return (
          <div className="text-left">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="text-xs pl-0 bg-transparent"
            >
              End Date
              <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => <div>{row.getValue("end")}</div>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <div className="text-left">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="text-xs pl-0 bg-transparent"
            >
              Status
              <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue("status") === "Ongoing" ? (
            <Badge className="bg-green-200 text-green-800 hover:bg-green-200 cursor-default gap-1">
              <Loader className="h-3.5 w-3.5" />
              {row.getValue("status")}
            </Badge>
          ) : row.getValue("status") === "Upcoming" ? (
            <Badge className="bg-yellow-200 text-yellow-800 hover:bg-yellow-200 cursor-default gap-1">
              <Clock className="h-3.5 w-3.5" />
              {row.getValue("status")}
            </Badge>
          ) : (
            <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-200 cursor-default gap-1">
              <CheckCircle className="h-3.5 w-3.5" />
              {row.getValue("status")}
            </Badge>
          )}
        </div>
      ),
      sortingFn: (rowA, rowB, columnId) => {
        const statusA = rowA.getValue(columnId) as "Ongoing" | "Upcoming" | "Finished";
        const statusB = rowB.getValue(columnId) as "Ongoing" | "Upcoming" | "Finished";
        
        const order: Record<"Ongoing" | "Upcoming" | "Finished", number> = { 
          "Ongoing": 0, 
          "Upcoming": 1, 
          "Finished": 2 
        };
        
        return order[statusA] - order[statusB];
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const status = row.getValue("status");
        const canEdit = status !== "Finished" && status !== "Ongoing";
        
        return (
          <>
          {canEdit &&
            <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="ghost" className="h-8 w-8 p-0">
                 <span className="sr-only">Open menu</span>
                 <MoreHorizontal className="h-4 w-4" />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
               <DropdownMenuLabel>Actions</DropdownMenuLabel>
               <DropdownMenuSeparator />
               {canEdit && (
                 <DropdownMenuItem onClick={() => handleEditClick(row.original)}>
                   <Pencil className="mr-2 h-4 w-4" />
                   Edit Details
                 </DropdownMenuItem>
               )}
             </DropdownMenuContent>
            </DropdownMenu>
          }
          </>
        )
      },
    },
  ]

  const fetchList = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/acads/updateStatus");
      setList(response.data);
    } catch (error) {
      console.error("Error fetching semesters", error);
      toast.error("Failed to fetch semesters");
    } finally {
      setLoadingTable(false);
    }
  };

  React.useEffect(() => {
    fetchList()
  }, [])

  // Update school year when start or end year changes
  React.useEffect(() => {
    setValue("school_year", `${startYear}-${endYear}`, { shouldValidate: true })
  }, [startYear, endYear, setValue])

  const handleEditClick = (sem: SemesterList) => {
    setSem(sem)
    setEditMode(true)
    
    // Parse the school year from the semester data
    const [start, end] = sem.school_year.split('-')
    setStartYear(parseInt(start))
    setEndYear(parseInt(end))
    
    // Parse dates with Philippine timezone
    const startDate = typeof sem.start === 'string' 
      ? parsePhilippineDate(sem.start)
      : new Date(sem.start);
    const endDate = typeof sem.end === 'string' 
      ? parsePhilippineDate(sem.end)
      : new Date(sem.end);

    reset({
      semester_type: sem.semester_type as "1st" | "2nd" | "3rd" | "Summer Class",
      school_year: sem.school_year || '',
      start: format(startDate, 'MM-dd-yyyy'),
      end: format(endDate, 'MM-dd-yyyy'),
      status: sem.status as "Upcoming" | "Ongoing" | "Finished"
    })
    setOpenEdit(true)
  }

  const handleStartYearChange = (value: string) => {
    const year = parseInt(value)
    setStartYear(year)
    // Automatically set end year to next year if it's not already greater
    if (year >= endYear) {
      setEndYear(year + 1)
    }
  }

  const handleEndYearChange = (value: string) => {
    setEndYear(parseInt(value))
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      if (sem && editMode) {
        // Convert dates to Philippine time before sending
        const startDate = parsePhilippineDate(data.start);
        const endDate = parsePhilippineDate(data.end);

        await axios.post(`https://comlab-backend.vercel.app/api/acads/editSemester/${sem._id}`, {
          semester_type: data.semester_type,
          school_year: data.school_year,
          start: format(startDate, 'MM-dd-yyyy'),
          end: format(endDate, 'MM-dd-yyyy'),
          status: data.status
        })
        fetchList()
        setOpenEdit(false)
        setEditMode(false)
        toast.success("Semester updated successfully")
      }
    } catch (error) {
      console.error("Error updating semester", error)
      toast.error("Failed to update semester")
    } finally {
      setLoading(false)
    }
  }

  const deleteSemester = async () => {
    setLoading(true)
    try {
      const selectedRows = table.getSelectedRowModel().rows
      for (const row of selectedRows) {
        const semesterId = row.original._id
        await axios.delete(`https://comlab-backend.vercel.app/api/acads/deleteSemester/${semesterId}`)
      }
      toast.info(`${selectedRows.length} semester(s) has been deleted.`)
      fetchList()
      setRowSelection({})
      setOpenDelete(false)
    } catch (error) {
      console.error("Error deleting semester", error)
      toast.error("Failed to delete semester")
    } finally {
      setLoading(false)
    }
  }

  const table = useReactTable({
    data: list,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      sorting: [
        {
          id: "status",
          desc: false,
        }
      ]
    }
  })

  return (
    <>
      {loadingTable ? (
        <div className="w-full">
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min relative ">
            <div className="flex items-center py-4 font-geist justify-between">
              <div className="w-1/2 flex gap-2">
                <Skeleton className="w-[30%] h-10" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="w-20 h-10" />
              </div>
            </div>
            <div className="rounded-md border font-geist">
              <Skeleton className="h-96 w-full"></Skeleton>
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
          <div className="flex items-center justify-between py-4">
            <div>
              {/* Search input can be added here if needed */}
            </div>
            <div>
              <div className="flex gap-2">
                {Object.keys(rowSelection).length !== 0 && (
                  <DeleteModal
                    title={`Delete (${Object.keys(rowSelection).length})`}
                    description={`Are you sure you want to delete ${Object.keys(rowSelection).length} semester(s)?`}
                    open={openDelete}
                    setOpen={setOpenDelete}
                    onClick={deleteSemester}
                    loading={loading}
                  />
                )}
                <AddSemester open={open} setOpen={setOpen} fetch={fetchList} />
              </div>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>

          {/* Edit Dialog */}
          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent className="sm:max-w-[425px] font-geist">
              <DialogHeader>
                <DialogTitle>Edit Semester</DialogTitle>
                <DialogDescription>
                  Update the details for this semester.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="semester_type" className="text-right">
                    Semester Type
                  </Label>
                  <Select 
                    value={watch("semester_type")}
                    onValueChange={(value: "1st" | "2nd" | "3rd" | "Summer Class") => setValue("semester_type", value)}
                  >
                    <SelectTrigger className="w-[180px] font-geist">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className='font-geist'>
                      <SelectItem value="1st">1st</SelectItem>
                      <SelectItem value="2nd">2nd</SelectItem>
                      <SelectItem value="3rd">3rd</SelectItem>
                      <SelectItem value="Summer Class">Summer Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="school_year" className="text-right">
                    School Year
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Select 
                      value={startYear.toString()} 
                      onValueChange={handleStartYearChange}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Start year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={`start-${year}`} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>-</span>
                    <Select 
                      value={endYear.toString()} 
                      onValueChange={handleEndYearChange}
                      disabled={startYear === 2099} // Disable if start year is already max
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="End year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years
                          .filter(year => year > startYear) // Only show years after start year
                          .map((year) => (
                            <SelectItem key={`end-${year}`} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.school_year && (
                    <span className="col-span-4 text-right text-sm text-red-500">
                      {errors.school_year.message}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start" className="text-right">
                    Start Date
                  </Label>
                  <div className="col-span-3">
                    <DatePicker
                      selected={watch("start") ? parsePhilippineDate(watch("start")) : null}
                      onChange={(date: Date | null) => {
                        if (date) {
                          const formatted = format(date, 'MM-dd-yyyy')
                          setValue("start", formatted, { shouldValidate: true })
                        } else {
                          setValue("start", "", { shouldValidate: true })
                        }
                      }}
                      dateFormat="MM-dd-yyyy"
                      placeholderText="MM-DD-YYYY"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      selectsStart
                      startDate={watch("start") ? parsePhilippineDate(watch("start")) : null}
                      endDate={watch("end") ? parsePhilippineDate(watch("end")) : null}
                      minDate={new Date()} // Disable past dates
                    />
                    {errors.start && (
                      <span className="text-sm text-red-500">
                        {errors.start.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end" className="text-right">
                    End Date
                  </Label>
                  <div className="col-span-3">
                    <DatePicker
                      selected={watch("end") ? parsePhilippineDate(watch("end")) : null}
                      onChange={(date: Date | null) => {
                        if (date) {
                          const formatted = format(date, 'MM-dd-yyyy')
                          setValue("end", formatted, { shouldValidate: true })
                        } else {
                          setValue("end", "", { shouldValidate: true })
                        }
                      }}
                      dateFormat="MM-dd-yyyy"
                      placeholderText="MM-DD-YYYY"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      selectsEnd
                      startDate={watch("start") ? parsePhilippineDate(watch("start")) : null}
                      endDate={watch("end") ? parsePhilippineDate(watch("end")) : null}
                      minDate={watch("start") ? parsePhilippineDate(watch("start")) : new Date()} // Can't select date before start date or current date
                    />
                    {errors.end && (
                      <span className="text-sm text-red-500">
                        {errors.end.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select 
                    value={watch("status")}
                    onValueChange={(value: "Upcoming" | "Ongoing" | "Finished") => setValue("status", value)}
                  >
                    <SelectTrigger className="w-[180px] font-geist">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className='font-geist'>
                      <SelectItem value="Upcoming">Upcoming</SelectItem>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="Finished">Finished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter className="flex items-center">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating
                      </>
                    ) : (
                      "Update"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  )
}