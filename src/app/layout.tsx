import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Poppins,
  Roboto,
  Montserrat,
  Playfair_Display,
  Outfit,
  Lora,
  Manrope,
  Urbanist,
  Orbitron,
  Open_Sans,
  Lato,
  Oswald,
  Raleway,
  Nunito,
  Ubuntu,
  Merriweather,
  Kanit,
  Quicksand,
  Josefin_Sans,
  Syne,
  Space_Grotesk,
  Jost
} from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";
import "./prosemirror.css";
import Script from "next/script";
import { PWARegistry } from "@/components/pwa-registry";
import GoogleTagManager from "./components/GoogleTagManager";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { generateOrganizationSchema } from "@/lib/seo";
import FacebookPixel from "./components/FacebookPixel";
import SubscriptionBlocker from "./components/SubscriptionBlocker";
import { headers } from "next/headers";
import { getCachedSettings } from "@/lib/data-fetching";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});
const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

const josefinSans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || 'localhost';
  const baseUrl = `https://${hostname}`;

  try {
    const settings = await getCachedSettings(hostname);

    if (!settings) throw new Error("No settings found");

    return {
      metadataBase: new URL(baseUrl),
      title: {
        default: settings.metaTitle || settings.brandName || "Alternative Health Services",
        template: `%s | ${settings.brandName || "Alternative Health Services"}`,
      },
      description: settings.metaDescription || settings.brandName || "Your ultimate destination for quality products.",
      manifest: '/manifest.json',
      icons: {
        icon: settings.logoUrl || '/favicon.ico',
        shortcut: settings.logoUrl || '/favicon.ico',
        apple: settings.logoUrl || '/icon-512x512.png',
      },
      appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: settings.brandName || "Alternative Health Services",
      },
      formatDetection: {
        telephone: false,
      },
      openGraph: {
        title: settings.metaTitle || settings.brandName || "Alternative Health Services",
        description: settings.metaDescription || settings.brandName || "Your ultimate destination for quality products.",
        url: baseUrl,
        siteName: settings.brandName || "Alternative Health Services",
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: settings.metaTitle || settings.brandName || "Alternative Health Services",
        description: settings.metaDescription || settings.brandName || "Your ultimate destination for quality products.",
      },
      verification: {
        google: settings.searchConsoleMeta,
      },
      alternates: {
        canonical: './',
      },
      other: {
        ...(settings.facebookDomainVerification
          ? { "facebook-domain-verification": settings.facebookDomainVerification }
          : {}),
      },
    };
  } catch (error) {
    return {
      title: "Alternative Health Services",
      description: "Your ultimate destination for quality products.",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const hostname = headersList.get('host') || 'localhost';
  const pathname = headersList.get('x-pathname') || '';
  const settings = await getCachedSettings(hostname);

  let jsonLd = null;
  try {
    if (settings) {
      jsonLd = await generateOrganizationSchema(settings);
    }
  } catch (e) {
    console.error("Error generating JSON-LD structured data", e);
  }

  // Subscription Enforcement Logic
  const sub = settings?.saasSubscription;
  // If sub is missing, default to not expired (allow access by default)
  const isExpired = sub ? (sub.status !== 'Active' || (sub.expiryDate && new Date(sub.expiryDate).getTime() < new Date().getTime())) : false;

  // Allow admin and auth routes to bypass blocker so admin can login and fix the subscription
  const isAdminRoute = pathname.toLowerCase().startsWith('/admin');
  const isAuthRoute =
    pathname.toLowerCase().includes('/login') ||
    pathname.toLowerCase().includes('/register') ||
    pathname.toLowerCase().includes('/api/auth') ||
    pathname.toLowerCase().includes('/forgot-password') ||
    pathname.toLowerCase().includes('/reset-password');

  const isBypassRoute = isAdminRoute || isAuthRoute || pathname.toLowerCase().includes('system-design');

  const showBlocker = isExpired && !isBypassRoute;

  // Security Helper: Validate GA ID format (G-XXXX or UA-XXXX)
  const isValidGAId = (id?: string) => id ? /^(G-[A-Z0-9]+|UA-[0-9-]+)$/i.test(id) : false;
  const gaId = settings?.googleAnalyticsId;

  const theme = settings?.uiTemplates?.theme;
  const themeClass = (theme && theme !== 'default') ? `theme-${theme.toLowerCase()}` : '';

  const bodyFontName = settings?.uiTemplates?.bodyFont || 'inter';
  const logoFontName = settings?.uiTemplates?.logoFont || 'orbitron';

  // Font variable mapping
  const fontMap: Record<string, string> = {
    'geist-sans': geistSans.variable,
    'geist-mono': geistMono.variable,
    'inter': inter.variable,
    'poppins': poppins.variable,
    'roboto': roboto.variable,
    'montserrat': montserrat.variable,
    'playfair': playfair.variable,
    'outfit': outfit.variable,
    'lora': lora.variable,
    'manrope': manrope.variable,
    'urbanist': urbanist.variable,
    'orbitron': orbitron.variable,
    'open-sans': openSans.variable,
    'lato': lato.variable,
    'oswald': oswald.variable,
    'raleway': raleway.variable,
    'nunito': nunito.variable,
    'ubuntu': ubuntu.variable,
    'merriweather': merriweather.variable,
    'kanit': kanit.variable,
    'quicksand': quicksand.variable,
    'josefin-sans': josefinSans.variable,
    'syne': syne.variable,
    'space-grotesk': spaceGrotesk.variable,
    'jost': jost.variable,
  };

  // Only load the required font variables
  const activeBodyFontVar = fontMap[bodyFontName] || inter.variable;
  const activeLogoFontVar = fontMap[logoFontName] || orbitron.variable;
  
  // Base fonts that are always useful (e.g. for fallback or UI)
  const baseFonts = `${geistSans.variable} ${geistMono.variable}`;
  
  const fontClass = `font-${bodyFontName}`;
  const logoFontClass = `logo-font-${logoFontName}`;

  return (
    <html 
      lang="en" 
      className={`${baseFonts} ${activeBodyFontVar} ${activeLogoFontVar} ${themeClass} ${fontClass} ${logoFontClass}`} 
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to important origins */}
        <link rel="preconnect" href="https://i.ibb.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://i.pravatar.cc" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical LCP assets */}
        <link rel="preload" as="image" href="/logo.webp" fetchPriority="high" />
        
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body
        className="antialiased min-h-full flex flex-col overflow-x-hidden font-sans"
        suppressHydrationWarning
      >
        <PWARegistry />
        {jsonLd && (
          <Script
            id="json-ld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
        <Providers settings={settings}>
          {showBlocker && <SubscriptionBlocker brandName={settings?.brandName || 'Store'} />}
          {settings?.googleTagManagerId && (
            <GoogleTagManager gtmId={settings.googleTagManagerId} />
          )}

          <Suspense fallback={null}>
            <FacebookPixel
              pixelId={settings?.metaPixelId || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}
            />
          </Suspense>

          {isValidGAId(gaId) && (
            <>
              <Script
                id="google-analytics"
                strategy="lazyOnload"
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              />
              <Script
                id="ga-init"
                strategy="lazyOnload"
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${gaId}');
                  `,
                }}
              />
            </>
          )}

          <SmoothScroll>
            {children}
            <ScrollProgress />
          </SmoothScroll>
        </Providers>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}

