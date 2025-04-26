import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ComLab {
  _id: string;
  name: string;
  room: string;
}

export default function CLTAttendance({ initialData }: { initialData?: ComLab[] }) {
  const navigate = useNavigate();
  const [comLabs, setComLabs] = useState<ComLab[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialData) {
      fetchComLabs();
    }
  }, [initialData]);

  const fetchComLabs = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://comlab-backend.vercel.app/api/computer/getList");
      const data = await response.json();

      if (data.isSuccess && data.com) {
        setComLabs(data.com);
      } else {
        setError("Failed to load computer labs");
      }
    } catch (err) {
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (lab: ComLab) => {
    navigate(`/teacher/schedule/${encodeURIComponent(lab.name)}`, {
      state: {
        id: lab._id,
        room: lab.room
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-pulse text-center">
          <p>Loading computer labs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        <p>{error}</p>
        <Button onClick={fetchComLabs} variant="outline" className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-semibold text-3xl">Set Schedules for...</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {comLabs.map((lab) => (
          <Card 
            key={lab._id} 
            className="h-full cursor-pointer hover:border-primary hover:shadow-md transition-all"
            onClick={() => handleCardClick(lab)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                {lab.name}
              </CardTitle>
              <CardDescription>Room {lab.room}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Click to view details and availability</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full">
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}