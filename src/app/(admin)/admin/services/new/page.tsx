'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, 
    Save, 
    Loader2, 
    Briefcase,
    Type,
    ImageIcon,
    Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { slugify } from '@/lib/slugify';

const NovelEditor = dynamic(() => import('@/components/editor/NovelEditor'), { ssr: false });

const hasMeaningfulContent = (rawContent: string) => {
  if (!rawContent) return false;

  try {
    const parsed = JSON.parse(rawContent);
    const nodes = Array.isArray(parsed?.content) ? parsed.content : [];
    return nodes.some((node: { type?: string; text?: string; content?: { text?: string }[] }) => {
      if (!node) return false;
      if (node.type === 'image' || node.type === 'youtube') return true;
      if (!Array.isArray(node.content)) return false;
      return node.content.some((child) => (child?.text ?? '').trim().length > 0);
    });
  } catch {
    return rawContent.trim().length > 0;
  }
};

export default function NewServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    price: '',
    isPublished: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      let finalValue = value;
      if (name === 'slug') {
        finalValue = slugify(value);
      }

      const newData = { ...prev, [name]: finalValue };
      
      // Auto-generate slug if the name is being changed
      if (name === 'name') {
        newData.slug = slugify(value);
      }
      
      return newData;
    });
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasMeaningfulContent(formData.description)) {
      toast.error('Service description is required');
      return;
    }
    if (!formData.image) {
      toast.error('Service image is required');
      return;
    }

    setLoading(true);
    
    const priceValue = formData.price;
    const price = priceValue === '' ? null : Number(priceValue);
    if (price !== null && isNaN(price)) {
      toast.error('Invalid price value');
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      price,
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
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/services">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Services
          </Button>
        </Link>
        <h1 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tight text-slate-800">
          <Briefcase className="h-6 w-6 text-primary" />
          Add New Service
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 text-black">
        <div className="space-y-6">
          <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-black">
                  <Type className="h-4 w-4 text-primary" /> Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Service Name *</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Hijama Therapy"
                  required
                  className="h-12 text-lg font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Slug / URL Path *</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">alternativehsbd.com/services/</span>
                  <Input
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="service-url-slug"
                    required
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-1.5">
                  <Banknote className="h-3 w-3" /> Price (Empty for FREE)
                </label>
                <Input
                  name="price"
                  type="number"
                  min={0}
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Service Description *</label>
                <div className="border border-slate-200 rounded-xl overflow-hidden min-h-[400px] focus-within:ring-2 focus-within:ring-primary/20 transition-all text-black">
                  <NovelEditor 
                      onChange={(val) => setFormData(prev => ({ ...prev, description: val }))} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-black">
                  <ImageIcon className="h-4 w-4 text-primary" /> Media
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <label className="text-sm font-bold">Service Thumbnail</label>
                <ImageUpload 
                  value={formData.image}
                  onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="text-sm font-bold text-black">Status & Visibility</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <label className="flex items-center gap-3 text-sm font-bold cursor-pointer group text-black">
                <Checkbox
                  checked={formData.isPublished}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isPublished: Boolean(checked) }))
                  }
                  className="rounded-lg h-5 w-5 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="group-hover:text-primary transition-colors">Publish immediately</span>
              </label>
            </CardContent>
          </Card>

          <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-primary text-white font-black uppercase text-lg gap-3 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-6 w-6" />
                Create Service
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
