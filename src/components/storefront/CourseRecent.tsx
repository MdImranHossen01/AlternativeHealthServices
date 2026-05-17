'use client';

import Link from 'next/link';
import { BookOpen, ArrowRight, GraduationCap, Calendar } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { generatePlainText } from '@/lib/server-html';

interface Course {
  _id: string;
  name: string;
  slug: string;
  image?: string | null;
  description: string;
  price?: number;
  instructor?: string;
  createdAt: string;
}

interface CourseRecentProps {
  courses: Course[];
}

export function CourseRecent({ courses }: CourseRecentProps) {
  if (!courses || courses.length === 0) return null;

  const course = courses[0];

  return (
    <section className="py-12 bg-muted/20 border-y border-muted/30">
      <div className="container mx-auto px-4 ">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-12 gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">
              Our Medical <span className="text-primary italic">Academy</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Professional training and certifications for future healthcare providers.
            </p>
          </div>
          <Button asChild variant="default" className="rounded-full font-bold group">
            <Link href="/courses">
              View All Courses
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Single Course — Split Layout */}
        <Link
          href={`/courses/${course.slug}`}
          className="group grid grid-cols-1 lg:grid-cols-2 overflow-hidden border bg-card hover:shadow-2xl transition-all duration-500"
        >
          {/* Left — Image */}
          <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden bg-muted min-h-[300px]">
            {course.image ? (
              <Image
                src={course.image}
                alt={course.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                <BookOpen className="h-16 w-16 opacity-20" />
              </div>
            )}
            {/* Overlay gradient on hover */}
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Price Badge */}
            <div className="absolute top-4 left-4 z-20">
               <div className={cn(
                 "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/10",
                 (course.price !== undefined && course.price !== null) ? "bg-primary text-white" : "bg-emerald-500 text-white"
               )}>
                 {(course.price !== undefined && course.price !== null) ? `৳${course.price}` : 'Free Course'}
               </div>
            </div>
          </div>

          {/* Right — Content */}
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 space-y-6">
            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              {course.instructor || 'Senior Practitioner'}
            </div>

            <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors duration-300 uppercase">
              {course.name}
            </h3>

            <p className="text-muted-foreground text-base leading-relaxed line-clamp-3">
              {generatePlainText(course.description)}
            </p>

            <div className="pt-2">
              <span className={cn(
                buttonVariants({ size: 'default', variant: 'default' }),
                "rounded-full font-bold group/btn inline-flex items-center gap-2 pointer-events-none"
              )}>
                ভর্তি হোন
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

