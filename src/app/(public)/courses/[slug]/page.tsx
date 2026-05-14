import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getCachedCourseBySlug, getCachedSettings } from '@/lib/data-fetching';
import { getTenantDomain } from '@/lib/tenant';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, GraduationCap, MapPin, Clock } from 'lucide-react';
import { SocialShare } from '@/components/storefront/SocialShare';
import { generateHtml, generatePlainText } from '@/lib/server-html';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const domain = await getTenantDomain();
  const course = await getCachedCourseBySlug(domain, slug);
  const headersList = await headers();
  const hostname = headersList.get('host') || 'localhost';
  const settings = await getCachedSettings(hostname);
  const brandName = settings?.brandName || 'Alternative Health Services';

  if (!course) return { title: 'Course Not Found' };

  return {
    title: `${course.name} | Academy | ${brandName}`,
    description: generatePlainText(course.description).slice(0, 160),
  };
}

export default async function CourseDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const domain = await getTenantDomain();
  const course = await getCachedCourseBySlug(domain, slug);

  if (!course) notFound();

  return (
    <main className="min-h-screen py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left: Content */}
          <div className="flex flex-col">
            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl group">
              <img
                src={course.image}
                alt={course.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                  {course.name}
                </h1>
                <div className="h-2 w-24 bg-primary rounded-full" />
              </div>

              <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <div className="flex items-center gap-2">
                   <GraduationCap className="h-4 w-4 text-primary" />
                   Instructor: {course.instructor || 'Academy Expert'}
                </div>
                <div className="flex items-center gap-2">
                   <Clock className="h-4 w-4 text-primary" />
                   Duration: {course.duration || '2 Days'}
                </div>
                <div className="flex items-center gap-2">
                   <MapPin className="h-4 w-4 text-primary" />
                   Location: {course.location || 'Gazipur'}
                </div>
              </div>
              
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <div 
                  className="ProseMirror text-lg md:text-xl text-muted-foreground leading-relaxed whitespace-pre-line font-medium"
                  dangerouslySetInnerHTML={{ __html: generateHtml(course.description) }}
                />
              </div>
            </div>
          </div>

          {/* Right: Enrollment Action Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
              {/* Decorative Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-[80px] rounded-full" />
              
              <div className="relative z-10">
                <div className="mb-10 space-y-4 text-center md:text-left">
                  <h2 className="text-4xl font-black tracking-tighter uppercase leading-tight">ভর্তির জন্য <br /><span className="text-primary italic">প্রস্তুত তো?</span></h2>
                  <p className="text-sm text-slate-400 font-medium uppercase tracking-widest leading-loose">
                    আমাদের ৩৬৫তম ব্যাচে ভর্তি চলছে। সীমিত সিট, তাই আজই আপনার সিটটি নিশ্চিত করুন।
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">কোর্স ফি</span>
                    <span className="text-3xl font-black text-primary">
                      {course.price ? `৳${course.price}` : 'FREE'}
                    </span>
                  </div>

                  <Link href={`/courses/${slug}/enroll`} className="block">
                    <Button className="w-full h-20 rounded-2xl bg-primary hover:bg-white hover:text-black transition-all duration-500 font-black uppercase tracking-[0.2em] text-lg shadow-2xl shadow-primary/40 group">
                      ভর্তি হোন
                      <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>

                  <div className="pt-6 border-t border-white/10">
                    <SocialShare title={course.name} />
                  </div>
                  
                  <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest">
                    নিরাপদ পেমেন্ট ও ইনস্ট্যান্ট কনফার্মেশন
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
