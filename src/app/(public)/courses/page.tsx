import { headers } from 'next/headers';
import { getCachedCourses, getCachedSettings } from '@/lib/data-fetching';
import { getTenantDomain } from '@/lib/tenant';
import CourseCard from '@/components/templates/product-cards/CourseCard';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Course {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  price?: number;
  instructor: string;
  duration: string;
  location: string;
  features: string[];
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || 'localhost';
  const settings = await getCachedSettings(hostname);
  const brandName = settings?.brandName || 'Alternative Health Services';

  return {
    title: `Medical Training Courses | ${brandName}`,
    description: `Enroll in our professional medical training courses. Government approved certificates and practical training.`,
  };
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string }>;
}) {
  const { limit: limitParam } = await searchParams;
  const limit = parseInt(limitParam || '12');
  const domain = await getTenantDomain();
  const courses = await getCachedCourses(domain, limit) as Course[];

  const headersList = await headers();
  const hostname = headersList.get('host') || 'localhost';
  const settings = await getCachedSettings(hostname);
  const academyConfig = settings?.academyConfig || {};

  const foundingYear = academyConfig.foundingYear || 2012;
  const studentCount = academyConfig.studentCount || '5000+';
  const currentBatch = academyConfig.currentBatch || '365th';
  const academyTitle = academyConfig.academyTitle || 'Training Academy';

  return (
    <main className="min-h-screen py-24 bg-slate-950 text-white">
      <div className="container mx-auto px-4">
        <header className="max-w-3xl mb-20">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 uppercase">
            Medical <span className="text-primary italic">{academyTitle}</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Since {foundingYear}, we have trained over {studentCount} students. Join our {currentBatch} batch and become 
            a skilled healthcare provider with government-approved certifications.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses.map((course: Course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>

        {courses.length > 0 && courses.length === limit && (
          <div className="mt-16 flex justify-center">
            <Link href={`/courses?limit=${limit + 12}`} scroll={false}>
              <Button variant="outline" className="rounded-full px-12 border-white/20 hover:bg-white/10 text-white h-14 font-bold uppercase tracking-widest text-xs">
                Load More Courses
              </Button>
            </Link>
          </div>
        )}

        {courses.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl">
            <p className="text-slate-500 font-bold">New batches are coming soon. Stay tuned!</p>
          </div>
        )}
      </div>
    </main>
  );
}
