import {
  pgTable,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  jsonb,
  uuid,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==================== ENUMS ====================

export const tripStatusEnum = pgEnum('trip_status', ['draft', 'upcoming', 'active', 'past', 'cancelled']);
export const rsvpEnum = pgEnum('rsvp_status', ['going', 'maybe', 'pending', 'declined']);
export const bookingStatusEnum = pgEnum('booking_status', ['suggested', 'watched', 'booked', 'cancelled']);
export const expenseCategoryEnum = pgEnum('expense_category', ['food', 'transport', 'lodging', 'activity', 'other']);
export const lodgingTypeEnum = pgEnum('lodging_type', ['hotel', 'airbnb', 'hostel', 'resort', 'villa', 'other']);
export const activityCategoryEnum = pgEnum('activity_category', [
  'food', 'sightseeing', 'adventure', 'culture', 'nightlife', 'transport', 'shopping', 'relaxation', 'other',
]);

// ==================== USERS ====================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  homeAirport: text('home_airport'),
  budgetLevel: text('budget_level'), // 'budget', 'mid', 'luxury'
  travelStyles: jsonb('travel_styles').$type<string[]>(), // ['adventure', 'culture', 'food', 'relaxation']
  dietaryRestrictions: jsonb('dietary_restrictions').$type<string[]>(),
  preferredAirlines: jsonb('preferred_airlines').$type<string[]>(),
  preferredHotelChains: jsonb('preferred_hotel_chains').$type<string[]>(),
  seatPreference: text('seat_preference'), // 'window', 'aisle', 'middle'
  lodgingPreference: text('lodging_preference'), // 'hotel', 'airbnb', 'hostel'
  accessibilityNeeds: jsonb('accessibility_needs').$type<string[]>(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==================== TRIPS ====================

export const trips = pgTable('trips', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  destination: text('destination').notNull(),
  country: text('country'),
  coverImageUrl: text('cover_image_url'),
  startDate: text('start_date'), // ISO date string
  endDate: text('end_date'),
  status: tripStatusEnum('status').default('draft').notNull(),
  totalBudget: decimal('total_budget', { precision: 10, scale: 2 }),
  notes: text('notes'),
  aiConversationId: text('ai_conversation_id'), // links to the chat that created this trip
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('trips_created_by_idx').on(table.createdBy),
  index('trips_status_idx').on(table.status),
]);

// ==================== TRIP COMPANIONS ====================

export const tripCompanions = pgTable('trip_companions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  email: text('email').notNull(),
  name: text('name').notNull(),
  rsvp: rsvpEnum('rsvp').default('pending').notNull(),
  role: text('role').default('member'), // 'owner', 'editor', 'viewer'
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => [
  index('companions_trip_idx').on(table.tripId),
]);

// ==================== FLIGHTS ====================

export const flights = pgTable('flights', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  airline: text('airline').notNull(),
  flightNumber: text('flight_number').notNull(),
  departureAirport: text('departure_airport').notNull(),
  departureCity: text('departure_city'),
  departureTime: text('departure_time').notNull(),
  arrivalAirport: text('arrival_airport').notNull(),
  arrivalCity: text('arrival_city'),
  arrivalTime: text('arrival_time').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),
  status: bookingStatusEnum('status').default('suggested').notNull(),
  confirmationCode: text('confirmation_code'),
  bookingReference: text('booking_reference'), // external booking system ref
  seatClass: text('seat_class'), // 'economy', 'premium_economy', 'business', 'first'
  rawApiData: jsonb('raw_api_data'), // store full Amadeus response for reference
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('flights_trip_idx').on(table.tripId),
]);

// ==================== LODGING ====================

export const lodging = pgTable('lodging', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: lodgingTypeEnum('type').default('hotel').notNull(),
  address: text('address'),
  latitude: decimal('latitude', { precision: 9, scale: 6 }),
  longitude: decimal('longitude', { precision: 9, scale: 6 }),
  checkIn: text('check_in').notNull(),
  checkOut: text('check_out').notNull(),
  pricePerNight: decimal('price_per_night', { precision: 10, scale: 2 }),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),
  imageUrl: text('image_url'),
  status: bookingStatusEnum('status').default('suggested').notNull(),
  confirmationCode: text('confirmation_code'),
  bookingReference: text('booking_reference'),
  rating: decimal('rating', { precision: 2, scale: 1 }),
  amenities: jsonb('amenities').$type<string[]>(),
  rawApiData: jsonb('raw_api_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('lodging_trip_idx').on(table.tripId),
]);

// ==================== ITINERARY ====================

export const itineraryDays = pgTable('itinerary_days', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // ISO date
  dayLabel: text('day_label'), // "Day 1 - Arrival"
  sortOrder: integer('sort_order').default(0),
}, (table) => [
  index('itinerary_days_trip_idx').on(table.tripId),
]);

export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  dayId: uuid('day_id').notNull().references(() => itineraryDays.id, { onDelete: 'cascade' }),
  tripId: uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  time: text('time'), // "14:00"
  duration: text('duration'), // "2h"
  location: text('location'),
  latitude: decimal('latitude', { precision: 9, scale: 6 }),
  longitude: decimal('longitude', { precision: 9, scale: 6 }),
  cost: decimal('cost', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),
  category: activityCategoryEnum('category').default('other').notNull(),
  status: bookingStatusEnum('status').default('suggested').notNull(),
  confirmationCode: text('confirmation_code'),
  notes: text('notes'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('activities_day_idx').on(table.dayId),
  index('activities_trip_idx').on(table.tripId),
]);

// ==================== EXPENSES ====================

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  category: expenseCategoryEnum('category').default('other').notNull(),
  paidByUserId: uuid('paid_by_user_id').notNull().references(() => users.id),
  splitWithUserIds: jsonb('split_with_user_ids').$type<string[]>().notNull(),
  date: text('date').notNull(),
  receiptUrl: text('receipt_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('expenses_trip_idx').on(table.tripId),
]);

// ==================== PHOTOS ====================

export const photos = pgTable('photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  uploadedBy: uuid('uploaded_by').notNull().references(() => users.id),
  url: text('url').notNull(),
  caption: text('caption'),
  takenAt: timestamp('taken_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('photos_trip_idx').on(table.tripId),
]);

// ==================== AI CONVERSATIONS ====================

export const aiConversations = pgTable('ai_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  tripId: uuid('trip_id').references(() => trips.id),
  title: text('title'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('conversations_user_idx').on(table.userId),
]);

export const aiMessages = pgTable('ai_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => aiConversations.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  toolCalls: jsonb('tool_calls'), // store any tool use data
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('messages_conversation_idx').on(table.conversationId),
]);

// ==================== PRICE ALERTS ====================

export const priceAlerts = pgTable('price_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  tripId: uuid('trip_id').references(() => trips.id),
  type: text('type').notNull(), // 'flight' | 'hotel'
  searchParams: jsonb('search_params').notNull(), // the search criteria to re-run
  currentPrice: decimal('current_price', { precision: 10, scale: 2 }),
  targetPrice: decimal('target_price', { precision: 10, scale: 2 }),
  isActive: boolean('is_active').default(true),
  lastChecked: timestamp('last_checked'),
  priceHistory: jsonb('price_history').$type<{ price: number; date: string }[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('alerts_user_idx').on(table.userId),
]);

// ==================== RELATIONS ====================

export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  trips: many(trips),
  conversations: many(aiConversations),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  creator: one(users, {
    fields: [trips.createdBy],
    references: [users.id],
  }),
  companions: many(tripCompanions),
  flights: many(flights),
  lodging: many(lodging),
  days: many(itineraryDays),
  activities: many(activities),
  expenses: many(expenses),
  photos: many(photos),
}));

export const tripCompanionsRelations = relations(tripCompanions, ({ one }) => ({
  trip: one(trips, { fields: [tripCompanions.tripId], references: [trips.id] }),
  user: one(users, { fields: [tripCompanions.userId], references: [users.id] }),
}));

export const itineraryDaysRelations = relations(itineraryDays, ({ one, many }) => ({
  trip: one(trips, { fields: [itineraryDays.tripId], references: [trips.id] }),
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  day: one(itineraryDays, { fields: [activities.dayId], references: [itineraryDays.id] }),
  trip: one(trips, { fields: [activities.tripId], references: [trips.id] }),
}));

export const flightsRelations = relations(flights, ({ one }) => ({
  trip: one(trips, { fields: [flights.tripId], references: [trips.id] }),
}));

export const lodgingRelations = relations(lodging, ({ one }) => ({
  trip: one(trips, { fields: [lodging.tripId], references: [trips.id] }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  trip: one(trips, { fields: [expenses.tripId], references: [trips.id] }),
  paidBy: one(users, { fields: [expenses.paidByUserId], references: [users.id] }),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  trip: one(trips, { fields: [photos.tripId], references: [trips.id] }),
  uploader: one(users, { fields: [photos.uploadedBy], references: [users.id] }),
}));

export const priceAlertsRelations = relations(priceAlerts, ({ one }) => ({
  user: one(users, { fields: [priceAlerts.userId], references: [users.id] }),
  trip: one(trips, { fields: [priceAlerts.tripId], references: [trips.id] }),
}));

export const aiConversationsRelations = relations(aiConversations, ({ one, many }) => ({
  user: one(users, { fields: [aiConversations.userId], references: [users.id] }),
  trip: one(trips, { fields: [aiConversations.tripId], references: [trips.id] }),
  messages: many(aiMessages),
}));

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
  conversation: one(aiConversations, {
    fields: [aiMessages.conversationId],
    references: [aiConversations.id],
  }),
}));
