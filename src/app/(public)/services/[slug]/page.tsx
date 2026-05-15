import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getCachedServiceBySlug, getCachedSettings } from '@/lib/data-fetching';
import { getTenantDomain } from '@/lib/tenant';
import { Metadata } from 'next';
import { BookingModal } from '@/components/storefront/BookingModal';
import { SocialShare } from '@/components/storefront/SocialShare';
import { generateHtml, generatePlainText } from '@/lib/server-html';
import { AdminActions } from '@/components/common/AdminActions';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const domain = await getTenantDomain();
  const service = await getCachedServiceBySlug(domain, slug);
  if (!service) return { title: 'Service Not Found' };

  return {
    title: `${service.name} | Alternative Health Services`,
    description: generatePlainText(service.description).slice(0, 160),
  };
}

export default async function ServiceDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const domain = await getTenantDomain();
  const service = await getCachedServiceBySlug(domain, slug);

  if (!service) notFound();

  return (
    <main className="min-h-screen py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
          
          {/* Left: Content */}
          <div className="flex flex-col">
            <div className="relative aspect-square rounded-none overflow-hidden mb-12 shadow-2xl group">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            
            <div className="space-y-8">

              
              <div className="prose prose-neutral dark:prose-invert max-w-none">
              <div 
                className="ProseMirror text-lg text-muted-foreground leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: generateHtml(service.description) }}
              />
            </div>
            </div>
          </div>

          {/* Right: Booking Action Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="p-10 rounded-none">
              <div className="mb-10 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-3xl font-black tracking-tighter uppercase leading-tight">{service.name}</h2>
                  <AdminActions type="service" slug={service.slug} name={service.name} id={service._id.toString()} />
                </div>
                <p className="text-sm text-muted-foreground font-medium leading-loose">
                  আমাদের বিশেষজ্ঞগণ প্রতিদিন সকাল <span className="text-foreground font-black">৯টা থেকে রাত ১০টা</span> পর্যন্ত সেবা দিচ্ছেন। আপনার স্লট এখনই নিশ্চিত করুন।
                </p>
              </div>
              
              <div className="space-y-6">


                <BookingModal 
                  serviceId={service._id.toString()} 
                  serviceName={service.name} 
                  price={service.price}
                />

                <div className="pt-6 border-t border-muted/50">
                   <SocialShare title={service.name} />
                </div>
                
                <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest">
                  হোয়াটসঅ্যাপ বা ফোন কলের মাধ্যমে তাৎক্ষণিক নিশ্চিতকরণ
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

