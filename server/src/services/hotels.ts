import Amadeus from 'amadeus';

let amadeus: Amadeus | null = null;

function getAmadeus(): Amadeus {
  if (!amadeus) {
    amadeus = new Amadeus({
      clientId: process.env.AMADEUS_CLIENT_ID!,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
    });
  }
  return amadeus;
}

export interface HotelSearchParams {
  cityCode: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  maxPrice?: number;
}

export interface HotelResult {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  amenities: string[];
  imageUrl?: string;
  source: string;
}

export async function searchHotels(params: HotelSearchParams): Promise<HotelResult[]> {
  if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
    return getMockHotels(params);
  }

  try {
    // Step 1: Get hotel list by city
    const hotelListResponse = await getAmadeus().referenceData.locations.hotels.byCity.get({
      cityCode: params.cityCode,
    });

    const hotelIds = (hotelListResponse.data || [])
      .slice(0, 10)
      .map((h: any) => h.hotelId);

    if (hotelIds.length === 0) {
      return getMockHotels(params);
    }

    // Step 2: Get offers for these hotels
    const offersResponse = await getAmadeus().shopping.hotelOffersSearch.get({
      hotelIds: hotelIds.join(','),
      checkInDate: params.checkIn,
      checkOutDate: params.checkOut,
      adults: params.adults || 2,
      currency: 'USD',
    });

    const offers = offersResponse.data || [];
    const nights = daysBetween(params.checkIn, params.checkOut);

    return offers
      .filter((offer: any) => offer.offers?.length > 0)
      .map((hotel: any, i: number) => {
        const bestOffer = hotel.offers[0];
        const pricePerNight = parseFloat(bestOffer.price?.total || '0') / Math.max(nights, 1);

        return {
          id: hotel.hotel?.hotelId || `hotel-${i}`,
          name: hotel.hotel?.name || 'Unknown Hotel',
          address: [
            hotel.hotel?.address?.lines?.join(', '),
            hotel.hotel?.address?.cityName,
          ].filter(Boolean).join(', '),
          latitude: hotel.hotel?.latitude,
          longitude: hotel.hotel?.longitude,
          rating: hotel.hotel?.rating ? parseFloat(hotel.hotel.rating) : 4.0,
          pricePerNight: Math.round(pricePerNight * 100) / 100,
          totalPrice: parseFloat(bestOffer.price?.total || '0'),
          currency: bestOffer.price?.currency || 'USD',
          amenities: bestOffer.room?.description?.text
            ? extractAmenities(bestOffer.room.description.text)
            : ['WiFi'],
          source: 'amadeus',
        };
      })
      .filter((h: HotelResult) => !params.maxPrice || h.pricePerNight <= params.maxPrice);
  } catch (err: any) {
    console.error('Amadeus hotel search error:', err.response?.result || err.message);
    return getMockHotels(params);
  }
}

function extractAmenities(description: string): string[] {
  const amenityKeywords = [
    'WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Parking',
    'AC', 'Breakfast', 'Laundry', 'Room Service', 'Kitchen', 'Balcony',
  ];
  return amenityKeywords.filter(a =>
    description.toLowerCase().includes(a.toLowerCase()),
  );
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

function getMockHotels(params: HotelSearchParams): HotelResult[] {
  const nights = daysBetween(params.checkIn, params.checkOut);
  const cityNames: Record<string, string> = {
    TYO: 'Tokyo', PAR: 'Paris', LON: 'London', NYC: 'New York',
    BCN: 'Barcelona', BKK: 'Bangkok', DPS: 'Bali',
  };
  const city = cityNames[params.cityCode] || params.cityCode;

  const mockHotels = [
    { name: `${city} Grand Hotel`, rating: 4.5, base: 180, amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa'] },
    { name: `The ${city} Boutique`, rating: 4.7, base: 220, amenities: ['WiFi', 'Breakfast', 'Bar', 'Rooftop'] },
    { name: `${city} Central Inn`, rating: 4.1, base: 95, amenities: ['WiFi', 'AC', 'Laundry'] },
    { name: `${city} Residence Suites`, rating: 4.3, base: 150, amenities: ['WiFi', 'Kitchen', 'Gym', 'Parking'] },
    { name: `Luxury ${city} Palace`, rating: 4.9, base: 380, amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Room Service', 'Bar'] },
    { name: `Backpacker's ${city}`, rating: 3.8, base: 35, amenities: ['WiFi', 'Laundry', 'Kitchen'] },
  ];

  return mockHotels
    .filter(h => !params.maxPrice || h.base <= params.maxPrice)
    .map((hotel, i) => ({
      id: `mock-hotel-${i}`,
      name: hotel.name,
      address: `${100 + i * 50} Main Street, ${city}`,
      rating: hotel.rating,
      pricePerNight: hotel.base + Math.floor(Math.random() * 30),
      totalPrice: (hotel.base + Math.floor(Math.random() * 30)) * nights,
      currency: 'USD',
      amenities: hotel.amenities,
      source: 'mock',
    }));
}
