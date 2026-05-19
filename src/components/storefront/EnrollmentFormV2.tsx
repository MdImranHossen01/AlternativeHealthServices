'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { User, CheckCircle2, Info, ArrowRight, Smartphone, Copy, Globe, Wallet } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Swal from 'sweetalert2';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const BD_PHONE_REGEX = /^(?:\+8801|01)[3-9]\d{8}$/;

const formSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100, 'Name is too long'),
  phone: z.string().trim().regex(BD_PHONE_REGEX, 'Invalid Bangladesh phone number').max(15, 'Phone number is too long'),
  paymentAmount: z.string().min(1, 'Amount is required').max(12, 'Invalid amount format'),
});

export default function EnrollmentFormV2({ 
  courseId, 
  courseName, 
  price, 
  manualPaymentConfig 
}: { 
  courseId: string, 
  courseName: string, 
  price: number, 
  manualPaymentConfig: any 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [manualDetails, setManualDetails] = useState({
    senderNumber: '',
    transactionId: ''
  });
  const [paymentDetailTab, setPaymentDetailTab] = useState<'phone' | 'trx'>('phone');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      paymentAmount: price !== undefined && price !== null ? price.toString() : '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedMethod) {
      toast.error('দয়া করে পেমেন্ট মেথড সিলেক্ট করুন');
      return;
    }

    const paymentDetail = paymentDetailTab === 'phone' ? manualDetails.senderNumber : `TrxID: ${manualDetails.transactionId}`;
    if (!paymentDetail.trim()) {
      toast.error('পেমেন্ট ভেরিফিকেশন তথ্য দিন');
      return;
    }

    const formattedPaymentNumber = `${selectedMethod.id.toUpperCase()} - ${paymentDetail}`;

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
          name: values.name,
          phone: values.phone,
          paymentNumber: formattedPaymentNumber,
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
          customClass: {
            popup: 'rounded-3xl',
            confirmButton: 'rounded-xl font-bold px-6 py-3',
          }
        });
        form.reset();
        setSelectedMethod(null);
        setManualDetails({ senderNumber: '', transactionId: '' });
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

  // Determine active method for left panel instructions (fallback to bkash configuration)
  const activeInstructionMethod = selectedMethod || {
    id: 'bkash',
    number: manualPaymentConfig?.bkash?.number || '01728-268550',
    qrCode: manualPaymentConfig?.bkash?.qrCode
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Left: Guidelines */}
      <div className="space-y-8 bg-slate-50 p-8 md:p-12 rounded-[2.5rem] border border-slate-200">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
            <Info className="h-3 w-3" /> Payment Instructions
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">
            {activeInstructionMethod.id === 'bkash' ? 'বিকাশ' : 
             activeInstructionMethod.id === 'nagad' ? 'নগদ' : 
             activeInstructionMethod.id === 'rocket' ? 'রকেট' : 
             activeInstructionMethod.id === 'banglaQr' ? 'Bangla QR' : 'মোবাইল'} পেমেন্ট গাইডলাইন
          </h2>
          <p className="text-slate-600 font-medium">ভর্তি নিশ্চিত করতে নিচের ধাপগুলো অনুসরণ করে পেমেন্ট সম্পন্ন করুন:</p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black shrink-0">১</div>
            <div>
              <p className="font-black uppercase text-xs tracking-wider mb-1">ধাপ ১</p>
              <p className="text-sm text-slate-600 font-medium">
                আপনার <strong>{activeInstructionMethod.id === 'bkash' ? 'বিকাশ' : activeInstructionMethod.id === 'nagad' ? 'নগদ' : activeInstructionMethod.id === 'rocket' ? 'রকেট' : 'মোবাইল'}</strong> অ্যাপে যান অথবা USSD ডায়াল করে <strong>"Send Money"</strong> অপশন সিলেক্ট করুন।
              </p>
            </div>
          </div>

          {activeInstructionMethod.id !== 'banglaQr' && (
            <div className="flex gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/20 scale-105">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-black shrink-0">২</div>
              <div className="flex-1">
                <p className="font-black uppercase text-xs tracking-wider mb-1 text-primary">
                  ধাপ ২ ({activeInstructionMethod.id === 'bkash' ? 'বিকাশ' : activeInstructionMethod.id === 'nagad' ? 'নগদ' : activeInstructionMethod.id === 'rocket' ? 'রকেট' : 'মোবাইল'} নাম্বার)
                </p>
                <div 
                  className="flex items-center justify-between gap-2 cursor-pointer group mt-1 bg-white p-2 rounded-xl border border-primary/10" 
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(activeInstructionMethod.number);
                      toast.success('Number Copied!', {
                        description: activeInstructionMethod.number,
                        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                      });
                    } catch (err) {
                      toast.error('Failed to copy');
                    }
                  }}
                >
                  <p className="text-lg font-black text-slate-900 tracking-widest group-hover:text-primary transition-colors">{activeInstructionMethod.number}</p>
                  <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-primary/10 text-slate-400 group-hover:text-primary transition-all">
                    <Copy className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase mt-1">Personal Number (Click to Copy)</p>
              </div>
            </div>
          )}

          {activeInstructionMethod.id === 'banglaQr' && (
            <div className="flex gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/20 scale-105">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-black shrink-0">২</div>
              <div className="flex-1">
                <p className="font-black uppercase text-xs tracking-wider mb-1 text-primary">ধাপ ২ (Bangla QR)</p>
                {activeInstructionMethod.qrCode ? (
                  <div className="mt-2 flex flex-col items-center">
                    <img src={activeInstructionMethod.qrCode} alt="Bangla QR" className="h-32 w-32 object-contain border rounded-lg bg-white p-1" />
                    <p className="text-xs text-slate-500 font-bold uppercase mt-1">Scan to Pay</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-bold uppercase mt-1">Scan QR code using bank/MFS app to pay</p>
                )}
              </div>
            </div>
          )}

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
              <p className="text-sm text-slate-600 font-medium">পেমেন্ট সফল হলে ডানপাশের ফর্ম থেকে পেমেন্ট মেথড সিলেক্ট করে তথ্য ভেরিফাই করুন।</p>
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

            <FormField
              control={form.control}
              name="paymentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-500">
                    <Wallet className="h-3 w-3" /> পেমেন্ট অ্যামাউন্ট (৳)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" readOnly {...field} className="h-14 rounded-xl bg-slate-100 border-slate-200 font-black text-primary cursor-not-allowed" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-500">
                <Wallet className="h-3 w-3" /> পেমেন্ট মেথড সিলেক্ট করুন
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['bkash', 'nagad', 'rocket', 'banglaQr'].map((method) => {
                  const config = manualPaymentConfig?.[method];
                  if (!config?.active) return null;
                  const isSelected = selectedMethod?.id === method;
                  return (
                    <div 
                      key={method} 
                      onClick={() => {
                        setSelectedMethod({ id: method, ...config });
                        setPaymentDetailTab('phone');
                        setShowPaymentModal(true);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 hover:bg-muted/50 ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-muted'
                      }`}
                    >
                      <div className="h-10 w-10 flex items-center justify-center">
                        {method === 'banglaQr' ? (
                          <Globe className="h-8 w-8 text-primary" />
                        ) : (
                          <img src={`/assets/${method}logo.webp`} alt={method} className="h-full w-auto object-contain" />
                        )}
                      </div>
                      <p className="text-[10px] font-bold uppercase">{method === 'banglaQr' ? 'Bangla QR' : method}</p>
                      {isSelected && (
                        <div className="text-[8px] font-bold text-primary flex items-center gap-1 mt-1">
                          <CheckCircle2 className="h-2 w-2" /> Details Added
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {!selectedMethod && (
                <p className="text-[10px] text-destructive font-black uppercase tracking-wider animate-pulse">
                  * পেমেন্ট সম্পন্ন করতে যেকোনো একটি অপশন সিলেক্ট করুন
                </p>
              )}
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

      {/* Manual Payment Verification Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[90vh]">
          <DialogHeader className="py-4 px-6 bg-gradient-to-br from-primary to-primary/80 text-white relative shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white rounded-xl p-1.5 shadow-md shrink-0 flex items-center justify-center">
                {selectedMethod?.id === 'banglaQr' ? (
                  <Globe className="h-6 w-6 text-primary" />
                ) : (
                  <img src={`/assets/${selectedMethod?.id}logo.webp`} alt={selectedMethod?.id} className="h-full w-auto object-contain" />
                )}
              </div>
              <div className="text-left">
                <DialogTitle className="text-base md:text-lg font-black uppercase tracking-tight">
                  {selectedMethod?.id === 'banglaQr' ? 'Pay via Bangla QR' : `Pay via ${selectedMethod?.id}`}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-h-[60vh] pr-2">
            {/* Payment Info */}
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 space-y-3">
              {selectedMethod?.id !== 'banglaQr' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Send Money To</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold text-[9px] py-0.5 px-1.5">Personal Number</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <p className="text-lg font-black tracking-widest text-slate-900 dark:text-zinc-50 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-primary/10 flex-1 text-center select-all">
                      {selectedMethod?.number}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 rounded-lg text-[10px] font-bold border hover:bg-primary hover:text-white transition-all shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedMethod?.number);
                        toast.success('Number copied to clipboard!');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </>
              )}
              
              {(selectedMethod?.qrCode || selectedMethod?.id === 'banglaQr') && (
                <div className="flex flex-col items-center gap-1.5 pt-2 border-t border-primary/10">
                  <p className="text-[9px] font-bold uppercase opacity-40">Scan QR Code to Pay</p>
                  <div className="p-1.5 bg-white rounded-lg shadow-sm border border-primary/10">
                    <img src={selectedMethod?.qrCode || '/assets/placeholder-qr.png'} alt="QR" className="h-32 w-32 object-contain" />
                  </div>
                </div>
              )}
            </div>

            {/* Instruction Panel */}
            <div className="bg-slate-50 dark:bg-zinc-950 rounded-xl p-3 border border-slate-200 dark:border-zinc-800 space-y-1.5">
              <p className="text-[10px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider">পেমেন্ট নির্দেশিকা (পড়ুন):</p>
              <div className="max-h-24 overflow-y-auto pr-1 space-y-1 text-[9px] leading-relaxed text-slate-600 dark:text-zinc-400 font-medium">
                <p>১. আপনার <strong>{selectedMethod?.id === 'bkash' ? 'বিকাশ' : selectedMethod?.id === 'nagad' ? 'নগদ' : selectedMethod?.id === 'rocket' ? 'রকেট' : 'মোবাইল'}</strong> অ্যাপে যান অথবা USSD ডায়াল করে <strong>"Send Money"</strong> অপশন সিলেক্ট করুন।</p>
                {selectedMethod?.id !== 'banglaQr' ? (
                  <p>২. উপরে দেওয়া <strong>Personal</strong> নম্বরটি কপি করে প্রাপক হিসেবে দিন।</p>
                ) : (
                  <p>২. উপরে দেওয়া <strong>Bangla QR</strong> কোডটি আপনার ব্যাংক বা পেমেন্ট অ্যাপ দিয়ে স্ক্যান করুন।</p>
                )}
                <p>৩. মোট পেমেন্ট অ্যামাউন্ট <strong>৳{price}</strong> সেন্ড মানি করুন।</p>
                <p>৪. সফলভাবে টাকা পাঠানোর পর নিচের ট্যাব থেকে <strong>মোবাইল নম্বর</strong> অথবা <strong>TrxID</strong> যেকোনো একটি তথ্য দিয়ে পেমেন্ট নিশ্চিত করুন।</p>
              </div>
            </div>

            {/* Selection Tabs */}
            <div className="flex border-b border-slate-200 dark:border-zinc-800 mt-2">
              <button
                type="button"
                onClick={() => setPaymentDetailTab('phone')}
                className={`flex-1 pb-1.5 text-[11px] font-bold text-center border-b-2 transition-all ${
                  paymentDetailTab === 'phone'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                {selectedMethod?.id === 'bkash' ? 'বিকাশ' : selectedMethod?.id === 'nagad' ? 'নগদ' : selectedMethod?.id === 'rocket' ? 'রকেট' : 'মোবাইল'} নম্বর দিয়ে
              </button>
              <button
                type="button"
                onClick={() => setPaymentDetailTab('trx')}
                className={`flex-1 pb-1.5 text-[11px] font-bold text-center border-b-2 transition-all ${
                  paymentDetailTab === 'trx'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                ট্রানজেকশন আইডি (TrxID) দিয়ে
              </button>
            </div>

            {/* Verification Field */}
            <div className="space-y-3 pt-1">
              {paymentDetailTab === 'phone' ? (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase opacity-60">আপনার {selectedMethod?.id === 'bkash' ? 'বিকাশ' : selectedMethod?.id === 'nagad' ? 'নগদ' : selectedMethod?.id === 'rocket' ? 'রকেট' : 'মোবাইল'} নম্বর</Label>
                  <Input 
                    placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন (যেমন: 017XXXXXXXX)" 
                    value={manualDetails.senderNumber}
                    onChange={(e) => setManualDetails({...manualDetails, senderNumber: e.target.value})}
                    className="h-10 rounded-lg text-xs focus:ring-primary/20 bg-background"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase opacity-60">ট্রানজেকশন আইডি (TrxID)</Label>
                  <Input 
                    placeholder="যেমন: 8N7A6D5C" 
                    value={manualDetails.transactionId}
                    onChange={(e) => setManualDetails({...manualDetails, transactionId: e.target.value.toUpperCase()})}
                    className="h-10 rounded-lg text-xs focus:ring-primary/20 bg-background"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 bg-muted/20 border-t flex flex-row gap-3 shrink-0">
            <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="rounded-full h-10 flex-1 font-bold text-xs bg-background">বাতিল করুন</Button>
            <Button 
              disabled={
                paymentDetailTab === 'phone'
                  ? !manualDetails.senderNumber.trim()
                  : !manualDetails.transactionId.trim()
              }
              onClick={async () => {
                const isValid = await form.trigger();
                if (isValid) {
                  setShowPaymentModal(false);
                  toast.success(`${selectedMethod?.id.toUpperCase()} details saved!`);
                  await form.handleSubmit(onSubmit)();
                } else {
                  setShowPaymentModal(false);
                  toast.error('দয়া করে শিক্ষার্থীর নাম ও মোবাইল নাম্বার সম্পূর্ণ করুন!');
                }
              }} 
              className="rounded-full h-10 flex-1 font-black uppercase tracking-widest text-xs shadow-md shadow-primary/10"
            >
              পেমেন্ট নিশ্চিত করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
