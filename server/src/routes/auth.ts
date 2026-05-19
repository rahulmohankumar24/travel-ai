import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users, userPreferences } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: 'email, password, and name are required' });
    return;
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(users).values({
    email,
    passwordHash,
    name,
  }).returning();

  // Create empty preferences
  await db.insert(userPreferences).values({ userId: user.id });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '30d' });

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '30d' });

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
  });
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  const [user] = await db.select().from(users).where(eq(users.id, req.userId!)).limit(1);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const prefs = await db.select().from(userPreferences).where(eq(userPreferences.userId, user.id)).limit(1);

  res.json({
    user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
    preferences: prefs[0] || null,
  });
});

router.put('/preferences', authenticate, async (req: AuthRequest, res) => {
  const {
    homeAirport, budgetLevel, travelStyles, dietaryRestrictions,
    preferredAirlines, preferredHotelChains, seatPreference,
    lodgingPreference, accessibilityNeeds,
  } = req.body;

  const [existing] = await db.select().from(userPreferences).where(eq(userPreferences.userId, req.userId!)).limit(1);

  if (existing) {
    const [updated] = await db.update(userPreferences)
      .set({
        homeAirport, budgetLevel, travelStyles, dietaryRestrictions,
        preferredAirlines, preferredHotelChains, seatPreference,
        lodgingPreference, accessibilityNeeds, updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, req.userId!))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db.insert(userPreferences).values({
      userId: req.userId!,
      homeAirport, budgetLevel, travelStyles, dietaryRestrictions,
      preferredAirlines, preferredHotelChains, seatPreference,
      lodgingPreference, accessibilityNeeds,
    }).returning();
    res.json(created);
  }
});

export default router;
