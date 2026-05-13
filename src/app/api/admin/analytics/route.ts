import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { google } from 'googleapis';
import { headers } from 'next/headers';
import { getCachedSettings } from '@/lib/data-fetching';
import { getTenantDomain } from '@/lib/tenant';

export async function GET(request: Request) {
  console.log('Main Analytics API Called');
  let domain = 'unknown';
  let propertyId = 'unknown';

  try {
    const session = await auth();
    if (!session || !(['admin', 'super_admin'].includes((session?.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const rangeDays = range === '7d' ? 7 : (range === '90d' ? 90 : 30);

    // Parse date range
    let startDate = '30daysAgo';
    if (range === '7d') startDate = '7daysAgo';
    if (range === '90d') startDate = '90daysAgo';

    // Fetch store-specific settings based on hostname
    domain = await getTenantDomain() || 'unknown';

    if (!domain || domain === 'unknown') {
      return NextResponse.json({ message: 'Tenant domain is missing' }, { status: 400 });
    }

    // Security: Verify that the admin has access to this domain
    const isSuperAdmin = (session.user as any).role === 'super_admin';
    const userDomain = (session.user as any).domain;

    const cleanUserDomain = userDomain?.replace('www.', '').toLowerCase();
    const cleanDomain = domain?.replace('www.', '').toLowerCase();

    if (!isSuperAdmin && cleanUserDomain !== cleanDomain) {
      console.warn('Tenant Analytics Access Blocked:', { cleanUserDomain, cleanDomain });
      return NextResponse.json({ message: 'Unauthorized access to this tenant' }, { status: 403 });
    }

    const settings = await getCachedSettings(domain);

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, '');

    // Prioritize store-specific IDs from database, fallback to global envs
    propertyId = settings?.googleAnalyticsId || process.env.GOOGLE_GA4_PROPERTY_ID || 'unknown';
    
    // siteUrl is critical for Search Console. Prioritize store-specific settings.
    const siteUrl = settings?.googleSearchConsoleId || 
                    process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || 
                    (settings?.domain ? `https://${settings.domain}/` : null);

    console.log('Main Analytics Execution State:', {
      domain,
      hasSettings: !!settings,
      hasEmail: !!clientEmail,
      propertyId,
      siteUrl,
      userRole: (session.user as any).role,
      userDomain: (session.user as any).domain
    });

    const analyticsClient = new BetaAnalyticsDataClient({
      credentials: { client_email: clientEmail, private_key: privateKey },
      transport: 'rest', // Force REST transport
    });

    const authClient = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });

    // --- FETCH DATA PARALLEL (WITH RESILIENCE) ---
    
    const fetchGA4 = async () => {
      try {
        const [response] = await analyticsClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate, endDate: 'today' }],
          dimensions: [
            { name: 'date' },
            { name: 'deviceCategory' },
            { name: 'country' },
            { name: 'sessionDefaultChannelGroup' },
            { name: 'newVsReturning' }
          ],
          metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'averageSessionDuration' }
          ],
          orderBys: [{ dimension: { dimensionName: 'date' } }]
        });
        return response;
      } catch (err: any) {
        console.error('GA4 Main Report Error:', err.message);
        return null;
      }
    };

    const fetchPages = async () => {
      try {
        const [response] = await analyticsClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate, endDate: 'today' }],
          dimensions: [{ name: 'pageTitle' }, { name: 'pagePath' }],
          metrics: [{ name: 'screenPageViews' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 8
        });
        return response;
      } catch (err: any) {
        console.error('GA4 Pages Report Error:', err.message);
        return null;
      }
    };

    const fetchSearchTrends = async () => {
      if (!siteUrl) return null;
      try {
        const response = await searchconsole.searchanalytics.query({
          siteUrl,
          requestBody: {
            startDate: formatDate(rangeDays),
            endDate: formatDate(0),
            dimensions: ['date'],
            rowLimit: 100
          }
        });
        return response.data;
      } catch (err: any) {
        console.error('Search Console Trends Error:', err.message);
        return null;
      }
    };

    const fetchSearchQueries = async () => {
      if (!siteUrl) return null;
      try {
        const response = await searchconsole.searchanalytics.query({
          siteUrl,
          requestBody: {
            startDate: formatDate(rangeDays),
            endDate: formatDate(0),
            dimensions: ['query'],
            rowLimit: 8
          }
        });
        return response.data;
      } catch (err: any) {
        console.error('Search Console Queries Error:', err.message);
        return null;
      }
    };

    const fetchRealtime = async () => {
      try {
        const [response] = await analyticsClient.runRealtimeReport({
          property: `properties/${propertyId}`,
          metrics: [{ name: 'activeUsers' }]
        });
        return response;
      } catch (err: any) {
        console.error('GA4 Realtime Error:', err.message);
        return null;
      }
    };

    const [gaData, pagesData, scData, queriesData, realtimeData] = await Promise.all([
      fetchGA4(),
      fetchPages(),
      fetchSearchTrends(),
      fetchSearchQueries(),
      fetchRealtime()
    ]);

    const activeUsersNow = parseInt(realtimeData?.rows?.[0]?.metricValues?.[0]?.value || '0', 10);

    // Maps for aggregation
    const visitorTrendsMap = new Map();
    const devices = { desktop: 0, mobile: 0, tablet: 0 };
    const countriesMap = new Map();
    const sourcesMap = new Map();
    const retention = { new: 0, returning: 0 };
    let totalDurationSeconds = 0;
    let totalSessionsCount = 0;

    gaData?.rows?.forEach(row => {
      const date = row.dimensionValues?.[0].value;
      const device = row.dimensionValues?.[1].value?.toLowerCase();
      const country = row.dimensionValues?.[2].value;
      const source = row.dimensionValues?.[3].value;
      const userType = row.dimensionValues?.[4].value?.toLowerCase();

      const users = parseInt(row.metricValues?.[0].value || '0');
      const sessions = parseInt(row.metricValues?.[1].value || '0');

      // Trends
      if (date) {
        const existing = visitorTrendsMap.get(date);
        if (existing) {
          visitorTrendsMap.set(date, {
            date: formatGaDate(date),
            visitors: existing.visitors + users,
            sessions: existing.sessions + sessions
          });
        } else {
          visitorTrendsMap.set(date, {
            date: formatGaDate(date),
            visitors: users,
            sessions: sessions
          });
        }
      }

      // Stats aggregation
      const avgDuration = parseFloat(row.metricValues?.[2].value || '0');
      totalDurationSeconds += avgDuration * sessions;
      totalSessionsCount += sessions;

      // Devices
      if (device === 'desktop') devices.desktop += users;
      if (device === 'mobile') devices.mobile += users;
      if (device === 'tablet') devices.tablet += users;

      // Countries
      if (country) countriesMap.set(country, (countriesMap.get(country) || 0) + users);

      // Sources
      if (source) sourcesMap.set(source, (sourcesMap.get(source) || 0) + users);

      // Retention
      if (userType === 'new') retention.new += users;
      if (userType === 'returning') retention.returning += users;
    });

    const countryData = Array.from(countriesMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 5);

    const sourceData = Array.from(sourcesMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .map((item, i) => ({
        ...item,
        fill: `var(--chart-${(i % 5) + 1})`
      }));

    const totalVisitors = Array.from(visitorTrendsMap.values()).reduce((acc, curr) => acc + curr.visitors, 0);
    const totalClicks = scData?.rows?.reduce((acc: number, row: any) => acc + (row.clicks || 0), 0) || 0;
    const averageSessionDuration = totalSessionsCount > 0 ? totalDurationSeconds / totalSessionsCount : 0;
    const avgPosition = (scData?.rows?.reduce((acc: number, row: any) => acc + (row.position || 0), 0) || 0) / (scData?.rows?.length || 1);

    return NextResponse.json({
      stats: {
        visitors: totalVisitors,
        visitorsChange: 0,
        clicks: totalClicks,
        clicksChange: 0,
        avgDuration: formatDuration(averageSessionDuration),
        durationChange: 0,
        avgPosition: avgPosition,
        positionChange: 0,
        activeUsersNow
      },
      visitorTrends: Array.from(visitorTrendsMap.values()),
      searchTrends: scData?.rows?.map((row: any) => ({
        date: row.keys?.[0],
        clicks: row.clicks,
        impressions: row.impressions
      })) || [],
      topPages: pagesData?.rows?.map((row: any) => ({
        title: row.dimensionValues?.[0].value || 'Unknown Page',
        url: row.dimensionValues?.[1].value || '/',
        views: parseInt(row.metricValues?.[0].value || '0')
      })) || [],
      topQueries: queriesData?.rows?.map((row: any) => ({
        term: row.keys?.[0],
        clicks: row.clicks,
        position: row.position,
        ctr: (row.ctr || 0) * 100
      })) || [],
      deviceData: [
        { device: "desktop", visitors: devices.desktop, fill: "var(--chart-1)" },
        { device: "mobile", visitors: devices.mobile, fill: "var(--chart-2)" },
        { device: "tablet", visitors: devices.tablet, fill: "var(--chart-3)" },
      ],
      countryData,
      sourceData,
      retentionData: [
        { type: "New Users", value: retention.new, fill: "var(--chart-1)" },
        { type: "Returning", value: retention.returning, fill: "var(--chart-2)" }
      ]
    });

  } catch (error: any) {
    console.error('Main Analytics API Error:', error);
    
    // Robust error message extraction
    let errorMsg = 'Unknown Error';
    try {
      errorMsg = error?.message || error?.statusText || (typeof error === 'string' ? error : JSON.stringify(error));
    } catch (e) {
      errorMsg = String(error);
    }

    // Extract all keys from error for debugging
    const errorDebug: any = {};
    if (error) {
      Object.getOwnPropertyNames(error).forEach(key => {
        errorDebug[key] = error[key];
      });
    }

    return NextResponse.json({ 
      message: `Internal Server Error: ${errorMsg}`,
      debug: errorDebug
    }, { status: 500 });
  }
}

function formatDuration(seconds: number) {
  const totalRounded = Math.round(seconds);
  const m = Math.floor(totalRounded / 60);
  const s = totalRounded % 60;
  return `${m}m ${s}s`;
}

function formatDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

function formatGaDate(gaDate: string) {
  return `${gaDate.slice(0, 4)}-${gaDate.slice(4, 6)}-${gaDate.slice(6, 8)}`;
}

