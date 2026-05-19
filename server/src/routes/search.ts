import { Router } from 'express';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { searchFlights } from '../services/flights.js';
import { searchHotels } from '../services/hotels.js';
import { db } from '../db/index.js';
import { priceAlerts } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

const router = Router();
router.use(authenticate);

function q(req: AuthRequest, name: string): string | undefined {
  const val = req.query[name];
  if (Array.isArray(val)) return val[0] as string;
  return val as string | undefined;
}

function p(req: AuthRequest, name: string): string {
  const val = req.params[name];
  return Array.isArray(val) ? val[0] : val;
}

// Search flights
router.get('/flights', async (req: AuthRequest, res) => {
  const origin = q(req, 'origin');
  const destination = q(req, 'destination');
  const departureDate = q(req, 'departureDate');

  if (!origin || !destination || !departureDate) {
    res.status(400).json({ error: 'origin, destination, and departureDate are required' });
    return;
  }

  try {
    const results = await searchFlights({
      origin,
      destination,
      departureDate,
      returnDate: q(req, 'returnDate'),
      adults: parseInt(q(req, 'adults') || '1'),
      cabinClass: q(req, 'cabinClass'),
    });
    res.json(results);
  } catch (err: any) {
    console.error('Flight search error:', err);
    res.status(500).json({ error: 'Flight search failed', details: err.message });
  }
});

// Search hotels
router.get('/hotels', async (req: AuthRequest, res) => {
  const cityCode = q(req, 'cityCode');
  const checkIn = q(req, 'checkIn');
  const checkOut = q(req, 'checkOut');

  if (!cityCode || !checkIn || !checkOut) {
    res.status(400).json({ error: 'cityCode, checkIn, and checkOut are required' });
    return;
  }

  try {
    const results = await searchHotels({
      cityCode,
      checkIn,
      checkOut,
      adults: parseInt(q(req, 'adults') || '2'),
      maxPrice: q(req, 'maxPrice') ? parseInt(q(req, 'maxPrice')!) : undefined,
    });
    res.json(results);
  } catch (err: any) {
    console.error('Hotel search error:', err);
    res.status(500).json({ error: 'Hotel search failed', details: err.message });
  }
});

// ==================== PRICE ALERTS ====================

router.post('/alerts', async (req: AuthRequest, res) => {
  const { tripId, type, searchParams, currentPrice, targetPrice } = req.body;

  const [alert] = await db.insert(priceAlerts).values({
    userId: req.userId!,
    tripId,
    type,
    searchParams,
    currentPrice: currentPrice?.toString(),
    targetPrice: targetPrice?.toString(),
    priceHistory: currentPrice ? [{ price: currentPrice, date: new Date().toISOString() }] : [],
  }).returning();

  res.status(201).json(alert);
});

router.get('/alerts', async (req: AuthRequest, res) => {
  const alerts = await db.select().from(priceAlerts)
    .where(eq(priceAlerts.userId, req.userId!));
  res.json(alerts);
});

router.delete('/alerts/:id', async (req: AuthRequest, res) => {
  const alertId = p(req, 'id');
  await db.delete(priceAlerts)
    .where(and(eq(priceAlerts.id, alertId), eq(priceAlerts.userId, req.userId!)));
  res.json({ success: true });
});

export default router;
