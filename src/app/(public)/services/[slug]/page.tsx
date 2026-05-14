import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getCachedServiceBySlug, getCachedSettings } from '@/lib/data-fetching';
import { getTenantDomain } from '@/lib/tenant';
import { Metadata } from 'next';
import { BookingModal } from '@/components/storefront/BookingModal';
import { SocialShare } from '@/components/storefront/SocialShare';
import { generateHtml, generatePlainText } from '@/lib/server-html';

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left: Content */}
          <div className="flex flex-col">
            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl group">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                  {service.name}
                </h1>
                <div className="h-2 w-24 bg-primary rounded-full" />
              </div>
              
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
            <div className="bg-muted/30 border border-muted/50 p-10 rounded-[3rem] shadow-2xl backdrop-blur-sm">
              <div className="mb-10 space-y-4">
                <h2 className="text-3xl font-black tracking-tighter uppercase leading-tight">Ready to start <br /><span className="text-primary italic">your treatment?</span></h2>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest leading-loose">
                  Our specialists are available everyday from <span className="text-foreground font-black">9:00 AM to 10:00 PM</span>. Secure your slot now.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-background rounded-2xl border border-muted/50">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Service Fee</span>
                  <span className="text-2xl font-black text-primary">
                    {service.price ? `৳${service.price}` : 'FREE'}
                  </span>
                </div>

                <BookingModal 
                  serviceId={service._id.toString()} 
                  serviceName={service.name} 
                  price={service.price}
                />

                <div className="pt-6 border-t border-muted/50">
                   <SocialShare title={service.name} />
                </div>
                
                <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest">
                  Instant confirmation via WhatsApp or Phone Call
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

