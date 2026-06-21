'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Search, GraduationCap, Phone, User, CheckCircle, XCircle, Wallet, Calendar, Clock, MoreHorizontal, Trash2, Mail, MapPin, Filter as FilterIcon, ChevronDown } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState({
    from: '',
    to: '',
  });
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  // Get current page from search params
  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1);

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

  const filtered = enrollments.filter(e => {
    const searchLower = search.toLowerCase();
    
    // Search matching
    const matchesSearch = 
      e.name.toLowerCase().includes(searchLower) || 
      e.phone.includes(search) ||
      (e.paymentNumber && e.paymentNumber.toLowerCase().includes(searchLower)) ||
      (e.email && e.email.toLowerCase().includes(searchLower)) ||
      (e.courseId && e.courseId.name.toLowerCase().includes(searchLower));

    // Status matching
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;

    // Date matching
    let matchesDate = true;
    if (dateFilter.from && dateFilter.to) {
      const enrollDate = new Date(e.createdAt);
      const fromDate = new Date(dateFilter.from);
      const toDate = new Date(dateFilter.to);
      toDate.setHours(23, 59, 59, 999);
      matchesDate = enrollDate >= fromDate && enrollDate <= toDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const activePage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const paginatedEnrollments = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pageNumber > 1) {
      params.set('page', pageNumber.toString());
    } else {
      params.delete('page');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-6 pt-8 px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Course Enrollments</h1>
          <p className="text-muted-foreground text-sm">Verify payments and manage student registrations</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, phone, email or payment info..."
              className="pl-10 rounded-xl bg-background border-muted"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                const params = new URLSearchParams(searchParams.toString());
                params.delete('page');
                router.push(`${pathname}?${params.toString()}`);
              }}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 rounded-xl">
                <FilterIcon className="mr-2 h-4 w-4" />
                {statusFilter === 'All' ? 'All Status' : statusFilter}
                <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {['All', 'Pending', 'Confirmed', 'Cancelled'].map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete('page');
                      router.push(`${pathname}?${params.toString()}`);
                    }}
                    className={statusFilter === status ? "bg-accent font-bold" : ""}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{status}</span>
                      <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
                        {status === 'All'
                          ? enrollments.length
                          : enrollments.filter(e => e.status === status).length
                        }
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border">
            <Input
              type="date"
              className="h-8 w-36 border-none bg-transparent focus-visible:ring-0"
              value={dateFilter.from}
              onChange={(e) => {
                setDateFilter(prev => ({ ...prev, from: e.target.value }));
                const params = new URLSearchParams(searchParams.toString());
                params.delete('page');
                router.push(`${pathname}?${params.toString()}`);
              }}
            />
            <span className="text-muted-foreground text-xs">to</span>
            <Input
              type="date"
              className="h-8 w-36 border-none bg-transparent focus-visible:ring-0"
              value={dateFilter.to}
              onChange={(e) => {
                setDateFilter(prev => ({ ...prev, to: e.target.value }));
                const params = new URLSearchParams(searchParams.toString());
                params.delete('page');
                router.push(`${pathname}?${params.toString()}`);
              }}
            />
          </div>

          {(statusFilter !== 'All' || dateFilter.from || dateFilter.to || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter('All');
                setDateFilter({ from: '', to: '' });
                setSearch('');
                const params = new URLSearchParams(searchParams.toString());
                params.delete('page');
                router.push(`${pathname}?${params.toString()}`);
              }}
              className="text-xs text-muted-foreground hover:text-primary rounded-xl"
            >
              Clear All
            </Button>
          )}
        </div>
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
                <TableCell colSpan={6} className="h-40 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                  No enrollments found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEnrollments.map((enroll) => (
                <TableRow key={enroll._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span 
                        className="font-bold flex items-center gap-1.5 cursor-pointer text-primary hover:underline"
                        onClick={() => setSelectedEnrollment(enroll)}
                      >
                        <User className="h-3 w-3 text-primary" /> {enroll.name}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="h-3 w-3" /> {enroll.phone}</span>
                      {enroll.email && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> {enroll.email}</span>
                      )}
                      {enroll.address && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5" title={enroll.address}>
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[250px]">
                            {enroll.address.length > 50 ? `${enroll.address.slice(0, 50)}...` : enroll.address}
                          </span>
                        </span>
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
                    ) : enroll.paymentNumber === 'FREE' || !enroll.courseId || enroll.courseId.price === 0 ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Free Course</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">No Payment Info</Badge>
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

      {totalPages > 1 && (
        <div className="py-4 flex justify-center">
          <Pagination
            currentPage={activePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <Dialog open={!!selectedEnrollment} onOpenChange={(open) => !open && setSelectedEnrollment(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Enrollment Details
            </DialogTitle>
          </DialogHeader>
          {selectedEnrollment && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-3 items-start gap-4">
                <span className="font-semibold text-muted-foreground">Student Name:</span>
                <span className="col-span-2 font-bold text-foreground flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary" /> {selectedEnrollment.name}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Phone:</span>
                <span className="col-span-2 font-medium flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-primary" /> {selectedEnrollment.phone}
                </span>
              </div>
              {selectedEnrollment.email && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold text-muted-foreground">Email:</span>
                  <span className="col-span-2 font-medium flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-primary" /> {selectedEnrollment.email}
                  </span>
                </div>
              )}
              {selectedEnrollment.address && (
                <div className="grid grid-cols-3 items-start gap-4">
                  <span className="font-semibold text-muted-foreground">Address:</span>
                  <span className="col-span-2 font-medium flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{selectedEnrollment.address}</span>
                  </span>
                </div>
              )}
              <div className="border-t my-2" />
              <div className="grid grid-cols-3 items-start gap-4">
                <span className="font-semibold text-muted-foreground">Course:</span>
                <span className="col-span-2 font-bold text-foreground">
                  {selectedEnrollment.courseId?.name || 'Course Deleted'}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Course Fee:</span>
                <span className="col-span-2 font-bold text-primary">
                  ৳{selectedEnrollment.courseId?.price || 0}
                </span>
              </div>
              <div className="border-t my-2" />
              <div className="grid grid-cols-3 items-start gap-4">
                <span className="font-semibold text-muted-foreground">Payment Details:</span>
                <span className="col-span-2">
                  {selectedEnrollment.paymentNumber && selectedEnrollment.paymentNumber !== 'FREE' ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-primary flex items-center gap-1.5">
                        <Wallet className="h-4 w-4" /> {selectedEnrollment.paymentNumber}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        {selectedEnrollment.paymentNumber.toUpperCase().startsWith('BKASH') ? 'Manual bKash' : 
                         selectedEnrollment.paymentNumber.toUpperCase().startsWith('NAGAD') ? 'Manual Nagad' : 
                         selectedEnrollment.paymentNumber.toUpperCase().startsWith('ROCKET') ? 'Manual Rocket' : 
                         selectedEnrollment.paymentNumber.toUpperCase().startsWith('BANGLAQR') ? 'Bangla QR' : 'Manual Payment'}
                      </span>
                    </div>
                  ) : selectedEnrollment.paymentNumber === 'FREE' || !selectedEnrollment.courseId || selectedEnrollment.courseId.price === 0 ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Free Course</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">No Payment Info</Badge>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Registered:</span>
                <span className="col-span-2 font-medium flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  {isValid(new Date(selectedEnrollment.createdAt)) ? format(new Date(selectedEnrollment.createdAt), 'MMM dd, yyyy - hh:mm a') : 'N/A'}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Status:</span>
                <span className="col-span-2">
                  <Badge className={`rounded-md ${
                    selectedEnrollment.status === 'Confirmed' ? 'bg-emerald-500' : 
                    selectedEnrollment.status === 'Cancelled' ? 'bg-destructive' : 'bg-amber-500'
                  }`}>
                    {selectedEnrollment.status}
                  </Badge>
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function EnrollmentsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <EnrollmentsContent />
    </Suspense>
  );
}
