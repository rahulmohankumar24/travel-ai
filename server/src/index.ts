import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import chatRoutes from './routes/chat.js';
import searchRoutes from './routes/search.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/search', searchRoutes);

// API docs summary
app.get('/api', (_req, res) => {
  res.json({
    name: 'Travel AI API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login',
        'GET /api/auth/me': 'Get current user + preferences',
        'PUT /api/auth/preferences': 'Update user preferences',
      },
      trips: {
        'GET /api/trips': 'List all trips',
        'GET /api/trips/:id': 'Get trip with full details',
        'POST /api/trips': 'Create a trip',
        'PUT /api/trips/:id': 'Update trip',
        'DELETE /api/trips/:id': 'Delete trip',
        'POST /api/trips/:id/companions': 'Add companion',
        'PUT /api/trips/:id/companions/:cid/rsvp': 'Update RSVP',
        'POST /api/trips/:id/flights': 'Add flight',
        'POST /api/trips/:id/lodging': 'Add lodging',
        'POST /api/trips/:id/days': 'Add itinerary day',
        'POST /api/trips/:id/days/:did/activities': 'Add activity',
        'POST /api/trips/:id/expenses': 'Add expense',
        'GET /api/trips/:id/expenses/balances': 'Get expense balances (who owes who)',
        'POST /api/trips/:id/photos': 'Add photo',
      },
      chat: {
        'GET /api/chat/conversations': 'List AI conversations',
        'GET /api/chat/conversations/:id': 'Get conversation with messages',
        'POST /api/chat/message': 'Send message to AI agent',
        'POST /api/chat/create-trip': 'Create trip from AI-generated plan',
      },
      search: {
        'GET /api/search/flights': 'Search flights (origin, destination, departureDate, adults)',
        'GET /api/search/hotels': 'Search hotels (cityCode, checkIn, checkOut)',
        'POST /api/search/alerts': 'Create price alert',
        'GET /api/search/alerts': 'List price alerts',
      },
    },
  });
});

app.listen(PORT, () => {
  console.log(`Travel AI server running on http://localhost:${PORT}`);
  console.log(`API docs: http://localhost:${PORT}/api`);
});
