/**
 * Serverless Health Check Endpoint
 * Path: /api/health
 */

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptime: number;
  environment: string;
  endpoints: {
    taxiavailability: string;
    health: string;
  };
  ltaDatamallConfigured: boolean;
}

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, AccountKey');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const apiKey = process.env.LTA_DATAMALL_API_KEY || process.env.AccountKey || process.env.LTA_API_KEY;

  const payload: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? Math.floor(process.uptime()) : 0,
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      taxiavailability: '/api/taxiavailability',
      health: '/api/health',
    },
    ltaDatamallConfigured: Boolean(apiKey && apiKey.trim().length > 0),
  };

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload, null, 2));
}
