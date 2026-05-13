const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testAnalytics() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, '');
  const propertyId = '537309127'; // Your Property ID

  console.log('Testing with:');
  console.log('Email:', clientEmail);
  console.log('Property ID:', propertyId);
  console.log('Key exists:', !!privateKey);

  try {
    const analyticsClient = new BetaAnalyticsDataClient({
      credentials: { client_email: clientEmail, private_key: privateKey },
    });

    console.log('Attempting to fetch realtime data...');
    const [response] = await analyticsClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }]
    });

    console.log('Success! Active Users:', response.rows?.[0]?.metricValues?.[0]?.value || '0');
  } catch (error) {
    console.error('--- ERROR DETECTED ---');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Status:', error.status);
    if (error.response && error.response.data) {
      console.error('Detailed Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
  }
}

testAnalytics();
