export type RideProvider = 'grab' | 'gojek' | 'tada' | 'taxi';

export type VehicleCategory = 'standard' | 'xl' | 'premium' | 'taxi' | 'green';

export interface LocationPoint {
  id: string;
  name: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
  defaultErp: number; // Singapore Electronic Road Pricing toll estimate
}

export interface RideOption {
  id: string;
  provider: RideProvider;
  providerName: string;
  serviceName: string;
  category: VehicleCategory;
  categoryLabel: string;
  capacity: number;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  surgeLabel?: string;
  isMeteredRate?: boolean;
  ltaApiSource?: string;
  operatorName?: string;
  erpFee: number;
  platformFee: number;
  grossFare: number;
  shopbackCashbackRate: number; // e.g. 0.04 = 4%
  shopbackCashbackAmount: number;
  netFare: number; // grossFare - cashback
  pickupEtaMins: number;
  tripDurationMins: number;
  distanceKm: number;
  driverCountNearby: number;
  isCheapest?: boolean;
  isFastest?: boolean;
  isBestValue?: boolean;
  driverNote?: string;
  deepLinkUrl: string;
  appColor: string;
}

export interface RideHistoryItem {
  id: string;
  timestamp: number;
  origin: string;
  destination: string;
  distanceKm: number;
  provider: RideProvider;
  providerName: string;
  serviceName: string;
  category: VehicleCategory;
  finalFare: number;
  cashbackSaved: number;
  driverName: string;
  vehicleModel: string;
  licensePlate: string;
  userRating?: number;
  userFeedback?: string;
}

export interface PriceAlert {
  id: string;
  originName: string;
  destinationName: string;
  targetFare: number;
  provider: RideProvider | 'any';
  currentCheapestFare: number;
  active: boolean;
  triggered?: boolean;
  createdAt: number;
}

export interface NearbyDriver {
  id: string;
  provider: RideProvider;
  lat: number;
  lng: number;
  driverName: string;
  carModel: string;
  plate: string;
  rating: number;
  etaMins: number;
}
