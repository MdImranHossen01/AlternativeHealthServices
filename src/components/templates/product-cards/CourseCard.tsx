'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface CourseCardProps {
  course: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    price?: number;
    instructor?: string;
    createdAt?: string;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col bg-card border overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 border-border/50 rounded-none h-full"
    >
      <div className="aspect-[16/10] overflow-hidden relative bg-muted">
        {course.image ? (
          <Image
            src={course.image}
            alt={course.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}
        
        {/* Pricing Badge */}
        <div className="absolute top-4 right-4 z-10">
          {course.price !== undefined && course.price !== null ? (
            <div className="bg-primary text-white px-4 py-1 rounded-full text-xs font-black shadow-lg">
              ৳{course.price}
            </div>
          ) : (
            <div className="bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-black shadow-lg">
              FREE
            </div>
          )}
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
          <GraduationCap className="h-3.5 w-3.5 text-primary" />
          {course.instructor || 'Academy Expert'}
        </div>
        
        <div className="h-14 mb-4">
          <h3 className="text-xl font-black leading-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 uppercase">
            {course.name}
          </h3>
        </div>

        <div className="h-[4.5rem] mb-6">
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
            {course.description}
          </p>
        </div>

        <div className="pt-4 border-t border-border/50">
          <div className="w-full h-10 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 group-hover:bg-slate-900 transition-colors transition-all duration-300">
            ভর্তি হোন <ArrowRight className="ml-2 h-3 w-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}
