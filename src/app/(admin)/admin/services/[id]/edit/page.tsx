'use client';

import { useState, useEffect, use } from 'react';
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

const parseEditorInitialValue = (content: string) => {
  if (!content) return undefined;

  try {
    const parsed = JSON.parse(content);
    return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
  } catch {
    return {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: content }] }],
    };
  }
};

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    price: '',
    isPublished: true,
  });

  useEffect(() => {
    async function fetchService() {
      try {
        const res = await fetch(`/api/services/${id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || '',
            slug: data.slug || '',
            description: data.description || '',
            image: data.image || '',
            price: data.price?.toString() || '',
            isPublished: data.isPublished ?? true,
          });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      let finalValue = value;
      if (name === 'slug') {
        finalValue = slugify(value);
      }

      const newData = { ...prev, [name]: finalValue };
      
      // Auto-generate slug if the name is being changed and slug is empty or matches previous name slug
      if (name === 'name' && (!prev.slug || prev.slug === slugify(prev.name))) {
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

    setSaving(true);
    
    const priceValue = formData.price;
    const price = priceValue === '' ? null : Number(priceValue);
    if (price !== null && isNaN(price)) {
      toast.error('Invalid price value');
      setSaving(false);
      return;
    }

    const payload = {
      ...formData,
      price,
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
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/services">
          <Button variant="ghost" className="gap-2 rounded-xl">
            <ArrowLeft className="h-4 w-4" /> Back to Services
          </Button>
        </Link>
        <h1 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tight text-slate-800">
          <Briefcase className="h-6 w-6 text-primary" />
          Edit Service
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Type className="h-4 w-4 text-primary" /> Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Service Name *</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Hijama Therapy"
                    required
                    className="h-12 rounded-2xl border-slate-200 focus:ring-primary focus:border-primary text-lg font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Slug / URL Path *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono hidden sm:inline">/services/</span>
                    <Input
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="service-url-slug"
                      required
                      className="h-10 rounded-xl border-slate-200 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                    <Banknote className="h-3 w-3" /> Price (Empty for FREE)
                  </label>
                  <Input
                    name="price"
                    type="number"
                    min={0}
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                    className="h-12 rounded-2xl border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Service Description *</label>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden min-h-[400px] focus-within:ring-2 focus-within:ring-primary/20 transition-all text-black">
                    <NovelEditor 
                        initialValue={parseEditorInitialValue(formData.description)}
                        onChange={(val) => setFormData(prev => ({ ...prev, description: val }))} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" /> Media
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ImageUpload 
                  value={formData.image}
                  onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
                  label="Service Thumbnail"
                  aspect="video"
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                <CardTitle className="text-sm font-bold">Status & Visibility</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <label className="flex items-center gap-3 text-sm font-bold cursor-pointer group">
                  <Checkbox
                    checked={formData.isPublished}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isPublished: Boolean(checked) }))
                    }
                    className="rounded-lg h-5 w-5 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className="group-hover:text-primary transition-colors">Published</span>
                </label>
                <p className="mt-2 text-[10px] text-slate-400 font-medium leading-relaxed">
                    Uncheck to set as a draft. Draft services will not be visible on the public services page.
                </p>
              </CardContent>
            </Card>

            <Button 
                type="submit" 
                disabled={saving} 
                className="w-full h-16 rounded-3xl bg-slate-900 hover:bg-primary text-white font-black uppercase text-lg gap-3 transition-all active:scale-95 shadow-xl shadow-slate-200"
            >
              {saving ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-6 w-6" />
                  Update Service
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

