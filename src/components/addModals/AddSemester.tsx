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
import { useState, useEffect } from "react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import axios from 'axios'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface AddSemesterProps {
  fetch: () => void
  open: boolean
  setOpen: (open: boolean) => void
}

const FormSchema = z.object({
  semester_type: z.enum(["1st", "2nd", "Summer Class"]),
  school_year: z.string().min(1, { message: "School year is required" }),
  start: z.string().nullable(),
  end: z.string().nullable(),
  status: z.enum(["Upcoming", "Ongoing", "Finished"]),
});

type FormData = z.infer<typeof FormSchema>

export const AddSemester = ({ open, setOpen, fetch }: AddSemesterProps) => {
  const { 
    handleSubmit, 
    formState: { errors }, 
    watch, 
    setValue,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      semester_type: "1st",
      status: "Upcoming",
      school_year: "",
      start: "",
      end: ""
    }
  })

  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear())
  const [endYear, setEndYear] = useState<number>(new Date().getFullYear() + 1)
  
  const semester_type = watch("semester_type")
  const status = watch("status")

  const [dateExists, setDateExists] = useState(false)

  // Generate years from current year to 2099
  const years = Array.from({ length: 2099 - new Date().getFullYear() + 1 }, (_, i) => new Date().getFullYear() + i)

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}-${day}-${year}`
  }

  // Update school year when start or end year changes
  useEffect(() => {
    setValue("school_year", `${startYear}-${endYear}`, { shouldValidate: true })
  }, [startYear, endYear, setValue])

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date)
    if (date) {
      setValue("start", formatDate(date), { shouldValidate: true })
      // If end date is before the new start date, reset end date
      if (endDate && date > endDate) {
        setEndDate(null)
        setValue("end", "", { shouldValidate: true })
      }
    } else {
      setValue("start", "", { shouldValidate: true })
    }
  }

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date)
    if (date) {
      setValue("end", formatDate(date), { shouldValidate: true })
    } else {
      setValue("end", "", { shouldValidate: true })
    }
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

  const addNewSemester = async (data: FormData) => {
    setLoading(true)
    try {
      await axios.post('https://comlab-backend.vercel.app/api/acads/addSemester', data)
      toast.success("Semester added successfully")
      reset()
      setStartDate(null)
      setEndDate(null)
      fetch()
      setOpen(false)
      window.location.reload()
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        setDateExists(true);
        toast.error("Date is already occupied");
        setLoading(false);
      } 
      else {
        toast.error("Failed to add data");
        setOpen(false);
        setLoading(false);
      }
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <Plus strokeWidth={3} className="mr-2 h-4 w-4" />
          Add Semester
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] font-geist">
        <DialogHeader>
          <DialogTitle>Add Semester</DialogTitle>
          <DialogDescription>
            Fill in the details for the new semester.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(addNewSemester)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Semester Type
            </Label>
            <Select 
              value={semester_type}
              onValueChange={(value: "1st" | "2nd" | "Summer Class") => setValue("semester_type", value)}
            >
              <SelectTrigger className="w-[180px] font-geist">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className='font-geist'>
                <SelectItem value="1st">1st</SelectItem>
                <SelectItem value="2nd">2nd</SelectItem>
                <SelectItem value="Summer Class">Summer Class</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="school_year" className="text-right">
              School Year
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Select value={startYear.toString()} onValueChange={handleStartYearChange} disabled>
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
                selected={startDate}
                onChange={handleStartDateChange}
                dateFormat="MM-dd-yyyy"
                placeholderText="MM-DD-YYYY"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                selectsStart
                startDate={startDate}
                endDate={endDate}
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
                selected={endDate}
                onChange={handleEndDateChange}
                dateFormat="MM-dd-yyyy"
                placeholderText="MM-DD-YYYY"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate || new Date()} // Can't select date before start date or current date
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
              value={status}
              onValueChange={(value: "Upcoming" | "Ongoing" | "Finished") => setValue("status", value)}
              disabled
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
            {dateExists && <span className="text-red-500 text-xs font-geist">Date is already occupied.</span>}
            <Button type="submit" disabled={loading}> 
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                "Submit"
              )} 
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}