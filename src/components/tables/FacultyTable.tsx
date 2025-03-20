import * as React from "react";
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
} from "@tanstack/react-table";
import { ArrowUpDown, FilterX, MoreHorizontal, PlusCircle, QrCode, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "../ui/badge";
import { AddStudent } from "../AddStudent";
import DeleteModal from "../DeleteModal";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { QRCodeSVG } from 'qrcode.react';
import { AddTeacher } from "../AddTeacher";

export type Teacher = {
  teacher_id: string;
  lastname: string;
  firstname: string;
  course: Array<string>;
  section: Array<string>;
};

export const columns = (setOpenQRModal: (open: boolean) => void, setId: (id: string) => void): ColumnDef<Teacher>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
    accessorKey: "teacher_id",
    header: "ID",
    cell: ({ row }) => <div className="capitalize">{row.getValue("teacher_id")}</div>,
  },
  {
    accessorKey: "lastname",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Last Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => <div>{row.getValue("lastname")}</div>,
  },
  {
    accessorKey: "firstname",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            First Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => <div>{row.getValue("firstname")}</div>,
  },
  {
    accessorKey: "courses",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Courses
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const courses = row.getValue("courses") as string[]; // Explicitly type as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {courses.map((course, index) => (
            <Badge key={index} variant="secondary">
              {course}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "sections",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Sections
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const sections = row.getValue("sections") as string[]; // Explicitly type as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {sections.map((section, index) => (
            <Badge key={index} variant="secondary">
              {section}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const teacher = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(teacher.teacher_id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              setId(row.original.teacher_id);
              setOpenQRModal(true);
            }}>
              <QrCode className="mr-2 h-4 w-4" />
              View QR Code
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SquarePen className="mr-2 h-4 w-4" />
              Edit User Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function FacultyTable() {
  const [open, setOpen] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [openQRModal, setOpenQRModal] = React.useState(false);
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [id, setId] = React.useState<string>('')

  const fetchTeachers = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/teacher/getTeachers");
      setTeachers(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const deleteUser = async () => {
    setLoading(true);
    try {
      const selectedRows = table.getSelectedRowModel().rows;
      for (const row of selectedRows) {
        const teacher_id = row.original.teacher_id; // Access the user's _id
        // await axios.delete(`https://comlab-backend.vercel.app/api/student/deleteStudent/${studentId}`);
        console.log(`Deleted user with ID: ${teacher_id}`);
      }
      toast.info(`${selectedRows.length} User/s has been deleted.`);

      fetchTeachers();
      setRowSelection({});
      setLoading(false);
      setOpenDelete(false);
    } catch (error) {
      console.error("Error deleting a user", error);
      setOpenDelete(false);
      toast.error("Unknown error has occured");
    }
  };

  React.useEffect(() => {
    fetchTeachers();
  }, []);

  const table = useReactTable({
    data: teachers,
    columns: columns(setOpenQRModal, setId),
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

  // Generate unique values for course and section
  const uniqueCourses = Array.from(new Set(teachers.map((teacher) => teacher.course)));
  const uniqueSections = Array.from(new Set(teachers.map((teacher) => teacher.section)));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex justify-between">
          <Input
            placeholder="Filter by name..."
            value={(table.getColumn("lastname")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("lastname")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-2 border-dashed bg-transparent">
                <PlusCircle className="mr-1" /> Course
                {table.getColumn("course")?.getFilterValue() ? (
                  <div className="flex gap-2">
                    <span className="font-thin text-gray-500">|</span>
                    <Badge variant={"secondary"}>
                      {String(table.getColumn("course")?.getFilterValue())}
                    </Badge>
                  </div>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-geist w-40">
              {uniqueCourses.map((course) => (
                <DropdownMenuItem key={course} onClick={() => table.getColumn("course")?.setFilterValue(course)}>
                  {course}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => table.getColumn("course")?.setFilterValue(undefined)}>
                <FilterX size={16} /> Clear Filter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-2 border-dashed bg-transparent">
                <PlusCircle className="mr-1" /> Section
                {table.getColumn("section")?.getFilterValue() ? (
                  <div className="flex gap-2">
                    <span className="font-thin text-gray-500">|</span>
                    <Badge variant={"secondary"}>
                      {String(table.getColumn("section")?.getFilterValue())}
                    </Badge>
                  </div>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-geist w-40">
              {uniqueSections.map((section) => (
                <DropdownMenuItem key={section} onClick={() => table.getColumn("section")?.setFilterValue(section)}>
                  {section}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => table.getColumn("section")?.setFilterValue(undefined)}>
                <FilterX size={16} /> Clear Filter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
        <div className="flex gap-2">
          {Object.keys(rowSelection).length !== 0 && (
            <DeleteModal
              title={`Delete (${Object.keys(rowSelection).length})`}
              description={`Are you sure you want to delete ${Object.keys(rowSelection).length} student(s)?`}
              open={openDelete}
              setOpen={setOpenDelete}
              onClick={deleteUser}
              loading={loading}
            />
          )}
          <AddTeacher open={open} setOpen={setOpen} fetch={fetchTeachers} />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
      <Dialog open={openQRModal} onOpenChange={setOpenQRModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
            <DialogDescription>
              This is the QR code for the selected student.
            </DialogDescription>
            <div className="w-full flex items-center justify-center">
              <div className="w-fit">
                <QRCodeSVG value={id.toString()} size={300} />
              </div>
            </div>
          </DialogHeader>
          {/* Add QR Code rendering logic here */}
        </DialogContent>
      </Dialog>
    </div>
  );
}