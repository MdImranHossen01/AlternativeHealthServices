'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const NovelEditor = dynamic(() => import('@/components/editor/NovelEditor'), { ssr: false });

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Coerce numeric fields and validate
    const price = Number(data.price) || 0;
    if (price < 0) {
      toast.error('Price cannot be negative');
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
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Course created successfully');
        router.push('/admin/courses');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-black uppercase mb-8">Add New Course</h1>
      <form onSubmit={onSubmit} className="space-y-6 bg-slate-900 text-white p-8 rounded-2xl border border-white/10 shadow-xl">
        <div className="space-y-2">
          <Label>Course Title</Label>
          <Input name="name" placeholder="Basic Medical Training" required className="rounded-xl bg-white/5 border-white/10 h-12" />
        </div>
        <div className="space-y-2">
          <Label>Image URL</Label>
          <Input name="image" placeholder="https://..." required className="rounded-xl bg-white/5 border-white/10 h-12" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Instructor</Label>
            <Input name="instructor" placeholder="Dr. Name" className="rounded-xl bg-white/5 border-white/10 h-12" />
          </div>
          <div className="space-y-2">
            <Label>Fee (৳)</Label>
            <Input name="price" type="number" min={0} placeholder="0" className="rounded-xl bg-white/5 border-white/10 h-12" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Duration</Label>
            <Input name="duration" placeholder="2 Days" className="rounded-xl bg-white/5 border-white/10 h-12" />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input name="location" placeholder="Gazipur" className="rounded-xl bg-white/5 border-white/10 h-12" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Course Description (Rich Text)</Label>
          <div className="bg-white text-black rounded-xl overflow-hidden min-h-[300px]">
            <NovelEditor onChange={(val) => setDescription(val)} />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full rounded-xl bg-primary hover:bg-white hover:text-black font-black uppercase py-8 text-lg">
          {loading ? 'Creating Academy Course...' : 'Publish Course'}
        </Button>
      </form>
    </div>
  );
}

