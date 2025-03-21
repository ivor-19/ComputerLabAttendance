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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

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
import DeleteModal from "../DeleteModal"
import { AddCom } from "../AddCom"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Skeleton } from "../ui/skeleton"

export type ComLabList = {
  _id: string,
  name: string,
  room: string,
}

export function ComputerManagementTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<ComLabList>[] = [
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
      accessorKey: "_id",
      header: "ID",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("_id")}</div>
      ),
    },
    {
       accessorKey: "name",
       header: ({ column }) => {
         return (
           <div className="text-left">
             <Button
               variant="ghost"
               onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
               className="text-xs pl-0 bg-transparent"
             >
               Name
               <ArrowUpDown />
             </Button>
           </div>
         )
       },
       cell: ({ row }) => <div>{row.getValue("name")}</div>,
     },
     {
        accessorKey: "room",
        header: ({ column }) => {
          return (
            <div className="text-left">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="text-xs pl-0 bg-transparent"
              >
                Room
                <ArrowUpDown />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => <div>{row.getValue("room")}</div>,
      },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original
  
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
              {/* <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                Copy payment ID
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleRowClick(row.original)}>View & Edit Details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [list, setList] = React.useState<ComLabList[]>([])
  const [loadingTable, setLoadingTable] = React.useState(true);

  const fetchList = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/computer/getList");
      setList(response.data.com);
      console.log(response.data.com);
      setLoadingTable(false);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  React.useEffect(() => {
    fetchList();
  }, [])

  const deleteCom = () => {
    setOpenDelete(true);
  }

  const handleRowClick = (row: ComLabList): void => {
    navigate(`/admin/computermanagement/${encodeURIComponent(row.name)}`, {
      state: { 
        name: row.name,
        room: row.room,
        id: row._id
      }
    });
  };

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
  })

  return (
    <>
      {loadingTable ? (
        <div className="w-full">
         <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min relative ">
           <div className="flex items-center py-4 font-geist justify-between">
             <div className="w-1/2 flex gap-2">
               <Skeleton className="w-[30%] h-10"/>
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
          <div className="flex items-center justify-between py-4">
            <div>
              <Input
                placeholder="Search by name"
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            </div>
            <div>
              <div className="flex gap-2">
                {Object.keys(rowSelection).length !== 0 && (
                  <DeleteModal
                    title={`Delete (${Object.keys(rowSelection).length})`}
                    description={`Are you sure you want to delete ${Object.keys(rowSelection).length} data(s)?`}
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
                      // onClick={() => handleRowClick(row.getValue("name"))}
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
        </div>
      )}
    </>
  )
}
