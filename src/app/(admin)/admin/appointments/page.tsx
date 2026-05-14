'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Search, Calendar, Phone, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format, isValid } from 'date-fns';
import { Button } from '@/components/ui/button';

interface Appointment {
  _id: string;
  serviceId: { name: string } | null;
  name: string;
  phone: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
}

function AppointmentsContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/appointments');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        toast.success(`Appointment ${status}`);
        fetchAppointments();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || `Update failed: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Update failed:', error);
      toast.error('Update failed. Please try again.');
    }
  };

  const filtered = appointments.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.phone.includes(search)
  );

  return (
    <div className="flex flex-col gap-6 pt-8 px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Appointments</h1>
          <p className="text-muted-foreground text-sm">Review and manage patient bookings</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search name or phone..."
          className="pl-10 rounded-xl bg-background border-muted"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Patient</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Service</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Date & Time</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Status</TableHead>
              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                  No appointments found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((appt) => (
                <TableRow key={appt._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold flex items-center gap-1.5"><User className="h-3 w-3 text-primary" /> {appt.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="h-3 w-3" /> {appt.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-md border-primary/20 text-primary bg-primary/5">
                      {appt.serviceId?.name || 'Service Deleted'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Calendar className="h-3 w-3" /> 
                        {isValid(new Date(appt.date)) ? format(new Date(appt.date), 'PPP') : 'Invalid Date'}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3 w-3" /> {appt.time}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`rounded-md ${
                      appt.status === 'Confirmed' ? 'bg-emerald-500' : 
                      appt.status === 'Cancelled' ? 'bg-destructive' : 'bg-amber-500'
                    }`}>
                      {appt.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {appt.status === 'Pending' && (
                        <>
                          <Button variant="ghost" size="icon" className="text-emerald-500" onClick={() => updateStatus(appt._id, 'Confirmed')}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => updateStatus(appt._id, 'Cancelled')}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <AppointmentsContent />
    </Suspense>
  );
}
