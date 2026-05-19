import { Router } from 'express';
import { db } from '../db/index.js';
import { aiConversations } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { chat, createTripFromPlan } from '../services/ai.js';

const router = Router();
router.use(authenticate);

function param(req: AuthRequest, name: string): string {
  const val = req.params[name];
  return Array.isArray(val) ? val[0] : val;
}

// List conversations
router.get('/conversations', async (req: AuthRequest, res) => {
  const conversations = await db.query.aiConversations.findMany({
    where: (c, { eq }) => eq(c.userId, req.userId!),
    orderBy: (c, { desc }) => [desc(c.updatedAt)],
  });
  res.json(conversations);
});

// Get conversation messages
router.get('/conversations/:id', async (req: AuthRequest, res) => {
  const id = param(req, 'id');
  const conversation = await db.query.aiConversations.findFirst({
    where: (c, { and, eq }) => and(eq(c.id, id), eq(c.userId, req.userId!)),
    with: { messages: { orderBy: (m, { asc }) => [asc(m.createdAt)] } },
  });

  if (!conversation) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }
  res.json(conversation);
});

// Send a message
router.post('/message', async (req: AuthRequest, res) => {
  const { conversationId, message } = req.body;
  if (!message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  try {
    const result = await chat(req.userId!, conversationId || null, message);
    res.json({
      conversationId: result.conversationId,
      response: result.response,
      tripPlan: result.tripPlan,
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'AI service error', details: err.message });
  }
});

// Create trip from AI plan
router.post('/create-trip', async (req: AuthRequest, res) => {
  const { conversationId, plan } = req.body;
  if (!conversationId || !plan) {
    res.status(400).json({ error: 'conversationId and plan are required' });
    return;
  }

  try {
    const tripId = await createTripFromPlan(req.userId!, conversationId, plan);
    res.status(201).json({ tripId });
  } catch (err: any) {
    console.error('Create trip error:', err);
    res.status(500).json({ error: 'Failed to create trip', details: err.message });
  }
});

// Delete conversation
router.delete('/conversations/:id', async (req: AuthRequest, res) => {
  await db.delete(aiConversations)
    .where(eq(aiConversations.id, param(req, 'id')));
  res.json({ success: true });
});

export default router;
