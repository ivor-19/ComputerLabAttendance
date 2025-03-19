"use client"

import * as React from "react"
import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { ArrowUpDown, FilterX, MoreHorizontal, PencilIcon, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "../ui/badge"
import { AddStudent } from "../AddStudent"
import DeleteModal from "../DeleteModal"

const data: Student[] = [
  { id: "m5gr84i9", lastName: "Cruz", firstName: "Deniel", course: "BSOM", section: "4D" },
  { id: "m6gr84i1", lastName: "Reyes", firstName: "Juan", course: "BSIS", section: "4D" },
  { id: "m7gr84i2", lastName: "Alvarez", firstName: "Maria", course: "BSAIS", section: "3D" },
  { id: "m8gr84i3", lastName: "Gutierrez", firstName: "Carlos", course: "BSBA", section: "1A" },
  { id: "m9gr84i4", lastName: "Torres", firstName: "Lucia", course: "BSIS", section: "1A" },
  { id: "m10gr84i5", lastName: "Mendoza", firstName: "Elena", course: "BSOM", section: "2C" },
  { id: "m11gr84i6", lastName: "Fernandez", firstName: "Raul", course: "BSAIS", section: "4A" },
  { id: "m12gr84i7", lastName: "Diaz", firstName: "Andres", course: "BSBA", section: "3B" },
  { id: "m13gr84i8", lastName: "Garcia", firstName: "Isabella", course: "BSIS", section: "2C" },
  { id: "m14gr84i9", lastName: "Martinez", firstName: "Pedro", course: "BSAIS", section: "1B" },
  { id: "m15gr85i0", lastName: "Sanchez", firstName: "Beatriz", course: "BSOM", section: "4D" },
  { id: "m16gr85i1", lastName: "Lopez", firstName: "Luis", course: "BSBA", section: "3C" },
  { id: "m17gr85i2", lastName: "Ramirez", firstName: "Ana", course: "BSAIS", section: "2B" },
  { id: "m18gr85i3", lastName: "Perez", firstName: "Francisco", course: "BSIS", section: "1A" },
  { id: "m19gr85i4", lastName: "Santos", firstName: "Gabriel", course: "BSBA", section: "4A" },
  { id: "m20gr85i5", lastName: "Gonzalez", firstName: "Julia", course: "BSOM", section: "1A" },
  { id: "m21gr85i6", lastName: "Hernandez", firstName: "Julian", course: "BSIS", section: "2A" },
  { id: "m22gr85i7", lastName: "Castro", firstName: "Raquel", course: "BSAIS", section: "3A" },
  { id: "m23gr85i8", lastName: "Vasquez", firstName: "Victor", course: "BSOM", section: "2B" },
  { id: "m24gr85i9", lastName: "Jimenez", firstName: "Nina", course: "BSBA", section: "4D" },
];


export type Student = {
  id: string,
  lastName: string,
  firstName: string,
  course: string,
  section: string,
}

export const columns: ColumnDef<Student>[] = [
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
      <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    cell: ({ row }) => <div>{row.getValue("lastName")}</div>,
  },
  {
    accessorKey: "firstName",
    header: "First Name",
    cell: ({ row }) => <div>{row.getValue("firstName")}</div>,
  },
  {
    accessorKey: "course",
    header: "Course",
    cell: ({ row }) => <div>{row.getValue("course")}</div>,
  },
  {
    accessorKey: "section",
    header: "Section",
    cell: ({ row }) => <div>{row.getValue("section")}</div>,
  },
]

export function CoursesAndSectionTable() {
  const [open, setOpen] = React.useState(false)
  const [openDelete, setOpenDelete] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
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
  })

  // Generate unique values for course and section
  const uniqueCourses = Array.from(new Set(data.map(student => student.course)))
  const uniqueSections = Array.from(new Set(data.map(student => student.section)))

  const deleteUser = () => {
    setLoading(true)
    setTimeout(() => {
      setOpenDelete(false)
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex justify-between">
          <Input
            placeholder="Filter by name..."
            value={(table.getColumn("lastName")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("lastName")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
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
          </DropdownMenu>
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
          <AddStudent open={open} setOpen={setOpen} />
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
                <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
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
    </div>
  )
}
