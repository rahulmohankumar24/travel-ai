# Travel AI — Product Requirements Document

## Vision

Travel AI is an agentic travel platform that combines the trip-planning power of tools like Wanderlog with AI-driven booking, deal-finding, and personalized concierge capabilities. The long-term vision is a system where a user can have a 5-minute conversation — voice or text — and walk away with a fully planned, booked, and optimized trip.

---

## Problem Statement

Travel planning today is fragmented and time-consuming:

1. **Research is scattered** — users bounce between Google, TripAdvisor, blogs, Reddit, and YouTube to figure out where to stay, what to do, and how to get around.
2. **Booking is siloed** — flights on one site, hotels on another, activities on a third. No single platform optimizes across all of them.
3. **Deals are hidden** — better prices exist across loyalty programs, package bundles, off-peak timing, and alternative airports/routes, but finding them requires expertise most travelers don't have.
4. **Travel agents are expensive and slow** — traditional agents solve the above but charge premiums, have limited availability, and often lack real-time pricing data.

Travel AI closes all four gaps with an AI-first approach.

---

## Target Users

| Segment | Description |
|---------|-------------|
| **Casual travelers** | 1–3 trips/year, want simplicity, don't enjoy the planning process |
| **Frequent travelers** | 5+ trips/year, value deal optimization and time savings |
| **Group trip organizers** | Planning for families, friend groups, or corporate offsites — coordination is painful |
| **Luxury / experience seekers** | Want curated, high-quality recommendations — willing to pay for concierge-level service |

---

## Core Product Pillars

### 1. Agentic Trip Planner (Wanderlog++)

A rich, interactive trip-planning workspace where the AI is a first-class collaborator, not just a search bar.

- **Itinerary builder** — day-by-day schedule with maps, travel times, and conflict detection
- **Smart suggestions** — AI recommends activities, restaurants, and logistics based on preferences, weather, local events, and time constraints
- **Collaborative planning** — invite travel companions to vote on options, add wishes, and see the shared itinerary in real time
- **Import & parse** — paste a blog post, YouTube link, or TikTok and the AI extracts actionable recommendations into the itinerary
- **Map-first view** — everything plotted geographically so users can cluster activities by proximity and minimize transit

### 2. In-App Booking Engine

Users should never have to leave the app to book. The platform acts as a meta-search + booking agent.

- **Flights** — aggregate across airlines, OTAs, and fare aggregators; surface hidden-city ticketing, positioning flights, and mistake fares where legal
- **Lodging** — hotels, Airbnb/VRBO, hostels, and boutique stays; compare across platforms and flag price drops or better cancellation policies
- **Activities & experiences** — tours, tickets, reservations (OpenTable, Resy), and local transport passes
- **Car rentals & ground transport** — rental cars, airport transfers, ride-share estimates
- **Unified checkout** — single payment flow across all booking types; store payment methods and traveler details for one-tap booking

### 3. Deal Intelligence

The AI actively works to save users money — before, during, and after booking.

- **Price tracking & alerts** — monitor flights and hotels after search; notify when prices drop
- **Bundle optimization** — find combinations (flight + hotel, multi-city routes) that are cheaper than individual bookings
- **Loyalty & points integration** — connect airline/hotel loyalty accounts; the AI factors points redemption into cost comparisons
- **Timing recommendations** — "Book this flight now — prices for this route typically rise 3 weeks before departure"
- **Alternative suggestions** — "Flying into Oakland instead of SFO saves $180 and adds 25 min of transit"

### 4. AI Travel Agent (Concierge Mode)

A conversational interface that replicates the experience of working with a high-end travel agent.

- **Voice or text intake** — user describes what they want in natural language; the AI asks clarifying questions and builds the trip
- **5-minute call flow (future)** — structured phone/voice conversation; AI transcribes, extracts preferences, and generates a complete trip proposal within minutes of hanging up
- **Preference learning** — the system remembers past trips, preferred airlines, hotel chains, budget ranges, dietary restrictions, accessibility needs, and travel style
- **Proactive management** — after booking, the agent monitors for flight delays, gate changes, weather disruptions, and rebooking opportunities
- **Human escalation** — for complex or high-value bookings, seamlessly hand off to a human travel advisor with full context

---

## Information Architecture

```
Home
├── My Trips
│   ├── Upcoming
│   ├── In Progress (active trip with real-time info)
│   └── Past
├── Plan a Trip (new trip wizard / chat)
│   ├── Chat with AI
│   ├── Itinerary Builder
│   ├── Map View
│   └── Collaborators
├── Explore
│   ├── Trending Destinations
│   ├── Deals & Alerts
│   └── Inspiration (curated collections)
├── Bookings
│   ├── Flights
│   ├── Lodging
│   ├── Activities
│   └── Ground Transport
├── Profile
│   ├── Preferences & Travel Style
│   ├── Loyalty Accounts
│   ├── Payment Methods
│   ├── Traveler Profiles (companions)
│   └── Trip History
└── AI Agent
    ├── Chat
    ├── Call (future)
    └── Recommendations
```

---

## Tech Stack (Proposed)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React Native (Expo) | Single codebase for iOS, Android, and web |
| **Backend** | Node.js / Express or Fastify | Fast iteration, large ecosystem for API integrations |
| **Database** | PostgreSQL + PostGIS | Relational data with geospatial queries for map features |
| **Cache / Queue** | Redis + BullMQ | Price tracking jobs, background deal scanning |
| **AI Layer** | Claude API (Anthropic) | Conversational planning, itinerary generation, preference extraction |
| **Search / Booking APIs** | Amadeus, Skyscanner, Google Flights, Booking.com, Airbnb (unofficial/scraping where needed) | Aggregated inventory and pricing |
| **Maps** | Mapbox or Google Maps | Itinerary visualization, travel time calculations |
| **Auth** | Clerk or Auth0 | Social login, multi-device support |
| **Payments** | Stripe | Unified checkout, saved payment methods |
| **Voice (future)** | Twilio + Deepgram/Whisper | Inbound calls, real-time transcription |

---

## MVP Scope (Phase 1)

The first version focuses on proving the core value prop: **AI-powered trip planning that actually books things.**

### In Scope
- Chat-based trip planning with Claude — user describes a trip, AI generates a multi-day itinerary
- Itinerary view with day-by-day breakdown, map pins, and drag-to-reorder
- Flight search and comparison (via Amadeus or similar API)
- Hotel/lodging search and comparison
- In-app booking for flights and hotels (redirect to partner for final checkout is acceptable in MVP)
- Price alerts — user can "watch" a flight or hotel and get notified of drops
- User accounts with saved preferences and trip history
- Basic collaborative planning — share a trip link, companions can view and comment

### Out of Scope (Phase 2+)
- Voice/call intake and transcription
- Activity and restaurant booking
- Loyalty/points integration
- Bundle optimization engine
- Human advisor escalation
- Car rental and ground transport booking
- Proactive disruption monitoring

---

## Key Screens (MVP)

### 1. Onboarding
- Sign up / sign in
- Quick preferences survey: budget level, travel style (adventure / relaxation / culture / food), preferred airlines/hotels, home airport

### 2. New Trip Chat
- Full-screen conversational interface
- AI asks: Where? When? Who's going? Budget? Must-dos?
- As the conversation progresses, a trip card builds in real time on the side (or below on mobile)
- User can say "book it" at any point to move to checkout

### 3. Itinerary View
- Day-by-day cards with time slots
- Each item shows: name, location, cost, booking status (suggested / booked / watched)
- Map panel showing all pins for the selected day
- "Ask AI" floating button to modify ("move dinner to Day 3", "find a cheaper hotel")

### 4. Search & Book
- Tabbed view: Flights | Hotels | Activities (grayed out in MVP)
- Search results with filters (price, duration, stops, rating)
- Each result shows comparison across sources
- "Book" button → payment flow or partner redirect

### 5. My Trips Dashboard
- Cards for each trip with cover image, dates, destination, and completion status
- Quick actions: share, duplicate, archive

### 6. Deal Alerts
- List of watched items with current price and trend chart
- Push notification settings

---

## Business Model

| Revenue Stream | Description |
|----------------|-------------|
| **Affiliate commissions** | Earn referral fees from booking partners (flights, hotels, activities) — this is the primary revenue driver at launch |
| **Premium subscription** | $9.99/mo — unlimited AI planning, advanced deal alerts, priority booking, preference memory across trips |
| **Concierge tier (future)** | $29.99/mo or per-trip fee — human advisor access, complex itinerary support, VIP bookings |
| **Sponsored placements** | Hotels/experiences can pay for featured placement in AI recommendations (clearly labeled) |

---

## Success Metrics

| Metric | Target (6 months post-launch) |
|--------|-------------------------------|
| MAU | 50,000 |
| Trips planned per user per month | 1.5 |
| Booking conversion rate (plan → book) | 15% |
| Revenue per booking | $12 avg affiliate commission |
| User retention (30-day) | 40% |
| NPS | 50+ |

---

## Open Questions

1. **Booking depth in MVP** — should we do full in-app checkout or is redirect-to-partner acceptable to ship faster?
2. **Pricing data freshness** — how frequently can we poll flight/hotel APIs without hitting rate limits or cost issues?
3. **Legal considerations** — hidden-city ticketing recommendations, scraping OTA prices, and acting as a booking intermediary all carry legal nuance. Need legal review.
4. **Voice call MVP** — should we prototype the 5-minute call flow early (even as a beta feature) to validate the concept, or wait until the text-based product is mature?
5. **Competitive moat** — the planning UX is replicable; the moat is likely in deal intelligence and preference learning. How aggressively do we invest in these early?

---

## Appendix: Competitive Landscape

| Competitor | Strengths | Gaps Travel AI Fills |
|-----------|-----------|----------------------|
| **Wanderlog** | Great trip planner, import from maps/blogs | No booking, no AI agent, no deal finding |
| **Google Travel** | Flight/hotel search, integrated with Maps | No itinerary builder, no AI planning, no proactive deals |
| **Hopper** | Excellent price prediction for flights | Limited to flights/hotels, no trip planning, no conversational AI |
| **TripIt** | Auto-organizes bookings from email | Passive — doesn't help plan or book, just organizes |
| **Traditional travel agents** | Personalized service, complex itineraries | Expensive, slow, not always available, limited real-time data |
| **ChatGPT / Claude (raw)** | Conversational planning | No booking, no real-time prices, no maps, no persistence |
