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

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  cabinClass?: string;
}

export interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  departure: { airport: string; time: string; city?: string };
  arrival: { airport: string; time: string; city?: string };
  duration: string;
  stops: number;
  price: number;
  currency: string;
  cabinClass: string;
  seatsRemaining?: number;
}

export async function searchFlights(params: FlightSearchParams): Promise<FlightResult[]> {
  // If Amadeus is not configured, return mock results
  if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
    return getMockFlights(params);
  }

  try {
    const searchParams: any = {
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departureDate,
      adults: params.adults,
      max: 10,
      currencyCode: 'USD',
    };

    if (params.returnDate) {
      searchParams.returnDate = params.returnDate;
    }
    if (params.cabinClass) {
      searchParams.travelClass = params.cabinClass;
    }

    const response = await getAmadeus().shopping.flightOffersSearch.get(searchParams);
    const offers = response.data || [];

    return offers.map((offer: any, i: number) => {
      const segment = offer.itineraries[0]?.segments[0];
      const lastSegment = offer.itineraries[0]?.segments[offer.itineraries[0].segments.length - 1];
      const totalSegments = offer.itineraries[0]?.segments.length || 1;

      return {
        id: offer.id || `flight-${i}`,
        airline: segment?.carrierCode || 'Unknown',
        flightNumber: `${segment?.carrierCode} ${segment?.number}`,
        departure: {
          airport: segment?.departure?.iataCode || params.origin,
          time: segment?.departure?.at || params.departureDate,
        },
        arrival: {
          airport: lastSegment?.arrival?.iataCode || params.destination,
          time: lastSegment?.arrival?.at || '',
        },
        duration: offer.itineraries[0]?.duration || '',
        stops: totalSegments - 1,
        price: parseFloat(offer.price?.total || '0'),
        currency: offer.price?.currency || 'USD',
        cabinClass: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
        seatsRemaining: offer.numberOfBookableSeats,
      };
    });
  } catch (err: any) {
    console.error('Amadeus flight search error:', err.response?.result || err.message);
    return getMockFlights(params);
  }
}

function getMockFlights(params: FlightSearchParams): FlightResult[] {
  const airlines = [
    { code: 'UA', name: 'United' },
    { code: 'DL', name: 'Delta' },
    { code: 'AA', name: 'American' },
    { code: 'NH', name: 'ANA' },
    { code: 'BA', name: 'British Airways' },
    { code: 'AF', name: 'Air France' },
  ];

  return airlines.slice(0, 5).map((airline, i) => ({
    id: `mock-flight-${i}`,
    airline: airline.code,
    flightNumber: `${airline.code} ${100 + Math.floor(Math.random() * 900)}`,
    departure: {
      airport: params.origin,
      time: `${params.departureDate}T${8 + i * 2}:${i % 2 === 0 ? '00' : '30'}`,
    },
    arrival: {
      airport: params.destination,
      time: `${params.departureDate}T${16 + i}:${i % 2 === 0 ? '45' : '15'}`,
    },
    duration: `${8 + i}h ${i * 15}m`,
    stops: i < 2 ? 0 : i < 4 ? 1 : 2,
    price: 350 + Math.floor(Math.random() * 600),
    currency: 'USD',
    cabinClass: params.cabinClass || 'ECONOMY',
    seatsRemaining: 3 + Math.floor(Math.random() * 10),
  }));
}
