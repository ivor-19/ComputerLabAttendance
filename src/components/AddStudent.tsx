import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CSSProperties, useEffect, useState } from "react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import axios from 'axios'
import { toast } from 'sonner'
import { CirclePlus, Loader2, Plus } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'

interface AddStudentProps {
  open: boolean;
  setOpen: (open: boolean) => void; // Corrected type for setOpen
}

const FormSchema = z.object({
  id: z.string().min(10, {message: "ID must have atleast 10 characters"}),
  lastName: z.string().min(1, {message: "Last Name is required"}),
  firstName: z.string().min(1, {message: "First Name is required"}),
  course: z.enum([""], {message: "Invalid status"}),
  section: z.enum([""], {message: "Invalid status"})
})

type FormData = z.infer<typeof FormSchema>;

export const AddStudent = ({open, setOpen} : AddStudentProps) => {
  const { register, handleSubmit, formState: {errors}, reset, setError } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })
  const [openAddDialog, setOpenAddDialog] = React.useState(false);
  const [userExists, setUserExists] = useState(false);
  const [loading, setLoading] = useState(false);

  const addUser = async (data: FormData) => {
    setLoading(true);
    setUserExists(false);
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}><Plus strokeWidth={3}/>Add</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] font-geist">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
          Click submit when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              ID
            </Label>
            <div className="col-span-3 relative">
              <Input 
                id="id" 
                className="col-span-3" 
                type="text"
                {...register("id")}
                placeholder="MA-########"
              />
              {errors.id && <span className="text-red-500 text-xs font-geist">{errors.id.message}</span>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              Last Name
            </Label>
            <div className="col-span-3 relative">
              <Input 
                id="lastName" 
                className="col-span-3" 
                type="text"
                {...register("lastName")}
                placeholder="Last Name"
              />
              {errors.lastName && <span className="text-red-500 text-xs font-geist">{errors.lastName.message}</span>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              First Name
            </Label>
            <div className="col-span-3 relative">
              <Input 
                id="firstName" 
                className="col-span-3" 
                type="text"
                {...register("firstName")}
                placeholder="First Name"
              />
              {errors.firstName && <span className="text-red-500 text-xs font-geist">{errors.firstName.message}</span>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="course" className="text-right">
              Course
            </Label>
            <div className="col-span-3 font-geist text-[14px]">
              <select 
                id="course"
                {...register("course")}
                className="w-[180px] p-2 border rounded-md font-geist"
              >
                <option value="" disabled>Select course</option>
                <option value="">Course 1</option>
                <option value="">Course 2</option>
              </select>
              {errors.course && <p className="text-red-500 text-xs">{errors.course.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="section" className="text-right">
              Section
            </Label>
            <div className="col-span-3 font-geist text-[14px]">
              <select 
                id="section"
                {...register("section")}
                className="w-[180px] p-2 border rounded-md font-geist"
              >
                <option value="" disabled>Select section</option>
                <option value="">Section 1</option>
                <option value="">Section 2</option>
              </select>
              {errors.section && <p className="text-red-500 text-xs">{errors.section.message}</p>}
            </div>
          </div>
        </div>
        <DialogFooter className="flex items-center">
          {userExists && <span className="text-red-500 text-xs font-geist">Student already exists. Please choose a different account ID.</span>}
          <Button onClick={handleSubmit(addUser)}> 
            {loading ? ( 
              <>
                Submitting
                <Loader2 className="animate-spin"/>
              </>
            ):(
              <>
                Submit
              </>
            )} 
          </Button>
        </DialogFooter>
      </DialogContent>
  </Dialog>
  )
}
