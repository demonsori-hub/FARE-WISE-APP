/**
 * Serverless OneMap Singapore Geocoding & Search Endpoint (Keyless)
 * Upstream API: GET https://www.onemap.gov.sg/api/common/elastic/search?searchVal=...&returnGeom=Y&getAddrDetails=Y&pageNum=1
 */

export interface OneMapRawResult {
  SEARCHVAL: string;
  BLK_NO: string;
  ROAD_NAME: string;
  BUILDING: string;
  ADDRESS: string;
  POSTAL: string;
  X: string;
  Y: string;
  LATITUDE: string;
  LONGITUDE: string;
}

export interface OneMapCleanResult {
  id: string;
  name: string;
  address: string;
  postal: string;
  lat: number;
  lng: number;
  building: string;
  road: string;
}

export interface OneMapSearchResponse {
  status: 'success' | 'empty' | 'error';
  found: number;
  totalNumPages: number;
  pageNum: number;
  query: string;
  source: string;
  results: OneMapCleanResult[];
  raw?: OneMapRawResult[];
}

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Parse query parameters
  const urlObj = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
  const searchVal = urlObj.searchParams.get('searchVal') || urlObj.searchParams.get('q') || '';
  const returnGeom = urlObj.searchParams.get('returnGeom') || 'Y';
  const getAddrDetails = urlObj.searchParams.get('getAddrDetails') || 'Y';
  const pageNum = urlObj.searchParams.get('pageNum') || '1';

  if (!searchVal.trim()) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        status: 'error',
        message: 'searchVal parameter is required (e.g. searchVal=178903 or building name).',
        results: [],
      })
    );
    return;
  }

  try {
    const upstreamUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
      searchVal.trim()
    )}&returnGeom=${returnGeom}&getAddrDetails=${getAddrDetails}&pageNum=${pageNum}`;

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    });

    if (!upstreamResponse.ok) {
      throw new Error(`OneMap upstream error: ${upstreamResponse.status} ${upstreamResponse.statusText}`);
    }

    const data: any = await upstreamResponse.json();
    const rawList: OneMapRawResult[] = data.results || [];

    const cleanResults: OneMapCleanResult[] = rawList.map((item, idx) => {
      const lat = parseFloat(item.LATITUDE);
      const lng = parseFloat(item.LONGITUDE);
      const name = item.BUILDING && item.BUILDING !== 'NIL' ? item.BUILDING : item.SEARCHVAL;
      const address = item.ADDRESS || `${item.BLK_NO} ${item.ROAD_NAME} SINGAPORE ${item.POSTAL}`.trim();

      return {
        id: `onemap_${item.POSTAL || ''}_${idx}`,
        name: name,
        address: address,
        postal: item.POSTAL === 'NIL' ? '' : item.POSTAL,
        lat: isNaN(lat) ? 1.3521 : lat,
        lng: isNaN(lng) ? 103.8198 : lng,
        building: item.BUILDING,
        road: item.ROAD_NAME,
      };
    });

    const payload: OneMapSearchResponse = {
      status: cleanResults.length > 0 ? 'success' : 'empty',
      found: data.found || cleanResults.length,
      totalNumPages: data.totalNumPages || 1,
      pageNum: parseInt(pageNum, 10) || 1,
      query: searchVal,
      source: 'https://www.onemap.gov.sg/api/common/elastic/search',
      results: cleanResults,
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload, null, 2));
  } catch (error: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        status: 'error',
        message: error?.message || 'Failed to query OneMap search API',
        results: [],
      })
    );
  }
}
