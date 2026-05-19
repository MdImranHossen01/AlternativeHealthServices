import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getCachedCourseBySlug, getCachedSettings } from '@/lib/data-fetching';
import { getTenantDomain } from '@/lib/tenant';
import EnrollmentFormV2 from '@/components/storefront/EnrollmentFormV2';

export default async function EnrollmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const domain = await getTenantDomain();
  const headersList = await headers();
  const hostname = headersList.get('host') || 'localhost';
  
  const [course, settings] = await Promise.all([
    getCachedCourseBySlug(domain, slug),
    getCachedSettings(hostname)
  ]);

  if (!course) notFound();

  return (
    <main className="min-h-screen py-20 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-16 text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
            কোর্সে <span className="text-primary italic">ভর্তি হোন</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <span className="text-primary">Course:</span> {course.name}
          </div>
        </div>

        <EnrollmentFormV2 
          courseId={course._id.toString()} 
          courseName={course.name} 
          price={course.price || 0}
          manualPaymentConfig={settings?.manualPaymentConfig || {}}
        />
      </div>
    </main>
  );
}
