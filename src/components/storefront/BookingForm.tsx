'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, User, Phone, CheckCircle2 } from 'lucide-react';
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
  phone: z.string().min(11, 'Valid phone number is required'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().refine((t) => {
    if (!/^\d{1,2}:\d{2}$/.test(t)) return false;
    const [h, m] = t.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return false;
    if (m < 0 || m > 59) return false;
    return h >= 9 && h <= 22;
  }, 'Time must be between 9:00 AM and 10:00 PM'),
});

export default function BookingForm({ serviceId, serviceName }: { serviceId: string, serviceName: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          ...values,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        Swal.fire({
          title: 'Appointment Booked!',
          text: `Your appointment for ${serviceName} has been received. We will contact you soon.`,
          icon: 'success',
          confirmButtonColor: 'var(--primary)',
        });
      } else {
        throw new Error('Failed to book appointment');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-12 space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <CheckCircle2 className="h-20 w-20 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tighter">Booking Confirmed</h3>
        <p className="text-muted-foreground">
          Thank you, <strong>{form.getValues('name')}</strong>. <br />
          Your appointment is scheduled for {form.getValues('date')} at {form.getValues('time')}.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            form.reset();
            setIsSuccess(false);
          }}
          className="rounded-full px-8"
        >
          Book Another
        </Button>
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
              <FormLabel className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <User className="h-3 w-3" /> Full Name
              </FormLabel>
              <FormControl>
                <Input placeholder="your name" {...field} className="rounded-none bg-background border-muted" />
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
              <FormLabel className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Phone className="h-3 w-3" /> Phone Number
              </FormLabel>
              <FormControl>
                <Input placeholder="017XXXXXXXX" {...field} className="rounded-none bg-background border-muted" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" /> Date
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    {...field}
                    className="rounded-none bg-background border-muted"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Time
                </FormLabel>
                <FormControl>
                  <Input type="time" {...field} className="rounded-none bg-background border-muted" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 rounded-none bg-primary hover:scale-[1.02] transition-all font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
        >
          {isSubmitting ? 'Processing...' : 'Confirm Appointment'}
        </Button>
      </form>
    </Form>
  );
}
