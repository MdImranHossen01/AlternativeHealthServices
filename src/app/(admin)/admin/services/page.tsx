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
import { Plus, Edit, Trash, Loader2, Search, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

interface AdminService {
  _id: string;
  name: string;
  slug: string;
  price?: number;
  isPublished: boolean;
  image: string;
}

function ServicesContent() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete Service?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/services/${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Service deleted');
          fetchServices();
        } else {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.message || `Delete failed: ${response.statusText}`);
        }
      } catch (error: any) {
        console.error('Delete error:', error);
        toast.error('Delete failed. Please try again.');
      }
    }
  };

  const filtered = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 pt-8 px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Health Services</h1>
          <p className="text-muted-foreground text-sm">Manage medical procedures and appointments</p>
        </div>
        <Link href="/admin/services/new">
          <Button className="rounded-xl font-bold uppercase text-[10px] tracking-widest px-6 shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Add Service
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services..."
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
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Name</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Price</TableHead>
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
                  No services found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((service) => (
                <TableRow key={service._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="h-12 w-16 overflow-hidden rounded-lg border bg-muted">
                      <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">
                    <div className="flex items-center gap-2">
                      {service.name}
                      <Link href={`/services/${service.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    {service.price ? `৳${service.price}` : <Badge className="bg-emerald-500">FREE</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={service.isPublished ? 'default' : 'secondary'} className="rounded-md">
                      {service.isPublished ? 'Active' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/services/${service._id}/edit`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(service._id)}>
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

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
