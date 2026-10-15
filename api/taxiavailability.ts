/**
 * Serverless LTA DataMall Taxi Availability Endpoint
 * Path: /api/taxiavailability
 * Upstream LTA Endpoint: GET https://datamall2.mytransport.sg/ltaodataservice/Taxi-Availability
 */

export interface TaxiCoordinate {
  Latitude: number;
  Longitude: number;
  distanceKm?: number;
}

export interface TaxiAvailabilityResponse {
  status: 'live' | 'pending_key' | 'error';
  message: string;
  source: string;
  isLive: boolean;
  totalAvailableTaxis: number;
  nearbyTaxisCount: number;
  queriedLocation?: {
    lat: number;
    lng: number;
    radiusKm: number;
  };
  taxis: TaxiCoordinate[];
  timestamp: string;
}

// Calculate Haversine distance in KM
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Simulated Singapore available taxi coordinates (used when API key is not yet configured)
function getMockSingaporeTaxis(centerLat = 1.30, centerLng = 103.85): TaxiCoordinate[] {
  const offsets = [
    [0.0012, -0.0014],
    [-0.0018, 0.0022],
    [0.0028, 0.0036],
    [-0.0031, -0.0025],
    [0.0042, -0.0018],
    [-0.0025, 0.0041],
    [0.0019, 0.0029],
    [-0.0045, -0.0012],
    [0.0034, 0.0048],
    [-0.0015, -0.0039],
    [0.0051, 0.0012],
    [-0.0038, 0.0033],
    [0.0022, -0.0042],
    [-0.0011, 0.0055],
    [0.0048, -0.0031]
  ];

  return offsets.map(([dLat, dLng]) => ({
    Latitude: Number((centerLat + dLat).toFixed(6)),
    Longitude: Number((centerLng + dLng).toFixed(6)),
    distanceKm: getDistanceKm(centerLat, centerLng, centerLat + dLat, centerLng + dLng),
  }));
}

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, AccountKey');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Parse query parameters
  const urlObj = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
  const latParam = urlObj.searchParams.get('lat');
  const lngParam = urlObj.searchParams.get('lng');
  const radiusParam = urlObj.searchParams.get('radius');

  const targetLat = latParam ? parseFloat(latParam) : 1.3562; // Default Changi / Central
  const targetLng = lngParam ? parseFloat(lngParam) : 103.9870;
  const targetRadiusKm = radiusParam ? parseFloat(radiusParam) : 3.0;

  // Retrieve API Key without hardcoding (from environment variables or incoming header)
  const apiKey =
    process.env.LTA_DATAMALL_API_KEY ||
    process.env.AccountKey ||
    process.env.LTA_API_KEY ||
    (req.headers && (req.headers['accountkey'] || req.headers['AccountKey']));

  // If user has not configured the key yet:
  if (!apiKey || apiKey.trim() === '') {
    const mockTaxis = getMockSingaporeTaxis(targetLat, targetLng);
    const response: TaxiAvailabilityResponse = {
      status: 'pending_key',
      message:
        'LTA DataMall API Key (AccountKey) is pending configuration. Add LTA_DATAMALL_API_KEY or AccountKey to your environment variables to enable live upstream syncing.',
      source: 'https://datamall2.mytransport.sg/ltaodataservice/Taxi-Availability',
      isLive: false,
      totalAvailableTaxis: 2480,
      nearbyTaxisCount: mockTaxis.length,
      queriedLocation: {
        lat: targetLat,
        lng: targetLng,
        radiusKm: targetRadiusKm,
      },
      taxis: mockTaxis,
      timestamp: new Date().toISOString(),
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response, null, 2));
    return;
  }

  // Fetch live from LTA DataMall
  try {
    const ltaEndpoint = 'https://datamall2.mytransport.sg/ltaodataservice/Taxi-Availability';
    const ltaResponse = await fetch(ltaEndpoint, {
      method: 'GET',
      headers: {
        AccountKey: apiKey,
        accept: 'application/json',
      },
    });

    if (!ltaResponse.ok) {
      throw new Error(`LTA DataMall upstream returned status ${ltaResponse.status}: ${ltaResponse.statusText}`);
    }

    const data: any = await ltaResponse.json();
    const rawTaxis: { Latitude: number; Longitude: number }[] = data.value || [];

    // Filter nearby if coordinates provided
    const taxisWithDistance: TaxiCoordinate[] = rawTaxis
      .map((t) => ({
        Latitude: t.Latitude,
        Longitude: t.Longitude,
        distanceKm: getDistanceKm(targetLat, targetLng, t.Latitude, t.Longitude),
      }))
      .filter((t) => t.distanceKm !== undefined && t.distanceKm <= targetRadiusKm)
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    const response: TaxiAvailabilityResponse = {
      status: 'live',
      message: 'Successfully pulled live taxi availability from LTA DataMall.',
      source: ltaEndpoint,
      isLive: true,
      totalAvailableTaxis: rawTaxis.length,
      nearbyTaxisCount: taxisWithDistance.length,
      queriedLocation: {
        lat: targetLat,
        lng: targetLng,
        radiusKm: targetRadiusKm,
      },
      taxis: taxisWithDistance.slice(0, 50), // Return top 50 nearby for network efficiency
      timestamp: new Date().toISOString(),
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response, null, 2));
  } catch (error: any) {
    // Graceful fallback on network/upstream error
    const mockTaxis = getMockSingaporeTaxis(targetLat, targetLng);
    const response: TaxiAvailabilityResponse = {
      status: 'error',
      message: `Failed to connect to LTA DataMall: ${error?.message || 'Unknown network error'}. Serving cached/fallback fleet.`,
      source: 'https://datamall2.mytransport.sg/ltaodataservice/Taxi-Availability',
      isLive: false,
      totalAvailableTaxis: 2480,
      nearbyTaxisCount: mockTaxis.length,
      queriedLocation: {
        lat: targetLat,
        lng: targetLng,
        radiusKm: targetRadiusKm,
      },
      taxis: mockTaxis,
      timestamp: new Date().toISOString(),
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response, null, 2));
  }
}
