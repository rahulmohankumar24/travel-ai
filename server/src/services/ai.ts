import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db/index.js';
import { aiConversations, aiMessages, trips, tripCompanions, itineraryDays, activities, lodging, flights } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { searchFlights } from './flights.js';
import { searchHotels } from './hotels.js';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an AI travel agent for Travel AI. You help users plan trips, find deals, and book travel.

You have access to tools to search for flights and hotels. Use them when the user provides enough details (destination, dates, etc).

When planning a trip:
1. Ask clarifying questions if needed (dates, budget, travel style, number of travelers)
2. Search for flights and hotels using the tools
3. Suggest a day-by-day itinerary
4. Highlight deals and savings

When you have enough info to create a trip, respond with a structured JSON block wrapped in <trip_plan> tags. Example:

<trip_plan>
{
  "destination": "Tokyo",
  "country": "Japan",
  "startDate": "2026-07-10",
  "endDate": "2026-07-17",
  "itinerary": [
    {
      "date": "2026-07-10",
      "dayLabel": "Day 1 - Arrival",
      "activities": [
        {
          "name": "Arrive at Narita Airport",
          "time": "15:00",
          "duration": "1h",
          "location": "Narita Airport",
          "cost": 0,
          "category": "transport",
          "notes": null
        }
      ]
    }
  ],
  "lodgingSuggestions": [
    {
      "name": "Hotel Gracery Shinjuku",
      "type": "hotel",
      "address": "1-19-1 Kabukicho, Shinjuku",
      "checkIn": "2026-07-10",
      "checkOut": "2026-07-17",
      "pricePerNight": 145,
      "rating": 4.5,
      "amenities": ["WiFi", "AC", "Breakfast"]
    }
  ]
}
</trip_plan>

Be conversational and helpful. Mention specific prices when you can. Always personalize based on what you know about the user's preferences.`;

const tools: Anthropic.Messages.Tool[] = [
  {
    name: 'search_flights',
    description: 'Search for flights between two airports on specific dates. Returns available flights with prices.',
    input_schema: {
      type: 'object' as const,
      properties: {
        origin: { type: 'string', description: 'Origin airport IATA code (e.g., SFO)' },
        destination: { type: 'string', description: 'Destination airport IATA code (e.g., NRT)' },
        departureDate: { type: 'string', description: 'Departure date in YYYY-MM-DD format' },
        returnDate: { type: 'string', description: 'Return date in YYYY-MM-DD format (optional for one-way)' },
        adults: { type: 'number', description: 'Number of adult passengers' },
        cabinClass: { type: 'string', description: 'Cabin class: ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST' },
      },
      required: ['origin', 'destination', 'departureDate', 'adults'],
    },
  },
  {
    name: 'search_hotels',
    description: 'Search for hotels in a city for specific dates. Returns available hotels with prices and ratings.',
    input_schema: {
      type: 'object' as const,
      properties: {
        cityCode: { type: 'string', description: 'IATA city code (e.g., TYO for Tokyo)' },
        checkIn: { type: 'string', description: 'Check-in date in YYYY-MM-DD format' },
        checkOut: { type: 'string', description: 'Check-out date in YYYY-MM-DD format' },
        adults: { type: 'number', description: 'Number of adult guests' },
        maxPrice: { type: 'number', description: 'Maximum price per night in USD (optional)' },
      },
      required: ['cityCode', 'checkIn', 'checkOut'],
    },
  },
];

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chat(
  userId: string,
  conversationId: string | null,
  userMessage: string,
): Promise<{ conversationId: string; response: string; tripPlan?: any }> {
  // Get or create conversation
  let convId = conversationId;
  if (!convId) {
    const [conv] = await db.insert(aiConversations).values({
      userId,
      title: userMessage.slice(0, 100),
    }).returning();
    convId = conv.id;
  }

  // Save user message
  await db.insert(aiMessages).values({
    conversationId: convId,
    role: 'user',
    content: userMessage,
  });

  // Load conversation history
  const history = await db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, convId))
    .orderBy(aiMessages.createdAt);

  // Load user preferences for context
  const userPrefs = await db.query.userPreferences.findFirst({
    where: (prefs, { eq }) => eq(prefs.userId, userId),
  });

  let systemPrompt = SYSTEM_PROMPT;
  if (userPrefs) {
    systemPrompt += `\n\nUser preferences:
- Home airport: ${userPrefs.homeAirport || 'Not set'}
- Budget level: ${userPrefs.budgetLevel || 'Not set'}
- Travel styles: ${userPrefs.travelStyles?.join(', ') || 'Not set'}
- Dietary restrictions: ${userPrefs.dietaryRestrictions?.join(', ') || 'None'}
- Preferred airlines: ${userPrefs.preferredAirlines?.join(', ') || 'No preference'}
- Seat preference: ${userPrefs.seatPreference || 'No preference'}
- Lodging preference: ${userPrefs.lodgingPreference || 'No preference'}`;
  }

  const messages: Anthropic.Messages.MessageParam[] = history.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  // Run the agentic loop — handle tool calls
  let response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    tools,
    messages,
  });

  // Process tool use in a loop
  while (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use',
    );

    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

    for (const toolUse of toolUseBlocks) {
      let result: any;
      try {
        if (toolUse.name === 'search_flights') {
          result = await searchFlights(toolUse.input as any);
        } else if (toolUse.name === 'search_hotels') {
          result = await searchHotels(toolUse.input as any);
        } else {
          result = { error: `Unknown tool: ${toolUse.name}` };
        }
      } catch (err: any) {
        result = { error: err.message };
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      });
    }

    // Continue the conversation with tool results
    messages.push({ role: 'assistant', content: response.content });
    messages.push({ role: 'user', content: toolResults });

    response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      tools,
      messages,
    });
  }

  // Extract text response
  const textBlocks = response.content.filter(
    (b): b is Anthropic.Messages.TextBlock => b.type === 'text',
  );
  const fullResponse = textBlocks.map(b => b.text).join('\n');

  // Save assistant message
  await db.insert(aiMessages).values({
    conversationId: convId,
    role: 'assistant',
    content: fullResponse,
  });

  // Check if response contains a trip plan
  let tripPlan = null;
  const planMatch = fullResponse.match(/<trip_plan>([\s\S]*?)<\/trip_plan>/);
  if (planMatch) {
    try {
      tripPlan = JSON.parse(planMatch[1]);
    } catch {
      // Not valid JSON, ignore
    }
  }

  return {
    conversationId: convId,
    response: fullResponse.replace(/<trip_plan>[\s\S]*?<\/trip_plan>/, '').trim(),
    tripPlan,
  };
}

export async function createTripFromPlan(userId: string, conversationId: string, plan: any): Promise<string> {
  const [trip] = await db.insert(trips).values({
    createdBy: userId,
    destination: plan.destination,
    country: plan.country,
    startDate: plan.startDate,
    endDate: plan.endDate,
    status: 'upcoming',
    totalBudget: plan.budget?.toString(),
    aiConversationId: conversationId,
  }).returning();

  // Add creator as companion
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
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

  // Add itinerary
  if (plan.itinerary) {
    for (let i = 0; i < plan.itinerary.length; i++) {
      const day = plan.itinerary[i];
      const [dayRow] = await db.insert(itineraryDays).values({
        tripId: trip.id,
        date: day.date,
        dayLabel: day.dayLabel,
        sortOrder: i,
      }).returning();

      if (day.activities) {
        for (let j = 0; j < day.activities.length; j++) {
          const act = day.activities[j];
          await db.insert(activities).values({
            dayId: dayRow.id,
            tripId: trip.id,
            name: act.name,
            time: act.time,
            duration: act.duration,
            location: act.location,
            cost: act.cost?.toString(),
            category: act.category || 'other',
            status: 'suggested',
            notes: act.notes,
            sortOrder: j,
          });
        }
      }
    }
  }

  // Add lodging suggestions
  if (plan.lodgingSuggestions) {
    for (const l of plan.lodgingSuggestions) {
      await db.insert(lodging).values({
        tripId: trip.id,
        name: l.name,
        type: l.type || 'hotel',
        address: l.address,
        checkIn: l.checkIn,
        checkOut: l.checkOut,
        pricePerNight: l.pricePerNight?.toString(),
        totalPrice: l.totalPrice?.toString(),
        rating: l.rating?.toString(),
        amenities: l.amenities,
        status: 'suggested',
      });
    }
  }

  // Link conversation to trip
  await db.update(aiConversations)
    .set({ tripId: trip.id })
    .where(eq(aiConversations.id, conversationId));

  return trip.id;
}
