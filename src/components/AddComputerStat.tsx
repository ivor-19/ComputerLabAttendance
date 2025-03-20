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

interface AddComputerStatProps {
  fetch: () => void;
  open: boolean;
  setOpen: (open: boolean) => void; // Corrected type for setOpen
  id: string;
}

const FormSchema = z.object({
  pc_id: z.string().min(1, {message: "PC ID is required"}),
  name: z.string().min(1, {message: "Name is required"}),
  condition: z.string().optional(),
  status: z.string().optional(),
})

type FormData = z.infer<typeof FormSchema>;

export const AddComputerStat = ({open, setOpen, fetch, id} : AddComputerStatProps) => {
  const { register, handleSubmit, formState: {errors}, reset, setError, watch } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })
  const [userExists, setUserExists] = useState(false);
  const [loading, setLoading] = useState(false);


  const addNewComputerSet = async (data: FormData) => {
    setLoading(true);
    const newComputerSet = {pc_id: data.pc_id, comlabid: id, name: data.name, condition: data.condition, status: data.status}
    try {
      const response = await axios.post("https://comlab-backend.vercel.app/api/computerStat/addComputerSet", newComputerSet);
      console.log(response.data.com)
      setOpen(false);
      toast.success("New Data has been created.")
      setLoading(false);
      fetch();
    } catch (error) {
      console.error("Error adding computer set", error)
      setOpen(false);
    }
    
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}><Plus strokeWidth={3}/>Add Computer Set</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] font-geist">
        <DialogHeader>
          <DialogTitle>Add</DialogTitle>
          <DialogDescription>
          Click submit when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pc_id" className="text-right">
              PC ID
            </Label>
            <div className="col-span-3 relative">
              <Input 
                id="pc_id" 
                className="col-span-3" 
                type="text"
                {...register("pc_id")}
                placeholder="PC ID"
              />
              {errors.pc_id && <span className="text-red-500 text-xs font-geist">{errors.pc_id.message}</span>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <div className="col-span-3 relative">
              <Input 
                id="name" 
                className="col-span-3" 
                type="text"
                {...register("name")}
                placeholder="Name"
              />
              {errors.name && <span className="text-red-500 text-xs font-geist">{errors.name.message}</span>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="condition" className="text-right">
              Condition
            </Label>
            <div className="col-span-3 font-geist text-[14px]">
              <select 
                id="condition"
                {...register("condition")}
                className="w-[180px] p-2 border rounded-md font-geist"
              >
                <option value="" disabled>Good</option>
                <option value="Good">Good</option>
                <option value="Bad">Bad</option>
              </select>
              {errors.condition && <p className="text-red-500 text-xs">{errors.condition.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <div className="col-span-3 font-geist text-[14px]">
              <select 
                id="status"
                {...register("status")}
                className="w-[180px] p-2 border rounded-md font-geist"
              >
                <option value="" disabled>Active</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {errors.status && <p className="text-red-500 text-xs">{errors.status.message}</p>}
            </div>
          </div>
        </div>
        <DialogFooter className="flex items-center">
          {userExists && <span className="text-red-500 text-xs font-geist">Already Exists.</span>}
          <Button onClick={handleSubmit(addNewComputerSet)}> 
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
