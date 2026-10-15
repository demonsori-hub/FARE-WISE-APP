import { OneMapCleanResult, OneMapSearchResponse } from '../../api/onemap';
import { LocationPoint } from '../types/ride';

export async function searchOneMap(
  query: string,
  pageNum = 1
): Promise<OneMapCleanResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const res = await fetch(
      `/api/onemap?searchVal=${encodeURIComponent(query.trim())}&returnGeom=Y&getAddrDetails=Y&pageNum=${pageNum}`
    );
    if (!res.ok) return [];
    const data: OneMapSearchResponse = await res.json();
    return data.results || [];
  } catch (err) {
    console.warn('OneMap search error:', err);
    return [];
  }
}

// Convert OneMap result to FARE WISE LocationPoint
export function convertOneMapToLocation(result: OneMapCleanResult): LocationPoint {
  // Estimate ERP based on Singapore Downtown / CBD proximity (latitude 1.28-1.305, longitude 103.84-103.86)
  const isCbd =
    result.lat >= 1.275 &&
    result.lat <= 1.305 &&
    result.lng >= 103.835 &&
    result.lng <= 103.865;

  return {
    id: `onemap_${result.postal || Date.now()}`,
    name: result.name || result.building || result.road || 'Singapore Location',
    address: result.address,
    area: result.postal ? `Postal ${result.postal}` : 'Singapore (OneMap)',
    lat: result.lat,
    lng: result.lng,
    defaultErp: isCbd ? 2.5 : 0.5,
  };
}
