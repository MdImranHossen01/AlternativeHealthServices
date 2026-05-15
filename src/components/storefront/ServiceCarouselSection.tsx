'use client';

import React from 'react';
import { ArrowRight, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import ServiceCard from '@/components/templates/product-cards/ServiceCard';

interface Service {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  price?: number;
}

interface ServiceCarouselSectionProps {
  title: string;
  description?: string;
  services: Service[];
  viewAllLink: string;
  bgColor?: 'bg-background' | 'bg-muted/20' | 'bg-slate-950';
}

export function ServiceCarouselSection({
  title,
  description,
  services,
  viewAllLink,
  bgColor = "bg-background"
}: ServiceCarouselSectionProps) {

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      dragFree: true,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  if (!services || services.length === 0) return null;

  const bgClassMap = {
    "bg-background": "bg-background",
    "bg-muted/20": "bg-muted/20",
    "bg-slate-950": "bg-slate-950"
  };

  const selectedBg = bgClassMap[bgColor as keyof typeof bgClassMap] || "bg-background";

  return (
    <section className={`py-8 md:py-12 ${selectedBg} overflow-hidden border-b border-muted/20`}>
      <div className="container mx-auto px-4 md:px-0">

        {/* Header */}
        <div className="flex flex-row items-center justify-between mb-8 md:mb-10 gap-4 px-4 md:px-0">
          <div className="flex flex-col items-start space-y-2">
            <h2 className="text-2xl font-black tracking-tighter md:text-4xl text-foreground">
              {title}
            </h2>
          </div>

          <Button asChild variant="default" className="rounded-full font-bold group">
            <Link href={viewAllLink}>
              View All
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Embla Carousel Viewport */}
        <div className="relative">
          <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
            <div className="flex -ml-4">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="flex-[0_0_48%] min-w-0 pl-4 md:flex-[0_0_33.33%] lg:flex-[0_0_25%]"
                >
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
