import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox'; // Assuming you have a Checkbox component

interface AddTeacherProps {
  fetch: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const FormSchema = z.object({
  teacher_id: z.string().min(10, { message: 'ID must have at least 10 characters' }),
  lastname: z.string().min(1, { message: 'Last Name is required' }),
  firstname: z.string().min(1, { message: 'First Name is required' }),
  courses: z.array(z.string()).min(1, { message: 'At least one course is required' }), // Array of courses
  sections: z.array(z.string()).min(1, { message: 'At least one section is required' }), // Array of sections
});

type FormData = z.infer<typeof FormSchema>;

export const AddTeacher = ({ open, setOpen, fetch }: AddTeacherProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      courses: [],
      sections: [],
    },
  });

  const [userExists, setUserExists] = useState(false);
  const [loading, setLoading] = useState(false);

  // Generate all possible sections (1A, 1B, ..., 4J)
  const allSections = Array.from({ length: 4 }, (_, year) =>
    Array.from({ length: 10 }, (_, section) => `${year + 1}${String.fromCharCode(65 + section)}`)
  ).flat();

  const course = watch('courses');
  const section = watch('sections');

  // Handle course selection
  const handleCourseChange = (value: string) => {
    const updatedCourses = course.includes(value)
      ? course.filter((c) => c !== value) // Remove if already selected
      : [...course, value]; // Add if not selected
    setValue('courses', updatedCourses);
  };

  // Handle section selection
  const handleSectionChange = (value: string) => {
    const updatedSections = section.includes(value)
      ? section.filter((s) => s !== value) // Remove if already selected
      : [...section, value]; // Add if not selected
    setValue('sections', updatedSections);
  };

  const addNewTeacher = async (data: FormData) => {
    setLoading(true);
    const newTeacher = {
      teacher_id: data.teacher_id,
      lastname: data.lastname,
      firstname: data.firstname,
      courses: data.courses, // Array of courses
      sections: data.sections, // Array of sections (e.g., ["1A", "2B"])
    };

    try {
      const response = await axios.post('https://comlab-backend.vercel.app/api/teacher/addTeacher', newTeacher);
      console.log(response.data);

      setOpen(false);
      toast.success('User has been created.');
      setLoading(false);
      fetch();
      reset({
        teacher_id: '',
        lastname: '',
        firstname: '',
        courses: [],
        sections: [],
      });
    } catch (error: any) {
      console.error('Error adding teacher', error);
      if (error.response && error.response.status === 403) {
        setUserExists(true);
        toast.error('Teacher ID already exists');
        setLoading(false);
      } else {
        toast.error('Failed to add teacher');
        setOpen(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <Plus strokeWidth={3} /> Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] font-geist">
        <DialogHeader>
          <DialogTitle>Add Teacher</DialogTitle>
          <DialogDescription>Click submit when you're done.</DialogDescription>
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
                {...register('teacher_id')}
                placeholder="########"
              />
              {errors.teacher_id && (
                <span className="text-red-500 text-xs font-geist">{errors.teacher_id.message}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastname" className="text-right">
              Last Name
            </Label>
            <div className="col-span-3 relative">
              <Input
                id="lastname"
                className="col-span-3"
                type="text"
                {...register('lastname')}
                placeholder="Last Name"
              />
              {errors.lastname && (
                <span className="text-red-500 text-xs font-geist">{errors.lastname.message}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstname" className="text-right">
              First Name
            </Label>
            <div className="col-span-3 relative">
              <Input
                id="firstname"
                className="col-span-3"
                type="text"
                {...register('firstname')}
                placeholder="First Name"
              />
              {errors.firstname && (
                <span className="text-red-500 text-xs font-geist">{errors.firstname.message}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="course" className="text-right">
              Course
            </Label>
            <div className="col-span-3 font-geist text-[14px]">
              <div className="flex flex-wrap gap-2">
                {['BSIS', 'BSAIS', 'BSOM'].map((courseOption) => (
                  <div key={courseOption} className="flex items-center space-x-2">
                    <Checkbox
                      id={courseOption}
                      checked={course.includes(courseOption)}
                      onCheckedChange={() => handleCourseChange(courseOption)}
                    />
                    <Label htmlFor={courseOption}>{courseOption}</Label>
                  </div>
                ))}
              </div>
              {errors.courses && (
                <p className="text-red-500 text-xs">{errors.courses.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="section" className="text-right">
              Section
            </Label>
            <div className="col-span-3 font-geist text-[14px]">
              <div className="flex flex-wrap gap-2">
                {allSections.map((sec) => (
                  <div key={sec} className="flex items-center space-x-2">
                    <Checkbox
                      id={sec}
                      checked={section.includes(sec)}
                      onCheckedChange={() => handleSectionChange(sec)}
                    />
                    <Label htmlFor={sec}>{sec}</Label>
                  </div>
                ))}
              </div>
              {errors.sections && (
                <p className="text-red-500 text-xs">{errors.sections.message}</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="flex items-center">
          {userExists && (
            <span className="text-red-500 text-xs font-geist">
              Teacher already exists. Please choose a different account ID.
            </span>
          )}
          <Button onClick={handleSubmit(addNewTeacher)}>
            {loading ? (
              <>
                Submitting
                <Loader2 className="animate-spin" />
              </>
            ) : (
              <>Submit</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};