'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { GraduationCap, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function MyCoursesPage() {
  const { data: session } = useSession();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const res = await fetch('/api/enrollments');
        if (res.ok) {
          const data = await res.json();
          setEnrollments(data);
        } else {
          toast.error('Failed to load courses');
        }
      } catch (error) {
        toast.error('Error loading data');
      } finally {
        setLoading(false);
      }
    }
    if (session) {
      fetchEnrollments();
    }
  }, [session]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'default';
      case 'Pending': return 'secondary';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight">My Courses</h1>
        <p className="text-sm text-muted-foreground">{enrollments.length} enrollments found</p>
      </div>

      {enrollments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-60 text-center space-y-4">
            <GraduationCap className="h-12 w-12 text-muted-foreground opacity-20" />
            <div>
                <p className="text-lg font-bold">No courses found</p>
                <p className="text-sm text-muted-foreground">You haven't enrolled in any courses yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((enrollment) => (
            <Card key={enrollment._id} className="overflow-hidden border-none shadow-sm bg-muted/30">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex justify-between items-start">
                   <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                   </div>
                   <Badge variant={getStatusColor(enrollment.status) as any}>
                     {enrollment.status === 'Paid' ? 'Approved' : enrollment.status}
                   </Badge>
                </div>
                <CardTitle className="text-lg mt-4 line-clamp-1">
                  {enrollment.courseId?.title || 'Unknown Course'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Enrolled Name</p>
                    <p className="font-medium">{enrollment.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Date</p>
                    <p className="font-medium">{new Date(enrollment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {enrollment.status === 'Pending' && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-500/10 text-yellow-600 rounded-lg text-xs">
                    <AlertCircle className="h-4 w-4" />
                    <span>Your payment is being verified. It will be approved shortly.</span>
                  </div>
                )}
                
                {enrollment.status === 'Paid' && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg text-xs">
                    <AlertCircle className="h-4 w-4" />
                    <span>Payment verified! You are officially enrolled.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
