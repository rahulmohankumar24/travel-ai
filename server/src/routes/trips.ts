import { Router } from 'express';
import { db } from '../db/index.js';
import {
  trips, tripCompanions, flights, lodging,
  itineraryDays, activities, expenses, photos,
} from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

function p(req: AuthRequest, name: string): string {
  const val = req.params[name];
  return Array.isArray(val) ? val[0] : val;
}

// List all trips for the current user
router.get('/', async (req: AuthRequest, res) => {
  const userTrips = await db.query.trips.findMany({
    where: (t, { eq }) => eq(t.createdBy, req.userId!),
    with: { companions: true, flights: true, lodging: true },
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  // Also find trips where user is a companion
  const companionTrips = await db.query.tripCompanions.findMany({
    where: (tc, { and, eq, ne }) =>
      and(eq(tc.userId, req.userId!), ne(tc.role, 'owner')),
    with: {
      trip: { with: { companions: true, flights: true, lodging: true } },
    },
  });

  const allTrips = [...userTrips];
  for (const tc of companionTrips) {
    if (tc.trip && !allTrips.find(t => t.id === tc.trip!.id)) {
      allTrips.push(tc.trip);
    }
  }

  res.json(allTrips);
});

// Get single trip with all details
router.get('/:id', async (req: AuthRequest, res) => {
  const tripId = p(req, 'id');
  const trip = await db.query.trips.findFirst({
    where: (t, { eq }) => eq(t.id, tripId),
    with: {
      companions: true,
      flights: true,
      lodging: true,
      days: {
        with: { activities: true },
        orderBy: (d, { asc }) => [asc(d.sortOrder)],
      },
      expenses: true,
      photos: true,
    },
  });

  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  const isOwner = trip.createdBy === req.userId;
  const isCompanion = trip.companions.some(c => c.userId === req.userId);
  if (!isOwner && !isCompanion) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  res.json(trip);
});

// Create trip
router.post('/', async (req: AuthRequest, res) => {
  const { destination, country, startDate, endDate, totalBudget, coverImageUrl } = req.body;

  const [trip] = await db.insert(trips).values({
    createdBy: req.userId!,
    destination,
    country,
    startDate,
    endDate,
    totalBudget: totalBudget?.toString(),
    coverImageUrl,
    status: 'upcoming',
  }).returning();

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, req.userId!),
  });

  if (user) {
    await db.insert(tripCompanions).values({
      tripId: trip.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      rsvp: 'going',
      role: 'owner',
    });
  }

  res.status(201).json(trip);
});

// Update trip
router.put('/:id', async (req: AuthRequest, res) => {
  const tripId = p(req, 'id');
  const { destination, country, startDate, endDate, totalBudget, coverImageUrl, status } = req.body;

  const [updated] = await db.update(trips)
    .set({
      destination, country, startDate, endDate,
      totalBudget: totalBudget?.toString(),
      coverImageUrl, status, updatedAt: new Date(),
    })
    .where(and(eq(trips.id, tripId), eq(trips.createdBy, req.userId!)))
    .returning();

  if (!updated) {
    res.status(404).json({ error: 'Trip not found or access denied' });
    return;
  }
  res.json(updated);
});

// Delete trip
router.delete('/:id', async (req: AuthRequest, res) => {
  const tripId = p(req, 'id');
  const [deleted] = await db.delete(trips)
    .where(and(eq(trips.id, tripId), eq(trips.createdBy, req.userId!)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: 'Trip not found or access denied' });
    return;
  }
  res.json({ success: true });
});

// ==================== COMPANIONS ====================

router.post('/:id/companions', async (req: AuthRequest, res) => {
  const tripId = p(req, 'id');
  const { email, name } = req.body;

  const [companion] = await db.insert(tripCompanions).values({
    tripId, email, name, rsvp: 'pending', role: 'editor',
  }).returning();

  res.status(201).json(companion);
});

router.put('/:id/companions/:companionId/rsvp', async (req: AuthRequest, res) => {
  const companionId = p(req, 'companionId');
  const { rsvp } = req.body;

  const [updated] = await db.update(tripCompanions)
    .set({ rsvp })
    .where(eq(tripCompanions.id, companionId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: 'Companion not found' });
    return;
  }
  res.json(updated);
});

router.delete('/:id/companions/:companionId', async (req: AuthRequest, res) => {
  const companionId = p(req, 'companionId');
  await db.delete(tripCompanions).where(eq(tripCompanions.id, companionId));
  res.json({ success: true });
});

// ==================== FLIGHTS ====================

router.post('/:id/flights', async (req: AuthRequest, res) => {
  const tripId = p(req, 'id');
  const d = req.body;

  const [flight] = await db.insert(flights).values({
    tripId,
    airline: d.airline,
    flightNumber: d.flightNumber,
    departureAirport: d.departureAirport,
    departureCity: d.departureCity,
    departureTime: d.departureTime,
    arrivalAirport: d.arrivalAirport,
    arrivalCity: d.arrivalCity,
    arrivalTime: d.arrivalTime,
    price: d.price?.toString(),
    status: d.status || 'suggested',
    confirmationCode: d.confirmationCode,
    seatClass: d.seatClass,
    rawApiData: d.rawApiData,
  }).returning();

  res.status(201).json(flight);
});

router.put('/:id/flights/:flightId', async (req: AuthRequest, res) => {
  const flightId = p(req, 'flightId');
  const { status, confirmationCode } = req.body;

  const [updated] = await db.update(flights)
    .set({ status, confirmationCode })
    .where(eq(flights.id, flightId))
    .returning();

  res.json(updated);
});

// ==================== LODGING ====================

router.post('/:id/lodging', async (req: AuthRequest, res) => {
  const tripId = p(req, 'id');
  const d = req.body;

  const [lodge] = await db.insert(lodging).values({
    tripId,
    name: d.name,
    type: d.type || 'hotel',
    address: d.address,
    latitude: d.latitude?.toString(),
    longitude: d.longitude?.toString(),
    checkIn: d.checkIn,
    checkOut: d.checkOut,
    pricePerNight: d.pricePerNight?.toString(),
    totalPrice: d.totalPrice?.toString(),
    imageUrl: d.imageUrl,
    status: d.status || 'suggested',
    confirmationCode: d.confirmationCode,
    rating: d.rating?.toString(),
    amenities: d.amenities,
    rawApiData: d.rawApiData,
  }).returning();

  res.status(201).json(lodge);
});

router.put('/:id/lodging/:lodgingId', async (req: AuthRequest, res) => {
  const lodgingId = p(req, 'lodgingId');
  const { status, confirmationCode } = req.body;

  const [updated] = await db.update(lodging)
    .set({ status, confirmationCode })
    .where(eq(lodging.id, lodgingId))
    .returning();

  res.json(updated);
});

// ==================== ITINERARY ====================

router.post('/:id/days', async (req: AuthRequest, res) => {
  const tripId = p(req, 'id');
  const { date, dayLabel, sortOrder } = req.body;

  const [day] = await db.insert(itineraryDays).values({
    tripId, date, dayLabel, sortOrder,
  }).returning();

  res.status(201).json(day);
});

router.post('/:id/days/:dayId/activities', async (req: AuthRequest, res) => {
  const tripId = p(req, 'id');
  const dayId = p(req, 'dayId');
  const d = req.body;

  const [activity] = await db.insert(activities).values({
    dayId,
    tripId,
    name: d.name,
    time: d.time,
    duration: d.duration,
    location: d.location,
    latitude: d.latitude?.toString(),
    longitude: d.longitude?.toString(),
    cost: d.cost?.toString(),
    category: d.category || 'other',
    status: d.status || 'suggested',
    notes: d.notes,
    sortOrder: d.sortOrder,
  }).returning();

  res.status(201).json(activity);
});

router.put('/:id/activities/:activityId', async (req: AuthRequest, res) => {
  const activityId = p(req, 'activityId');
  const d = req.body;

  const [updated] = await db.update(activities)
    .set({
      name: d.name, time: d.time, duration: d.duration,
      location: d.location, cost: d.cost?.toString(),
      category: d.category, status: d.status,
      notes: d.notes, sortOrder: d.sortOrder,
    })
    .where(eq(activities.id, activityId))
    .returning();

  res.json(updated);
});

router.delete('/:id/activities/:activityId', async (req: AuthRequest, res) => {
  const activityId = p(req, 'activityId');
  await db.delete(activities).where(eq(activities.id, activityId));
  res.json({ success: true });
});

// ==================== EXPENSES ====================

router.post('/:id/expenses', async (req: AuthRequest, res) => {
  const tripId = p(req, 'id');
  const d = req.body;

  const [expense] = await db.insert(expenses).values({
    tripId,
    description: d.description,
    amount: d.amount.toString(),
    category: d.category || 'other',
    paidByUserId: d.paidByUserId || req.userId!,
    splitWithUserIds: d.splitWithUserIds,
    date: d.date,
    receiptUrl: d.receiptUrl,
  }).returning();

  res.status(201).json(expense);
});

router.get('/:id/expenses/balances', async (req: AuthRequest, res) => {
  const tripId = p(req, 'id');

  const tripExpenses = await db.select().from(expenses)
    .where(eq(expenses.tripId, tripId));

  const companions = await db.select().from(tripCompanions)
    .where(eq(tripCompanions.tripId, tripId));

  const totals: Record<string, number> = {};
  companions.forEach(c => {
    if (c.userId) totals[c.userId] = 0;
  });

  tripExpenses.forEach(exp => {
    const splitIds = exp.splitWithUserIds || [];
    const perPerson = parseFloat(exp.amount) / (splitIds.length || 1);
    splitIds.forEach((id: string) => {
      if (totals[id] !== undefined) totals[id] -= perPerson;
    });
    if (totals[exp.paidByUserId] !== undefined) {
      totals[exp.paidByUserId] += parseFloat(exp.amount);
    }
  });

  const balances = companions
    .filter(c => c.userId)
    .map(c => ({
      userId: c.userId,
      name: c.name,
      balance: Math.round((totals[c.userId!] || 0) * 100) / 100,
    }));

  res.json({
    balances,
    totalExpenses: tripExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0),
  });
});

router.delete('/:id/expenses/:expenseId', async (req: AuthRequest, res) => {
  const expenseId = p(req, 'expenseId');
  await db.delete(expenses).where(eq(expenses.id, expenseId));
  res.json({ success: true });
});

// ==================== PHOTOS ====================

router.post('/:id/photos', async (req: AuthRequest, res) => {
  const tripId = p(req, 'id');
  const { url, caption } = req.body;

  const [photo] = await db.insert(photos).values({
    tripId, uploadedBy: req.userId!, url, caption,
  }).returning();

  res.status(201).json(photo);
});

router.delete('/:id/photos/:photoId', async (req: AuthRequest, res) => {
  const photoId = p(req, 'photoId');
  await db.delete(photos).where(eq(photos.id, photoId));
  res.json({ success: true });
});

export default router;
