'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const NovelEditor = dynamic(() => import('@/components/editor/NovelEditor'), { ssr: false });

export default function NewServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Validation
    if (!description || description.trim() === '') {
      toast.error('Service description is required');
      setLoading(false);
      return;
    }

    const priceValue = formData.get('price') as string;
    const price = priceValue === '' ? null : Number(priceValue);
    if (price !== null && isNaN(price)) {
      toast.error('Invalid price value');
      setLoading(false);
      return;
    }

    const imageUrl = data.image as string;
    try {
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        throw new Error();
      }
    } catch {
      toast.error('Please provide a valid image URL');
      setLoading(false);
      return;
    }

    // Add rich text description
    const payload = {
      ...data,
      price,
      description
    };

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Service created successfully');
        router.push('/admin/services');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to create service');
      }
    } catch (error: any) {
      console.error('Service creation error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-black uppercase mb-8">Add New Service</h1>
      <form onSubmit={onSubmit} className="space-y-6 bg-white p-8 rounded-2xl border shadow-xl">
        <div className="space-y-2">
          <Label>Service Name</Label>
          <Input name="name" placeholder="e.g. Hijama Therapy" required className="h-12 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Image URL</Label>
          <Input name="image" placeholder="https://..." required className="h-12 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Price (Empty for FREE)</Label>
          <Input name="price" type="number" placeholder="0" className="h-12 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Service Description (Rich Text)</Label>
          <div className="border rounded-xl overflow-hidden min-h-[300px]">
            <NovelEditor onChange={(val) => setDescription(val)} />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full h-16 rounded-xl font-black uppercase text-lg bg-slate-900 text-white hover:bg-primary transition-all shadow-xl shadow-slate-200">
          {loading ? 'Creating Service...' : 'Create Service'}
        </Button>
      </form>
    </div>
  );
}

