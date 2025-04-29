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

interface Semester {
  _id: string
  semester_type: string
  school_year: string
  start: string
  end: string
  status: string
  __v: number
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
  const [dateExists, setDateExists] = useState(false)
  const [semesterExists, setSemesterExists] = useState(false)
  const [semesters, setSemesters] = useState<Semester[]>([])
  
  const semester_type = watch("semester_type")
  const status = watch("status")

  // Fetch existing semesters when component mounts
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await axios.get('https://comlab-backend.vercel.app/api/acads/getSemester')
        setSemesters(response.data)
      } catch (error) {
        console.error("Failed to fetch semesters:", error)
      }
    }
    fetchSemesters()
  }, [])

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}-${day}-${year}`
  }

  // Function to parse date string to Date object
  const parseDate = (dateStr: string): Date => {
    const [month, day, year] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  // Function to check if a date is within any semester's range
  const isDateDisabled = (date: Date): boolean => {
    return semesters.some(semester => {
      const semesterStart = parseDate(semester.start)
      const semesterEnd = parseDate(semester.end)
      return date >= semesterStart && date <= semesterEnd
    })
  }

  // Function to check if date range overlaps with any existing semester
  const isRangeOverlapping = (start: Date, end: Date): boolean => {
    return semesters.some(semester => {
      const semesterStart = parseDate(semester.start)
      const semesterEnd = parseDate(semester.end)
      return (
        (start >= semesterStart && start <= semesterEnd) || // start is within existing semester
        (end >= semesterStart && end <= semesterEnd) ||     // end is within existing semester
        (start <= semesterStart && end >= semesterEnd)      // new semester spans entire existing semester
      )
    })
  }

  // Update school year when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const startYear = startDate.getFullYear()
      const endYear = endDate.getFullYear()
      
      // School year is typically startYear-endYear if the semester spans academic year
      // Or startYear-startYear if within same year
      const schoolYear = endYear > startYear ? `${startYear}-${endYear}` : `${startYear}-${startYear + 1}`
      
      setValue("school_year", schoolYear, { shouldValidate: true })
    }
  }, [startDate, endDate, setValue])

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

  const addNewSemester = async (data: FormData) => {
    if (!startDate || !endDate) return
    
    // Check if the selected range overlaps with any existing semester
    if (isRangeOverlapping(startDate, endDate)) {
      setDateExists(true)
      toast.error("Selected date range conflicts with existing semester(s)")
      return
    }
    
    setDateExists(false)
    setSemesterExists(false)
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
        setDateExists(true)
        toast.error("Date conflict with existing semester(s)")
      } 
      else if (error.response && error.response.status === 405) {
        setSemesterExists(true)
        toast.error("Semester already exists on the same school year.")
      } 
      else {
        toast.error("Failed to add data")
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
            <div className="col-span-3">
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={watch("school_year")}
                disabled
              />
              {errors.school_year && (
                <span className="text-sm text-red-500">
                  {errors.school_year.message}
                </span>
              )}
            </div>
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
                filterDate={(date) => !isDateDisabled(date)} // Disable dates within existing semesters
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
                filterDate={(date) => !isDateDisabled(date)} // Disable dates within existing semesters
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
            {dateExists && <span className="text-red-500 text-xs font-geist">Date conflict with existing semester/s.</span>}
            {semesterExists && <span className="text-red-500 text-xs font-geist">Semester already exists on the same school year.</span>}
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