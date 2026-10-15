import { LocationPoint } from '../types/ride';

export const SINGAPORE_LOCATIONS: LocationPoint[] = [
  {
    id: 'changi_t3',
    name: 'Changi Airport Terminal 3',
    address: '65 Airport Boulevard, Singapore 819663',
    area: 'East',
    lat: 1.3562,
    lng: 103.9870,
    defaultErp: 0,
  },
  {
    id: 'mbs',
    name: 'Marina Bay Sands',
    address: '10 Bayfront Ave, Hotel Tower 1 Lobby, Singapore 018956',
    area: 'Downtown / Marina',
    lat: 1.2838,
    lng: 103.8591,
    defaultErp: 2.5,
  },
  {
    id: 'orchard_ion',
    name: 'ION Orchard (Pick-up Point)',
    address: '2 Orchard Turn, Orchard Blvd Drop-off, Singapore 238801',
    area: 'Orchard / Central',
    lat: 1.3040,
    lng: 103.8319,
    defaultErp: 2.0,
  },
  {
    id: 'raffles_place',
    name: 'Raffles Place (One Raffles Quay)',
    address: '1 Raffles Quay, Singapore 048583',
    area: 'Central Business District',
    lat: 1.2818,
    lng: 103.8522,
    defaultErp: 3.0,
  },
  {
    id: 'clarke_quay',
    name: 'Clarke Quay (River Valley Road)',
    address: '3 River Valley Rd, Singapore 179024',
    area: 'Riverside / Nightlife',
    lat: 1.2905,
    lng: 103.8465,
    defaultErp: 1.5,
  },
  {
    id: 'sentosa_rws',
    name: 'Resorts World Sentosa',
    address: '8 Sentosa Gateway, B1 Casino Taxi Stand, Singapore 098269',
    area: 'Sentosa / South',
    lat: 1.2560,
    lng: 103.8203,
    defaultErp: 3.0,
  },
  {
    id: 'jurong_east',
    name: 'Jurong East MRT / Westgate',
    address: '3 Gateway Drive, Singapore 608532',
    area: 'West',
    lat: 1.3331,
    lng: 103.7423,
    defaultErp: 1.0,
  },
  {
    id: 'tampines_hub',
    name: 'Our Tampines Hub',
    address: '1 Tampines Walk, Singapore 528523',
    area: 'East',
    lat: 1.3533,
    lng: 103.9402,
    defaultErp: 0.5,
  },
  {
    id: 'bugis_junction',
    name: 'Bugis Junction',
    address: '200 Victoria St, Singapore 188021',
    area: 'Downtown / Bugis',
    lat: 1.3000,
    lng: 103.8553,
    defaultErp: 2.0,
  },
  {
    id: 'woodlands_checkpoint',
    name: 'Woodlands Integrated Hub',
    address: 'Woodlands Square, Singapore 737736',
    area: 'North',
    lat: 1.4368,
    lng: 103.7865,
    defaultErp: 1.0,
  },
  {
    id: 'botanic_gardens',
    name: 'Singapore Botanic Gardens (Tanglin Gate)',
    address: '1 Cluny Rd, Singapore 259569',
    area: 'Central / Tanglin',
    lat: 1.3138,
    lng: 103.8159,
    defaultErp: 1.0,
  },
  {
    id: 'vivocity',
    name: 'VivoCity Mall Taxi Stand',
    address: '1 HarbourFront Walk, Singapore 098585',
    area: 'HarbourFront',
    lat: 1.2644,
    lng: 103.8222,
    defaultErp: 1.5,
  }
];

// Helper to compute geographic distance in KM
export function computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;
  // Road curvature factor in Singapore expressway network
  const roadFactor = 1.28;
  return Math.max(1.8, Number((straightLine * roadFactor).toFixed(1)));
}

// Generate realistic intermediate coordinates between origin and destination
export function generateRoutePoints(origin: LocationPoint, dest: LocationPoint): [number, number][] {
  const points: [number, number][] = [];
  const steps = 14;
  
  // Midpoint curvature to simulate Singapore expressways (e.g. ECP, PIE, AYE, CTE)
  const midLat = (origin.lat + dest.lat) / 2;
  const midLng = (origin.lng + dest.lng) / 2;
  
  // Add a slight arc based on direction
  const dx = dest.lng - origin.lng;
  const dy = dest.lat - origin.lat;
  const normalOffset = 0.008;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // quadratic bezier arc
    const curveX = (1 - t) * (1 - t) * origin.lng + 2 * (1 - t) * t * (midLng - dy * normalOffset * 50) + t * t * dest.lng;
    const curveY = (1 - t) * (1 - t) * origin.lat + 2 * (1 - t) * t * (midLat + dx * normalOffset * 50) + t * t * dest.lat;
    points.push([curveY, curveX]);
  }

  return points;
}
