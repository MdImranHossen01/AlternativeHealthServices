'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, X } from 'lucide-react';
import BookingForm from './BookingForm';

interface BookingModalProps {
  serviceId: string;
  serviceName: string;
  price?: number;
}

export function BookingModal({ serviceId, serviceName, price }: BookingModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-16 rounded-none bg-slate-900 text-white hover:bg-primary transition-all duration-500 font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 group">
          <Calendar className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
          Book Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-none p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary p-8 text-white relative">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter leading-tight">
              Schedule Your <br />
              <span className="opacity-70">{serviceName}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex items-center gap-4 text-xs font-bold uppercase tracking-widest opacity-80">
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> 9 AM - 10 PM</span>
            {price && <span className="flex items-center gap-1.5">৳{price}</span>}
          </div>
          
          {/* Close Button handled by DialogContent but we can style the top part */}
        </div>
        
        <div className="p-8 bg-background">
          <BookingForm serviceId={serviceId} serviceName={serviceName} />
          <p className="mt-6 text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
            Powered by Alternative Health Services Academy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
