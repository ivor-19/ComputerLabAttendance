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
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, FilterX, MoreHorizontal, PlusCircle, SquarePen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "../ui/badge"
import axios from "axios"
import { Skeleton } from "../ui/skeleton"

export type Student = {
  student_id: string,
  teacher_id: string,
  course_section: string,
  date: string,
  time_in: string,
  time_out: string,
  status: "Present" | "Absent" | "Late" | "Excused"
}

export const columns: ColumnDef<Student>[] = [
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
    accessorKey: "student_id",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Student ID
            <ArrowUpDown />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div>{row.getValue("student_id")}</div>,
  },
  {
    accessorKey: "course_section",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Course & Section
            <ArrowUpDown />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div>{row.getValue("course_section")}</div>,
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Date
            <ArrowUpDown />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div>{row.getValue("date")}</div>,
  },
  {
    accessorKey: "time_in",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Time In
            <ArrowUpDown />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div>{row.getValue("time_in") === null ? "-----" : row.getValue("time_in")}</div>,
  },
  {
    accessorKey: "time_out",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Time Out
            <ArrowUpDown />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div>{row.getValue("time_out") === null ? "-----" : row.getValue("time_out")}</div>,
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
            <ArrowUpDown />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">
        <Badge
          className={`
            ${row.getValue("status") === 'Absent' ? 'bg-red-200 text-red-900 hover:bg-red-200' :
              row.getValue("status") === 'Late' ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-200' :
                row.getValue("status") === 'Excused' ? 'bg-blue-200 text-blue-800 hover:bg-blue-200' :
                  'bg-green-200 text-green-800 hover:bg-green-200'
            }
            cursor-default
          `}
        >
          {row.getValue("status")}
        </Badge>
      </div>
    )
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const student = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(student.student_id)}
            >
              Copy student ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              
              Edit
            </DropdownMenuItem>
          
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]

interface StudentAttendanceRecordProps {
  refreshKey: number;
}

export function StudentAttendanceRecord() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [attendanceList, setAttendanceList] = React.useState<Student[]>([]);
  const [loadingTable, setLoadingTable] = React.useState(true);

  const initialRender = React.useRef(true);

  React.useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get("https://comlab-backend.vercel.app/api/student/getTotalAttendance");
        setAttendanceList(response.data);
        setLoadingTable(false);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAttendance();
  }, []);

  const table = useReactTable({
    data: attendanceList,
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
  });

  const uniqueCourses = Array.from(new Set(attendanceList.map((attendanceList) => attendanceList.course_section)));
  const uniqueDates = Array.from(new Set(attendanceList.map((attendanceList) => attendanceList.date)));

  React.useEffect(() => {
    if (initialRender.current && uniqueDates.length > 0 && !table.getColumn("date")?.getFilterValue()) {
      table.getColumn("date")?.setFilterValue(uniqueDates[0]);
      initialRender.current = false;
    }
  }, [uniqueDates, table]);

  return (
    <>
      {loadingTable ? (
        <div className="w-full">
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min relative ">
            <div className="flex items-center py-4 font-geist justify-between">
              <div className="w-1/2 flex gap-2">
                <Skeleton className="w-[50%] h-10"/>
                <Skeleton className="w-[10%]"/>
                <Skeleton className="w-[10%]"/>
              </div>
              <div className="flex gap-2">
                <Skeleton className="w-20 h-10"/>
              </div>
            </div>
            <div className="rounded-md border font-geist">
              <Skeleton className="h-96 w-full"></Skeleton>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4 font-geist">
              <Skeleton className="h-10 w-20"></Skeleton>
              <div className="space-x-2 flex">
              <Skeleton className="w-20 h-8"/>
              <Skeleton className="w-20 h-8"/>
              </div>
            </div>
          </div>
        </div>
      ):(
        <div className="w-full">
          <div className="flex items-center py-4">
            <div className="flex justify-between">
              <Input
                placeholder="Filter by student id..."
                value={(table.getColumn("student_id")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("student_id")?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-2 border-dashed bg-transparent">
                    <PlusCircle className="mr-1" /> Course & Section
                    {table.getColumn("course_section")?.getFilterValue() ? (
                      <div className="flex gap-2">
                        <span className="font-thin text-gray-500">|</span>
                        <Badge variant={"secondary"}>
                          {String(table.getColumn("course_section")?.getFilterValue())}
                        </Badge>
                      </div>
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="font-geist w-40">
                  {uniqueCourses.map((course_section) => (
                    <DropdownMenuItem key={course_section} onClick={() => table.getColumn("course_section")?.setFilterValue(course_section)}>
                      {course_section}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => table.getColumn("course_section")?.setFilterValue(undefined)}>
                    <FilterX size={16} /> Clear Filter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-2 border-dashed bg-transparent">
                    <PlusCircle className="mr-1" /> Date
                    {table.getColumn("date")?.getFilterValue() ? (
                      <div className="flex gap-2">
                        <span className="font-thin text-gray-500">|</span>
                        <Badge variant={"secondary"}>
                          {String(table.getColumn("date")?.getFilterValue())}
                        </Badge>
                      </div>
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="font-geist w-40">
                  {uniqueDates.reverse().map((date) => (
                    <DropdownMenuItem key={date} onClick={() => table.getColumn("date")?.setFilterValue(date)}>
                      {date}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => table.getColumn("date")?.setFilterValue(undefined)}>
                    <FilterX size={16} /> Clear Filter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="text-xs">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="text-xs">
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
                      className="text-xs"
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
            <div className="flex-1 text-muted-foreground text-xs">
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
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}