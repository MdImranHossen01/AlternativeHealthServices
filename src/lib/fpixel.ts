"use client";

/**
 * Facebook Pixel & Conversions API Tracking Utility
 * Provides a unified way to track events on both client and server with deduplication.
 */

declare global {
  interface Window {
    fbq?: (
      action: "track" | "trackCustom",
      eventName: string,
      data?: Record<string, unknown>,
      options?: { eventID: string }
    ) => void;
    _fbq?: any;
  }
}

/**
 * Generates a unique event ID with fallback for insecure or older browsers.
 */
const generateEventId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  
  // Fallback for non-secure contexts or older browsers
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    return (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }
  
  // Last resort
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const fbEvent = (
  eventName: string,
  customData: Record<string, unknown> = {},
  userData: { 
    em?: string; 
    ph?: string; 
    fn?: string; 
    ln?: string;
    ct?: string;
    st?: string;
    zp?: string;
    country?: string;
  } = {},
  providedEventId?: string
) => {
  const eventId = providedEventId || generateEventId();

  // 1. Browser Pixel Tracking
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    const standardEvents = [
      "AddPaymentInfo", "AddToCart", "AddToWishlist", "CompleteRegistration",
      "Contact", "CustomizeProduct", "Donate", "FindLocation",
      "InitiateCheckout", "Lead", "Purchase", "Schedule",
      "Search", "StartTrial", "SubmitApplication", "Subscribe", "ViewContent", "PageView"
    ];

    if (standardEvents.includes(eventName)) {
      window.fbq("track", eventName, customData, { eventID: eventId });
    } else {
      window.fbq("trackCustom", eventName, customData, { eventID: eventId });
    }
  }

  // 2. Server-side (CAPI) Tracking
  // Only send CAPI if we are in the browser
  if (typeof window !== "undefined") {
    fetch("/api/facebook/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventUrl: window.location.href,
        userAgent: navigator.userAgent,
        eventId,
        userData, // Hashing is handled server-side for maximum privacy & accuracy
        customData,
      }),
    }).catch(() => {
       /* Fail silently to not disrupt UX */
    });
  }

  return eventId;
};
