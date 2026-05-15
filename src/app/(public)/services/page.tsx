import { headers } from 'next/headers';
import { getCachedServices, getCachedSettings } from '@/lib/data-fetching';
import { getTenantDomain } from '@/lib/tenant';
import ServiceCard from '@/components/templates/product-cards/ServiceCard';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Service {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  price?: number;
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || 'localhost';
  const settings = await getCachedSettings(hostname);
  const brandName = settings?.brandName || 'Alternative Health Services';

  return {
    title: `Our Services | ${brandName}`,
    description: `Explore our professional health services and treatments.`,
  };
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string }>;
}) {
  try {
    const { limit: limitParam } = await searchParams;
    const limit = parseInt(limitParam || '12');
    const domain = await getTenantDomain();
    const services = await getCachedServices(domain, limit) as Service[];

    return (
      <main className="min-h-screen py-20 bg-background">
        <div className="container mx-auto px-4">
          <header className="max-w-3xl mb-16 text-center mx-auto">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase">
              Specialized <span className="text-primary italic">Health Services</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              আমরা উন্নত চিকিৎসা সেবা প্রদান করি যা মূলত নন-ইনভ্যাসিভ এবং কসমেটিক হেলথ সলিউশনের ওপর গুরুত্ব দেয়। 
              আমাদের সকল সেবা অভিজ্ঞ চিকিৎসকদের দ্বারা একটি নিরাপদ পরিবেশে সম্পন্ন করা হয়।
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service: Service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>

          {services.length > 0 && services.length === limit && (
            <div className="mt-12 flex justify-center">
              <Link href={`/services?limit=${limit + 12}`} scroll={false}>
                <Button variant="outline" className="rounded-full px-12 h-14 font-black uppercase tracking-widest text-xs border-primary/20 text-primary hover:bg-primary/5">
                  Load More Services
                </Button>
              </Link>
            </div>
          )}

          {services.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-muted rounded-3xl">
              <p className="text-muted-foreground font-bold">No services available at the moment. Please check back later.</p>
            </div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error loading services page:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Failed to load services</h2>
          <Button onClick={() => typeof window !== 'undefined' && window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }
}
