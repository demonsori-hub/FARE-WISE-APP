import { TaxiAvailabilityResponse } from '../../api/taxiavailability';

export async function fetchLtaTaxiAvailability(
  lat: number,
  lng: number,
  radiusKm = 3.0
): Promise<TaxiAvailabilityResponse | null> {
  try {
    const res = await fetch(`/api/taxiavailability?lat=${lat}&lng=${lng}&radius=${radiusKm}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('LTA DataMall serverless fetch warning:', err);
    return null;
  }
}

export async function checkApiHealth() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
