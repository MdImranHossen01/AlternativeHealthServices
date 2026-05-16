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
import { AdminActions } from '@/components/common/AdminActions';

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
    <main className="min-h-screen py-8 md:py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
          
          {/* Left: Content */}
          <div className="flex flex-col">
            <div className="relative aspect-square rounded-none overflow-hidden mb-12 shadow-2xl group">
              <img
                src={course.image}
                alt={course.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            
            <div className="space-y-8">

              
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
            <div className="p-10 lg:pt-0 rounded-none">
              <div className="relative z-10">
                <div className="mb-8 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-3xl font-black tracking-tighter uppercase leading-tight">{course.name}</h2>
                    <AdminActions type="course" slug={course.slug} name={course.name} id={course._id.toString()} />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium leading-loose">
                    আমাদের স্পেশাল কোর্সে ভর্তি চলছে। আপনার ক্যারিয়ারের নতুন যাত্রা শুরু করুন আজই।
                  </p>
                </div>

                <div className="space-y-3 py-6 border-y border-muted/50 my-6">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    প্রশিক্ষক: {course.instructor || 'Expert MBBS Doctor'}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    মেয়াদ: {course.duration || '২ দিন'}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    স্থান: {course.location || 'বোর্ড বাজার, গাজীপুর'}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-muted/30 border border-muted/50 rounded-none">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">কোর্স ফি</span>
                    <span className="text-3xl font-black text-primary">
                      {course.price ? `৳${course.price}` : 'FREE'}
                    </span>
                  </div>

                  <Link href={`/courses/${slug}/enroll`} className="block">
                    <Button className="w-full h-20 rounded-none bg-primary hover:bg-slate-900 text-white transition-all duration-500 font-black uppercase tracking-[0.2em] text-lg shadow-2xl shadow-primary/20 group">
                      ভর্তি হোন
                      <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>

                  <div className="pt-6 border-t border-muted/50">
                    <SocialShare title={course.name} />
                  </div>
                  
                  <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest">
                    নিরাপদ পেমেন্ট ও তাৎক্ষণিক নিশ্চিতকরণ
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
