'use client';

import React from 'react';
import { 
  Link as LinkIcon, 
  Check,
  Share2
} from 'lucide-react';
import { Facebook, Twitter, Whatsapp } from '@/components/ui/social-icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface SocialShareProps {
  title: string;
  url?: string;
}

export function SocialShare({ title, url }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use current window location if URL is not provided
  const shareUrl = typeof window !== 'undefined' ? (url || window.location.href) : '';
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Facebook',
      icon: <Facebook size={16} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-[#1877F2] hover:text-white',
    },
    {
      name: 'WhatsApp',
      icon: <Whatsapp size={16} />,
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:bg-[#25D366] hover:text-white',
    },
    {
      name: 'Twitter',
      icon: <Twitter size={16} />,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'hover:bg-[#1DA1F2] hover:text-white',
    },
  ];

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for non-secure contexts or older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          toast.success('Link copied to clipboard!');
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          toast.error('Failed to copy link');
        }
        document.body.removeChild(textArea);
      }
    } catch (error: any) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy link');
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        <Share2 className="h-3 w-3" /> Share with others
      </div>
      <div className="flex flex-wrap gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`h-10 w-10 flex items-center justify-center rounded-full border border-muted/50 bg-background transition-all duration-300 ${link.color} hover:scale-110 hover:shadow-lg`}
            title={`Share on ${link.name}`}
          >
            {link.icon}
          </a>
        ))}
        <button
          onClick={copyToClipboard}
          className={`h-10 w-10 flex items-center justify-center rounded-full border border-muted/50 bg-background transition-all duration-300 hover:bg-slate-900 hover:text-white hover:scale-110 hover:shadow-lg ${copied ? 'bg-emerald-500 text-white border-emerald-500' : ''}`}
          title="Copy Link"
        >
          {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
