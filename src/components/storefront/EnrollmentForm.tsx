'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { User, Phone, Wallet, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
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

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^01\d{9}$/, 'Valid Bangladesh phone number is required (starts with 01, 11 digits)'),
  email: z.string().email('Valid email address is required'),
  paymentNumber: z.string().optional(),
});

export default function EnrollmentForm({ courseId, price, bkashNumber }: { courseId: string, price: number, bkashNumber: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      paymentNumber: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (price > 0 && !values.paymentNumber) {
      toast.error('Please provide the bKash number used for payment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          ...values,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        Swal.fire({
          title: price > 0 ? 'Enrollment Pending!' : 'Enrolled Successfully!',
          text: price > 0 
            ? 'We have received your payment details. Once verified, you will receive a confirmation message.' 
            : 'Welcome to the course! We will contact you with batch details soon.',
          icon: 'success',
          confirmButtonColor: 'var(--primary)',
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Failed to enroll';
        Swal.fire({
          title: 'Enrollment Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: 'var(--primary)',
        });
      }
    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-10 space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="h-10 w-10 text-emerald-500" />
          </div>
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter">Registration Received</h3>
        <p className="text-slate-400 text-sm">
          Thank you, <strong>{form.getValues('name')}</strong>. <br />
          {price > 0 
            ? 'Our team is verifying your bKash payment. You will get a confirmation call shortly.' 
            : 'Your seat is reserved. See you in the next batch!'}
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <User className="h-3 w-3 text-primary" /> Full Name
              </FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} className="h-12 rounded-xl bg-white/5 border-white/10 focus:bg-white/10 transition-all" />
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
              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Phone className="h-3 w-3 text-primary" /> Phone Number
              </FormLabel>
              <FormControl>
                <Input placeholder="01XXXXXXXXX" {...field} className="h-12 rounded-xl bg-white/5 border-white/10 focus:bg-white/10 transition-all" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Mail className="h-3 w-3 text-primary" /> Email Address
              </FormLabel>
              <FormControl>
                <Input placeholder="your.email@example.com" {...field} className="h-12 rounded-xl bg-white/5 border-white/10 focus:bg-white/10 transition-all" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {price > 0 && (
          <div className="pt-4 border-t border-white/10 mt-6">
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Payment Instructions</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Please Send Money <strong>৳{price}</strong> to our bKash Number: <br />
                <span className="text-base font-black text-white">{bkashNumber}</span>
              </p>
            </div>

            <FormField
              control={form.control}
              name="paymentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <Wallet className="h-3 w-3 text-primary" /> Payment (bKash) Number
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="The number you paid from" {...field} className="h-12 rounded-xl bg-white/5 border-white/10 focus:bg-white/10 transition-all" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-white hover:text-black transition-all font-black uppercase tracking-[0.2em] mt-4"
        >
          {isSubmitting ? 'Registering...' : (price > 0 ? 'Complete Registration' : 'Register Now')}
        </Button>
        
        <p className="text-[9px] text-center text-slate-500 uppercase font-bold tracking-widest mt-4">
          Safe & Secure Enrollment Process
        </p>
      </form>
    </Form>
  );
}
