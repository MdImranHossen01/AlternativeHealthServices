'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash, Loader2, Search, ExternalLink, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

interface AdminCourse {
  _id: string;
  name: string;
  slug: string;
  price?: number;
  isPublished: boolean;
  image: string;
  instructor: string;
}

function CoursesContent() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      if (Array.isArray(data)) {
        setCourses(data);
      } else {
        console.error('Invalid courses data:', data);
        setCourses([]);
      }
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete Course?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Course deleted');
          fetchCourses();
        } else {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.message || `Delete failed: ${response.statusText}`);
        }
      } catch (error: any) {
        console.error('Delete failed:', error);
        toast.error('Delete failed. Please try again.');
      }
    }
  };

  const filtered = courses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 pt-8 px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Training Courses</h1>
          <p className="text-muted-foreground text-sm">Manage medical academy batches and curriculum</p>
        </div>
        <Link href="/admin/courses/new">
          <Button className="rounded-xl font-bold uppercase text-[10px] tracking-widest px-6 shadow-lg shadow-primary/20 bg-slate-900 hover:bg-primary">
            <Plus className="mr-2 h-4 w-4" /> Add New Course
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          className="pl-10 rounded-xl bg-background border-muted"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px] font-black uppercase text-[10px] tracking-widest">Image</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Course Name</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Instructor</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Fee</TableHead>
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
                  No courses found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((course) => (
                <TableRow key={course._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="h-12 w-16 overflow-hidden rounded-lg border bg-muted">
                      <img 
                        src={course.image} 
                        alt={course.name} 
                        className="h-full w-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Course';
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">
                    <div className="flex items-center gap-2">
                      {course.name}
                      <Link href={`/courses/${course.slug}`} target="_blank">
                        <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <GraduationCap className="h-3 w-3 text-primary" />
                      {course.instructor || 'Dr. Practitioner'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {course.price ? `৳${course.price}` : <Badge className="bg-emerald-500">FREE</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={course.isPublished ? 'default' : 'secondary'} className="rounded-md">
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/courses/${course._id}/edit`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(course._id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
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

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <CoursesContent />
    </Suspense>
  );
}
