import { LocationPoint, NearbyDriver, RideOption, RideProvider, VehicleCategory } from '../types/ride';
import { computeDistanceKm } from '../data/singaporeLocations';

interface SimulationParams {
  origin: LocationPoint;
  destination: LocationPoint;
  category: VehicleCategory;
  priorityQueue: boolean;
  timeModifier?: number; // peak fluctuation
}

// Generate real-time options for Grab, Gojek, TADA
export function calculateRideOptions(params: SimulationParams): RideOption[] {
  const { origin, destination, category, priorityQueue } = params;
  const distanceKm = computeDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
  
  // Base travel time estimate (2.2 mins per km in Singapore peak/off-peak + 4 min base)
  const baseTripDuration = Math.round(4 + distanceKm * 2.1);
  const totalErp = (origin.defaultErp + destination.defaultErp) / 2;

  // Provider specific configuration reflecting real SG market dynamics
  // 1. Grab: dominant fleet, high surge variance, standard 3.5% ShopBack cashback
  // 2. Gojek: competitive baseline, medium surge variance, 4.0% ShopBack cashback
  // 3. TADA: zero-commission driver model (lower surge, rider friendly), 5.0% bonus ShopBack cashback

  const providersConfig: {
    provider: RideProvider;
    providerName: string;
    serviceName: Record<VehicleCategory, string>;
    baseRate: number;
    perKmRate: number;
    perMinRate: number;
    platformFee: number;
    baseSurge: number;
    cashbackRate: number;
    basePickupMins: number;
    appColor: string;
    driverPoolSize: number;
  }[] = [
    {
      provider: 'grab',
      providerName: 'Grab',
      serviceName: {
        standard: 'JustGrab',
        xl: 'GrabCar 6-Seater',
        premium: 'GrabCar Premium',
        taxi: 'Standard Taxi (Grab)',
        green: 'GrabCar Eco (EV)'
      },
      baseRate: 3.60,
      perKmRate: 0.85,
      perMinRate: 0.22,
      platformFee: 0.70,
      baseSurge: 1.15,
      cashbackRate: 0.035, // 3.5%
      basePickupMins: 3,
      appColor: '#00B14F',
      driverPoolSize: 12
    },
    {
      provider: 'gojek',
      providerName: 'Gojek',
      serviceName: {
        standard: 'GoCar',
        xl: 'GoCar XL (6-Seater)',
        premium: 'GoCar Premium',
        taxi: 'GoCar Taxi Partner',
        green: 'GoCar Green EV'
      },
      baseRate: 3.40,
      perKmRate: 0.80,
      perMinRate: 0.20,
      platformFee: 0.70,
      baseSurge: 1.10,
      cashbackRate: 0.04, // 4.0%
      basePickupMins: 4,
      appColor: '#00AA13',
      driverPoolSize: 8
    },
    {
      provider: 'tada',
      providerName: 'TADA',
      serviceName: {
        standard: 'TADA Standard (Zero-Comm)',
        xl: 'TADA 6-Seater',
        premium: 'TADA Executive',
        taxi: 'TADA Metered Taxi',
        green: 'TADA Green EV'
      },
      baseRate: 3.30,
      perKmRate: 0.75,
      perMinRate: 0.18,
      platformFee: 0.50,
      baseSurge: 1.05,
      cashbackRate: 0.05, // 5.0% ShopBack partner promotion
      basePickupMins: 5,
      appColor: '#0052CC',
      driverPoolSize: 7
    },
    {
      provider: 'taxi',
      providerName: 'LTA Taxis',
      serviceName: {
        standard: 'Standard Metered Taxi (Comfort/Trans)',
        xl: 'MaxiCab 7-Seater',
        premium: 'LimoTaxi (Mercedes / Vellfire)',
        taxi: 'ComfortDelGro / Strides Hail',
        green: 'Electric Cab (BYD e6 / Ioniq 5)'
      },
      baseRate: 4.40, // PTC Standard Flagdown fare
      perKmRate: 0.65, // Regulated meter step ($0.26 / 400m)
      perMinRate: 0.26, // Waiting time meter ($0.26 / 45s)
      platformFee: 0.30, // LTA regulatory fee only, no commission
      baseSurge: 1.00, // Regulated fixed peak surcharge (capped at 1.25x max)
      cashbackRate: 0.03, // 3.0% Cashback
      basePickupMins: 2, // Fastest street availability via LTA DataMall
      appColor: '#EAB308',
      driverPoolSize: 18 // High density from LTA DataMall feed
    }
  ];

  // Category multiplier
  const categoryMultipliers: Record<VehicleCategory, { priceMul: number; cap: number; label: string }> = {
    standard: { priceMul: 1.0, cap: 4, label: 'Standard 4-Seater' },
    xl: { priceMul: 1.45, cap: 6, label: '6-Seater XL' },
    premium: { priceMul: 1.85, cap: 4, label: 'Executive Luxury' },
    taxi: { priceMul: 1.05, cap: 4, label: 'Licensed Taxi' },
    green: { priceMul: 0.98, cap: 4, label: '100% Electric EV' }
  };

  const catInfo = categoryMultipliers[category];

  // Build raw options
  const options: RideOption[] = providersConfig.map((cfg) => {
    // Priority queue reduces pickup time by 2 mins, but adds $2.00 priority dispatch fee
    const priorityEtaReduction = priorityQueue ? Math.min(2, Math.max(1, cfg.basePickupMins - 1)) : 0;
    const finalPickupEta = Math.max(1, cfg.basePickupMins - priorityEtaReduction);
    const priorityFee = priorityQueue ? 2.0 : 0.0;

    // Surge calculation
    const currentSurge = Number((cfg.baseSurge + (Math.sin(Date.now() / 25000 + cfg.driverPoolSize) * 0.15)).toFixed(2));
    const safeSurge = Math.max(1.0, currentSurge);

    const baseFare = cfg.baseRate * catInfo.priceMul;
    const distanceFare = distanceKm * cfg.perKmRate * catInfo.priceMul;
    const timeFare = baseTripDuration * cfg.perMinRate;
    
    // Subtotal before surge
    const subtotal = (baseFare + distanceFare + timeFare) * safeSurge;
    const grossFare = Number((subtotal + totalErp + cfg.platformFee + priorityFee).toFixed(2));

    // ShopBack cashback
    const cashbackAmount = Number((grossFare * cfg.cashbackRate).toFixed(2));
    const netFare = Number((grossFare - cashbackAmount).toFixed(2));

    let surgeLabel: string | undefined = undefined;
    if (safeSurge > 1.25) {
      surgeLabel = `${safeSurge}x High Demand Surge`;
    } else if (safeSurge > 1.05) {
      surgeLabel = `${safeSurge}x Moderate Surge`;
    }

    const isTaxi = cfg.provider === 'taxi';
    const deepLink = isTaxi
      ? 'https://www.cdgtaxi.com.sg/'
      : cfg.provider === 'grab'
      ? 'https://grab.onelink.me'
      : cfg.provider === 'gojek'
      ? 'https://gojek.onelink.me'
      : 'https://tada.onelink.me';

    return {
      id: `${cfg.provider}_${category}`,
      provider: cfg.provider,
      providerName: cfg.providerName,
      serviceName: cfg.serviceName[category],
      category,
      categoryLabel: catInfo.label,
      capacity: catInfo.cap,
      baseFare: Number(baseFare.toFixed(2)),
      distanceFare: Number(distanceFare.toFixed(2)),
      timeFare: Number(timeFare.toFixed(2)),
      surgeMultiplier: isTaxi ? 1.0 : safeSurge,
      surgeLabel: isTaxi ? 'PTC Regulated Meter (No Surge)' : surgeLabel,
      isMeteredRate: isTaxi,
      ltaApiSource: isTaxi ? 'https://datamall2.mytransport.sg/ltaodataservice/Taxi-Availability' : undefined,
      operatorName: isTaxi ? 'ComfortDelGro / Strides / Trans-Cab' : undefined,
      erpFee: Number(totalErp.toFixed(2)),
      platformFee: Number((cfg.platformFee + priorityFee).toFixed(2)),
      grossFare,
      shopbackCashbackRate: cfg.cashbackRate,
      shopbackCashbackAmount: cashbackAmount,
      netFare,
      pickupEtaMins: finalPickupEta,
      tripDurationMins: baseTripDuration,
      distanceKm,
      driverCountNearby: Math.max(3, cfg.driverPoolSize + Math.floor(Math.sin(Date.now() / 15000) * 3)),
      deepLinkUrl: deepLink,
      appColor: cfg.appColor
    };
  });

  // Calculate badges
  const minNetFare = Math.min(...options.map((o) => o.netFare));
  const minEta = Math.min(...options.map((o) => o.pickupEtaMins));

  // Best value: normalized score of price & wait time
  let bestScore = Infinity;
  let bestValueId = '';
  options.forEach((o) => {
    // Score weighted 60% price, 40% eta
    const score = (o.netFare / minNetFare) * 0.6 + (o.pickupEtaMins / minEta) * 0.4;
    if (score < bestScore) {
      bestScore = score;
      bestValueId = o.id;
    }
  });

  return options.map((opt) => ({
    ...opt,
    isCheapest: opt.netFare === minNetFare,
    isFastest: opt.pickupEtaMins === minEta,
    isBestValue: opt.id === bestValueId
  }));
}

// Generate realistic nearby driver positions around the pickup location
export function generateNearbyDrivers(pickup: LocationPoint): NearbyDriver[] {
  const drivers: NearbyDriver[] = [
    {
      id: 'd_grab_1',
      provider: 'grab',
      lat: pickup.lat + 0.0035,
      lng: pickup.lng - 0.0028,
      driverName: 'Tan Wei Ming',
      carModel: 'Toyota Prius Hybrid (White)',
      plate: 'SNA 4921 B',
      rating: 4.92,
      etaMins: 3
    },
    {
      id: 'd_grab_2',
      provider: 'grab',
      lat: pickup.lat - 0.0022,
      lng: pickup.lng + 0.0041,
      driverName: 'Muhammad Faiz',
      carModel: 'Hyundai Ioniq Electric (Grey)',
      plate: 'SMD 8213 T',
      rating: 4.88,
      etaMins: 4
    },
    {
      id: 'd_gojek_1',
      provider: 'gojek',
      lat: pickup.lat + 0.0019,
      lng: pickup.lng + 0.0032,
      driverName: 'Leslie Wong',
      carModel: 'Honda Vezel (Silver)',
      plate: 'SKL 7309 K',
      rating: 4.95,
      etaMins: 4
    },
    {
      id: 'd_gojek_2',
      provider: 'gojek',
      lat: pickup.lat - 0.0040,
      lng: pickup.lng - 0.0021,
      driverName: 'Kumar S.',
      carModel: 'Nissan Serena e-Power (Black)',
      plate: 'SNA 1104 P',
      rating: 4.85,
      etaMins: 5
    },
    {
      id: 'd_tada_1',
      provider: 'tada',
      lat: pickup.lat - 0.0015,
      lng: pickup.lng - 0.0045,
      driverName: 'Marcus Lim',
      carModel: 'BYD Atto 3 EV (Blue)',
      plate: 'SME 6219 M',
      rating: 4.97,
      etaMins: 5
    },
    {
      id: 'd_tada_2',
      provider: 'tada',
      lat: pickup.lat + 0.0048,
      lng: pickup.lng + 0.0015,
      driverName: 'Ahmad Daniel',
      carModel: 'Toyota Camry (Midnight Black)',
      plate: 'SLZ 3802 C',
      rating: 4.91,
      etaMins: 6
    },
    {
      id: 'd_taxi_1',
      provider: 'taxi',
      lat: pickup.lat + 0.0012,
      lng: pickup.lng - 0.0014,
      driverName: 'Khoo Boon Teck (ComfortDelGro)',
      carModel: 'Hyundai Ioniq Hybrid Taxi (Blue)',
      plate: 'SHA 1928 L',
      rating: 4.90,
      etaMins: 2
    },
    {
      id: 'd_taxi_2',
      provider: 'taxi',
      lat: pickup.lat - 0.0018,
      lng: pickup.lng + 0.0022,
      driverName: 'David Chen (Strides Premier)',
      carModel: 'Toyota Prius Taxi (Silver)',
      plate: 'SHB 4410 D',
      rating: 4.89,
      etaMins: 3
    },
    {
      id: 'd_taxi_3',
      provider: 'taxi',
      lat: pickup.lat + 0.0028,
      lng: pickup.lng + 0.0036,
      driverName: 'Lim Chee Keong (Trans-Cab)',
      carModel: 'Toyota Wish Taxi (Red)',
      plate: 'SHC 8821 X',
      rating: 4.86,
      etaMins: 2
    }
  ];

  return drivers;
}
