'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { generatePlainText } from '@/lib/server-html';

interface ServiceCardProps {
  service: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    price?: number;
  };
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-none border bg-background transition-all hover:shadow-xl h-full">
      {/* Image Container */}
      <Link href={`/services/${service.slug}`} className="relative aspect-square overflow-hidden bg-muted rounded-none">
        <Image
          src={service.image}
          alt={service.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          quality={60}
          className="object-cover transition-all duration-700 group-hover:scale-110"
        />
        


        {/* Hover Action Overlay */}
        <div className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/5">
          <div className="bg-white text-black px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">
            Book Now
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col px-4 py-4">
        <div className="mb-2 h-14 md:h-12">
          <Link
            href={`/services/${service.slug}`}
            className="md:text-lg text-sm font-black text-foreground hover:text-primary transition-colors line-clamp-2 uppercase leading-tight tracking-tight"
          >
            {service.name}
          </Link>
        </div>

        <p className="text-muted-foreground text-[10px] md:text-xs line-clamp-2 mb-4 font-medium uppercase tracking-wider">
          {generatePlainText(service.description)}
        </p>

        <div className="mt-auto pt-4 border-t border-border/50">
          <Link href={`/services/${service.slug}`}>
            <Button className="w-full rounded-full h-11 sm:h-10 gap-2 font-bold uppercase text-[10px] sm:text-xs shadow-lg shadow-primary/10">
              <Calendar className="h-3.5 w-3.5 hidden sm:block" />
              <span className="hidden sm:inline">Book </span>
              Appointment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
