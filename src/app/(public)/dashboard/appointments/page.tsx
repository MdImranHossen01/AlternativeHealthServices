'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Calendar, Loader2, Clock, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function MyAppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await fetch('/api/appointments');
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        } else {
          toast.error('Failed to load appointments');
        }
      } catch (error) {
        toast.error('Error loading data');
      } finally {
        setLoading(false);
      }
    }
    if (session) {
      fetchAppointments();
    }
  }, [session]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'default';
      case 'Pending': return 'secondary';
      case 'Completed': return 'outline';
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
        <h1 className="text-3xl font-black tracking-tight">Appointments</h1>
        <p className="text-sm text-muted-foreground">{appointments.length} requests found</p>
      </div>

      {appointments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-60 text-center space-y-4">
            <Calendar className="h-12 w-12 text-muted-foreground opacity-20" />
            <div>
                <p className="text-lg font-bold">No appointments found</p>
                <p className="text-sm text-muted-foreground">You haven't requested any appointments yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((appointment) => (
            <Card key={appointment._id} className="overflow-hidden border-none shadow-sm bg-muted/30">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex justify-between items-start">
                   <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                   </div>
                   <Badge variant={getStatusColor(appointment.status) as any}>
                     {appointment.status === 'Confirmed' ? 'Approved' : appointment.status}
                   </Badge>
                </div>
                <CardTitle className="text-lg mt-4 line-clamp-1">
                  {appointment.serviceId?.name || 'Unknown Service'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Time</p>
                        <p className="font-medium">{appointment.time}</p>
                    </div>
                  </div>
                  <div className="space-y-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Date</p>
                        <p className="font-medium">{new Date(appointment.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                {appointment.status === 'Pending' && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-500/10 text-yellow-600 rounded-lg text-xs">
                    <AlertCircle className="h-4 w-4" />
                    <span>Your request is pending. Our team will contact you soon for confirmation.</span>
                  </div>
                )}
                
                {appointment.status === 'Confirmed' && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg text-xs">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Appointment approved! We look forward to seeing you.</span>
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
