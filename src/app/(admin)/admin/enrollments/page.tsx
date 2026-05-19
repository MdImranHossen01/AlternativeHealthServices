'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Search, GraduationCap, Phone, User, CheckCircle, XCircle, Wallet, Calendar, Clock, MoreHorizontal, Trash2, Mail, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format, isValid } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Enrollment {
  _id: string;
  courseId: { name: string, price: number } | null;
  name: string;
  phone: string;
  paymentNumber?: string;
  email?: string;
  address?: string;
  status: string;
  createdAt: string;
}

function EnrollmentsContent() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const fetchEnrollments = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      setLoading(true);
      const response = await fetch('/api/enrollments', { signal: controller.signal });
      if (!response.ok) throw new Error(`Failed to fetch (${response.status} ${response.statusText})`);
      const data = await response.json();
      setEnrollments(data);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error('Fetch timed out. Please refresh.');
      } else {
        toast.error(`Failed to load enrollments: ${error.message}`);
      }
      console.error('Error fetching enrollments:', error);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    if (isUpdating.has(id)) return;

    setIsUpdating(prev => new Set(prev).add(id));
    try {
      const response = await fetch(`/api/enrollments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success(`Enrollment ${status}`);
        fetchEnrollments();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Update failed' }));
        toast.error(errorData.message || `Update failed: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(`Update failed: ${error.message}`);
    } finally {
      setIsUpdating(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const deleteEnrollment = async (id: string) => {
    if (isUpdating.has(id)) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to permanently delete this course enrollment?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, delete it!',
    });

    if (!result.isConfirmed) return;

    setIsUpdating(prev => new Set(prev).add(id));
    try {
      const response = await fetch(`/api/enrollments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`Enrollment deleted successfully`);
        fetchEnrollments();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Delete failed' }));
        toast.error(errorData.message || `Delete failed`);
      }
    } catch (error: any) {
      console.error('Error deleting enrollment:', error);
      toast.error(`Delete failed: ${error.message}`);
    } finally {
      setIsUpdating(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const filtered = enrollments.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.phone.includes(search) ||
    e.paymentNumber?.includes(search)
  );

  return (
    <div className="flex flex-col gap-6 pt-8 px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Course Enrollments</h1>
          <p className="text-muted-foreground text-sm">Verify payments and manage student registrations</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search name, phone or bKash..."
          className="pl-10 rounded-xl bg-background border-muted"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Student</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Course</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Payment Details</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Registered</TableHead>
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
                  No enrollments found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((enroll) => (
                <TableRow key={enroll._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold flex items-center gap-1.5"><User className="h-3 w-3 text-primary" /> {enroll.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="h-3 w-3" /> {enroll.phone}</span>
                      {enroll.email && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> {enroll.email}</span>
                      )}
                      {enroll.address && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {enroll.address}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold truncate max-w-[200px]">{enroll.courseId?.name || 'Course Deleted'}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fee: ৳{enroll.courseId?.price || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {enroll.paymentNumber && enroll.paymentNumber !== 'FREE' ? (
                      <div className="flex flex-col">
                        <span className="text-xs font-bold flex items-center gap-1.5 text-primary"><Wallet className="h-3 w-3" /> {enroll.paymentNumber}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          {enroll.paymentNumber.toUpperCase().startsWith('BKASH') ? 'Manual bKash' : 
                           enroll.paymentNumber.toUpperCase().startsWith('NAGAD') ? 'Manual Nagad' : 
                           enroll.paymentNumber.toUpperCase().startsWith('ROCKET') ? 'Manual Rocket' : 
                           enroll.paymentNumber.toUpperCase().startsWith('BANGLAQR') ? 'Bangla QR' : 'Manual Payment'}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Free Course</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-[11px] font-medium">
                      <span className="flex items-center gap-1.5 text-foreground whitespace-nowrap">
                        <Calendar className="h-3 w-3 text-primary" /> 
                        {isValid(new Date(enroll.createdAt)) ? format(new Date(enroll.createdAt), 'MMM dd, yyyy') : 'Invalid Date'}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3 w-3" /> 
                        {isValid(new Date(enroll.createdAt)) ? format(new Date(enroll.createdAt), 'hh:mm a') : '--:--'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`rounded-md ${
                      enroll.status === 'Confirmed' ? 'bg-emerald-500' : 
                      enroll.status === 'Cancelled' ? 'bg-destructive' : 'bg-amber-500'
                    }`}>
                      {enroll.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" disabled={isUpdating.has(enroll._id)}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {enroll.status === 'Pending' && (
                              <DropdownMenuItem 
                                className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 dark:focus:bg-emerald-950/30 font-bold"
                                onClick={() => updateStatus(enroll._id, 'Confirmed')}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" /> Confirm
                              </DropdownMenuItem>
                            )}
                            {enroll.status === 'Pending' && (
                              <DropdownMenuItem 
                                className="text-destructive focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/30 font-bold"
                                onClick={() => updateStatus(enroll._id, 'Cancelled')}
                              >
                                <XCircle className="mr-2 h-4 w-4" /> Cancel
                              </DropdownMenuItem>
                            )}
                            {enroll.status === 'Pending' && <DropdownMenuSeparator />}
                            
                            <DropdownMenuItem 
                              className="text-destructive focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/30 font-bold"
                              onClick={() => deleteEnrollment(enroll._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

export default function EnrollmentsPage() {
  return <EnrollmentsContent />;
}
