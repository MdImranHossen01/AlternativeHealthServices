'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const NovelEditor = dynamic(() => import('@/components/editor/NovelEditor'), { ssr: false });

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState('');
  const [service, setService] = useState<any>(null);

  useEffect(() => {
    async function fetchService() {
      try {
        const res = await fetch(`/api/services/${id}`);
        if (res.ok) {
          const data = await res.json();
          setService(data);
          setDescription(data.description || '');
        } else {
          toast.error('Failed to load service');
          router.push('/admin/services');
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [id, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Validation
    if (!description || description.trim() === '') {
      toast.error('Service description is required');
      setSaving(false);
      return;
    }

    const priceValue = formData.get('price') as string;
    const price = priceValue === '' ? null : Number(priceValue);

    const payload = {
      ...data,
      price,
      description
    };

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Service updated successfully');
        router.push('/admin/services');
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to update service');
      }
    } catch (error: any) {
      console.error('Service update error:', error);
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-black uppercase mb-8">Edit Service</h1>
      <form onSubmit={onSubmit} className="space-y-6 bg-white p-8 rounded-2xl border shadow-xl">
        <div className="space-y-2">
          <Label>Service Name</Label>
          <Input 
            name="name" 
            defaultValue={service?.name}
            placeholder="e.g. Hijama Therapy" 
            required 
            className="h-12 rounded-xl" 
          />
        </div>
        <div className="space-y-2">
          <Label>Image URL</Label>
          <Input 
            name="image" 
            defaultValue={service?.image}
            placeholder="https://..." 
            required 
            className="h-12 rounded-xl" 
          />
        </div>
        <div className="space-y-2">
          <Label>Price (Empty for FREE)</Label>
          <Input 
            name="price" 
            type="number" 
            defaultValue={service?.price}
            placeholder="0" 
            className="h-12 rounded-xl" 
          />
        </div>
        <div className="space-y-2">
          <Label>Service Description (Rich Text)</Label>
          <div className="border rounded-xl overflow-hidden min-h-[300px]">
            <NovelEditor 
              initialValue={service?.description} 
              onChange={(val) => setDescription(val)} 
            />
          </div>
        </div>
        <Button 
          type="submit" 
          disabled={saving} 
          className="w-full h-16 rounded-xl font-black uppercase text-lg bg-slate-900 text-white hover:bg-primary transition-all shadow-xl shadow-slate-200"
        >
          {saving ? 'Updating Service...' : 'Update Service'}
        </Button>
      </form>
    </div>
  );
}
