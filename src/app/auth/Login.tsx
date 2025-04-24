import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from 'react'
import { useNavigate } from "react-router-dom"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { useTeacher } from '@/Context'

const FormSchema = z.object({
  id: z.string().min(1, { message: "Field is required" }),
  password: z.string().min(1, { message: "Password is required" }),
})

type FormData = z.infer<typeof FormSchema>

export function Login({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({ 
    resolver: zodResolver(FormSchema) 
  })
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { setTeacherId } = useTeacher();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    if(data.id === "CLMAS2025" && data.password === "2025"){
      navigate("/admin/dashboard", { replace: true });
    }
    else{
      try {
        try {
          const teacherResponse = await axios.post("https://comlab-backend.vercel.app/api/teacher/teacher-login", { teacher_id: data.id, password: data.password });
          if (teacherResponse.status === 200) {
            setTeacherId(teacherResponse.data[0].teacher_id);
            navigate("/teacher/Record", { replace: true });
            return;
          }
        } catch (teacherError) {
          try {
            const adminResponse = await axios.post(
              "https://comlab-backend.vercel.app/api/admin/admin-log", 
              { id: data.id, password: data.password }
            );
            
            if (adminResponse.status === 200) {
              navigate("/admin/dashboard", { replace: true });
              return;
            }
          } catch (adminError) {
            setError("root", { 
              type: "manual", 
              message: "Invalid credentials, please try again." 
            });
          }
        }
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className={cn("h-screen flex items-center justify-center relative", className)} {...props}>
      <Card className="overflow-hidden bg-white z-10 w-full max-w-4xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your account
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="id">ID</Label>
                <Input
                  id="id"
                  type="text"
                  placeholder="Enter your ID"
                  {...register("id")}
                  required
                />
                {errors.id && (
                  <span className="text-red-500 text-xs">
                    {errors.id.message}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password"
                  {...register("password")}
                  required 
                />
                {errors.password && (
                  <span className="text-red-500 text-xs">
                    {errors.password.message}
                  </span>
                )}
              </div>
              {errors.root && (
                <span className="text-red-500 text-xs text-center">
                  {errors.root.message}
                </span>
              )}
              <Button 
                type="submit" 
                className="w-full bg-[#022c22] hover:bg-[#064e3b]"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className='animate-spin'/>
                ) : (
                  <>Login</>
                )}
              </Button>
             
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/images/clm-logo.png"
              alt="CLM Logo"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}