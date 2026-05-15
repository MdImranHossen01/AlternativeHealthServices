'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { User, Phone, Wallet, CheckCircle2, Info, ArrowRight, Smartphone, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Swal from 'sweetalert2';

const BD_PHONE_REGEX = /^(?:\+8801|01)[3-9]\d{8}$/;

const formSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100, 'Name is too long'),
  phone: z.string().trim().regex(BD_PHONE_REGEX, 'Invalid Bangladesh phone number').max(15, 'Phone number is too long'),
  paymentAmount: z.string().min(1, 'Amount is required').max(12, 'Invalid amount format'),
  paymentNumber: z.string().trim().regex(BD_PHONE_REGEX, 'Invalid bKash number').max(15, 'Number is too long'),
});

export default function EnrollmentFormV2({ courseId, courseName, price, bkashNumber }: { courseId: string, courseName: string, price: number, bkashNumber: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      paymentAmount: price !== undefined && price !== null ? price.toString() : '',
      paymentNumber: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Basic price match check before submission
    const submittedPrice = parseFloat(values.paymentAmount);
    if (isNaN(submittedPrice) || submittedPrice < 1) {
      toast.error('Invalid payment amount');
      return;
    }

    setIsSubmitting(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          ...values,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        Swal.fire({
          title: 'আবেদন জমা হয়েছে!',
          text: `আপনার ${courseName} কোর্সে ভর্তির আবেদনটি সফলভাবে গৃহীত হয়েছে। আমরা দ্রুত পেমেন্ট ভেরিফাই করে আপনার সাথে যোগাযোগ করবো।`,
          icon: 'success',
          confirmButtonColor: 'var(--primary)',
        });
        form.reset();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please check your internet and try again.');
      } else {
        toast.error(error.message || 'Error submitting enrollment. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Left: bKash Guidelines */}
      <div className="space-y-8 bg-slate-50 p-8 md:p-12 rounded-[2.5rem] border border-slate-200">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
            <Info className="h-3 w-3" /> Payment Instructions
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">বিকাশ পেমেন্ট গাইডলাইন</h2>
          <p className="text-slate-600 font-medium">ভর্তি নিশ্চিত করতে নিচের ধাপগুলো অনুসরণ করে পেমেন্ট সম্পন্ন করুন:</p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black shrink-0">১</div>
            <div>
              <p className="font-black uppercase text-xs tracking-wider mb-1">ধাপ ১</p>
              <p className="text-sm text-slate-600 font-medium">আপনার বিকাশ অ্যাপ অথবা *২৪৭# ডায়াল করে "Send Money" অপশন সিলেক্ট করুন।</p>
            </div>
          </div>

          <div className="flex gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/20 scale-105">
            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-black shrink-0">২</div>
            <div>
              <p className="font-black uppercase text-xs tracking-wider mb-1 text-primary">ধাপ ২ (বিকাশ নাম্বার)</p>
              <div 
                className="flex items-center gap-2 cursor-pointer group" 
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(bkashNumber);
                    toast.success('bKash Number Copied!', {
                      description: bkashNumber,
                      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                    });
                  } catch (err) {
                    toast.error('Failed to copy', {
                      description: 'Please copy the number manually.',
                    });
                  }
                }}
              >
                <p className="text-lg font-black text-slate-900 tracking-widest group-hover:text-primary transition-colors">{bkashNumber}</p>
                <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-primary/10 text-slate-400 group-hover:text-primary transition-all">
                  <Copy className="h-4 w-4" />
                </div>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase mt-1">Personal bKash Number (Click to Copy)</p>
            </div>
          </div>

          <div className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black shrink-0">৩</div>
            <div>
              <p className="font-black uppercase text-xs tracking-wider mb-1">ধাপ ৩</p>
              <p className="text-sm text-slate-600 font-medium">নির্ধারিত পেমেন্ট অ্যামাউন্ট (<span className="text-primary font-black">৳{price}</span>) সেন্ড মানি করুন।</p>
            </div>
          </div>

          <div className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black shrink-0">৪</div>
            <div>
              <p className="font-black uppercase text-xs tracking-wider mb-1">ধাপ ৪</p>
              <p className="text-sm text-slate-600 font-medium">পেমেন্ট সফল হলে ডানপাশের ফর্মটি পূরণ করে সাবমিট করুন।</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Enrollment Form */}
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-500">
                    <User className="h-3 w-3" /> শিক্ষার্থীর নাম
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="শিক্ষার্থীর পূর্ণ নাম" {...field} className="h-14 rounded-xl bg-slate-50 border-slate-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-500">
                    <Smartphone className="h-3 w-3" /> শিক্ষার্থীর মোবাইল নাম্বার
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="017XXXXXXXX" {...field} className="h-14 rounded-xl bg-slate-50 border-slate-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="paymentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-500">
                      <Wallet className="h-3 w-3" /> পেমেন্ট অ্যামাউন্ট (৳)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-14 rounded-xl bg-slate-50 border-slate-200 font-black text-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-500">
                      <Wallet className="h-3 w-3" /> বিকাশ নাম্বার (যেটি থেকে পাঠিয়েছেন)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="01XXXXXXXXX" {...field} className="h-14 rounded-xl bg-slate-50 border-slate-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-16 rounded-2xl bg-slate-900 text-white hover:bg-primary transition-all font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-300"
              >
                {isSubmitting ? 'প্রসেস হচ্ছে...' : 'ভর্তি নিশ্চিত করুন'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
