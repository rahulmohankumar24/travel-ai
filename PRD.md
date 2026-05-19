# Travel AI — Product Requirements Document

## Vision

Travel AI is an agentic travel platform that serves the full spectrum — from budget backpackers to luxury seekers — with AI-driven planning, booking, deal-finding, and personalized concierge capabilities. The platform learns who you are as a traveler and gets better with every trip. The long-term vision is a system where a user can have a 5-minute conversation — voice or text — and walk away with a fully planned, booked, and optimized trip tailored to their unique preferences.

---

## Problem Statement

Travel planning today is fragmented and time-consuming:

1. **Research is scattered** — users bounce between Google, TripAdvisor, blogs, Reddit, and YouTube to figure out where to stay, what to do, and how to get around.
2. **Booking is siloed** — flights on one site, hotels on another, activities on a third. No single platform optimizes across all of them.
3. **Deals are hidden** — better prices exist across loyalty programs, package bundles, off-peak timing, and alternative airports/routes, but finding them requires expertise most travelers don't have.
4. **Planning tools don't book** — apps like Wanderlog are great for organizing, but you still leave the app to actually book everything. Then you need a separate app (TripIt) just to track what you booked.
5. **AI tools don't personalize** — ChatGPT can suggest a Paris itinerary, but it doesn't know you hate museums, prefer boutique hotels, and always fly Delta. Every conversation starts from zero.
6. **Travel agents don't scale** — traditional agents and newer luxury platforms (Voyagier) solve personalization but charge premiums, gate behind memberships, and depend on human advisors that create bottlenecks.

Travel AI closes all six gaps: AI-first planning and booking for everyone, with human advisors available when you want them — not required for every trip.

---

## Competitive Landscape

### Wanderlog — The Planner That Doesn't Book

**What they do well:**
- Map-first planning with route optimization and driving times
- Google Docs-style real-time collaboration
- Reservation import from Gmail/email forwarding
- Large library of user-shared itineraries for inspiration
- Budget tracking and expense splitting

**Where they fall short (our opportunities):**
- **AI is a bolt-on** — ChatGPT-powered assistant is capped on free tier, works only as a rough refinement tool, can't reason about preferences or handle multi-step tasks
- **Zero booking** — plan in Wanderlog, then bounce to Google Flights, Booking.com, Airbnb to actually book; many users pair with TripIt just to track reservations
- **No deal intelligence** — no price tracking, no "book now vs wait" advice, no alternative routes, no loyalty integration
- **Post-booking is dead** — no flight monitoring, no gate change alerts, no disruption handling
- **Rigid at scale** — users report the app gets "unusably slow" as trips grow, templates feel inflexible for complex multi-city itineraries
- **Paywalled basics** — dark mode, PDF export, offline access all locked behind $40/year Pro

### Voyagier — The Luxury Walled Garden

**What they do well:**
- First truly agentic travel platform connecting discovery, booking, and advisors
- VIA (Voyagier Intelligent Agent) as an orchestration layer across travel infrastructure
- Sabre + Viator integration for real-time inventory and booking
- Trip Sync imports past confirmations to learn preferences
- Human luxury travel advisors review and refine every trip

**Where they fall short (our opportunities):**
- **Luxury-only** — built for high-end travelers; ignores the $500–$3K trip range that represents the mass market
- **Advisor-dependent** — every trip flows through human advisors, creating bottlenecks and cost overhead; can't serve a user who wants to plan and book in 10 minutes at midnight
- **Opaque pricing** — tiered memberships + per-trip design fees; not transparent about costs upfront
- **US-focused** — international expansion not planned until late 2026
- **No collaboration** — solo or advisor-mediated experience; no group planning, voting, or shared itineraries
- **No deal optimization** — optimizes for experience quality (upgrades, perks), not value (savings, alternatives, timing)
- **New and unproven** — launched March 2026, minimal user feedback

### Other Competitors

| Competitor | Strengths | Gaps Travel AI Fills |
|-----------|-----------|----------------------|
| **Google Travel** | Flight/hotel search, integrated with Maps | No itinerary builder, no AI planning, no proactive deals |
| **Hopper** | Best-in-class price prediction for flights/hotels | No trip planning, no conversational AI, limited to flights/hotels |
| **TripIt** | Auto-organizes bookings from email | Passive — doesn't help plan or book, just organizes |
| **Layla** | AI trip planner, real-time prices, 24/7 | Planning focused, limited booking depth |
| **Mindtrip** | AI-powered personalized travel | Similar vision but early stage, limited booking |
| **ChatGPT / Claude (raw)** | Conversational planning | No booking, no real-time prices, no maps, no persistence, no personalization |

---

## Our Moat

### 1. Deep Personalization That Compounds

Every interaction makes the AI smarter about you. Not just "you liked Paris" — the system builds a rich traveler profile:

- **Travel style** — adventure vs. relaxation, packed days vs. slow mornings, tourist highlights vs. off-the-beaten-path
- **Accommodation preferences** — boutique hotels vs. Airbnb vs. hostels; must-haves (pool, gym, walkable location)
- **Food & dietary** — cuisine preferences, dietary restrictions, price range, reservation vs. walk-in
- **Logistics preferences** — preferred airlines, seat preferences, home airport, layover tolerance, rental car vs. transit
- **Budget patterns** — splurge on lodging but save on flights, or vice versa; total trip budget ranges
- **Companion context** — traveling with kids? elderly parents? a group of friends? each changes the recommendations entirely
- **Past trip learning** — what you booked, what you rated highly, what you skipped, what you rebooked

This profile persists across trips and gets richer over time. Trip 1 is good. Trip 5 feels like the AI knows you. **This is the moat** — switching to a competitor means starting from zero.

### 2. Full-Loop Platform (Plan → Book → Optimize → Manage)

Nobody owns the complete journey today:
- Wanderlog owns Plan
- Hopper owns Optimize (for flights)
- TripIt owns Manage
- Voyagier owns Plan + Book (for luxury)

We own all four, for all travelers. One app from "I want to go somewhere" to "I'm back home and that was amazing."

### 3. AI-First with Human-in-the-Loop (Not the Reverse)

Voyagier is human-first with AI assistance. We invert it:

- **AI handles 90% autonomously** — planning, searching, comparing, booking standard trips
- **Human advisors step in for the 10%** — complex multi-destination trips, luxury/VIP bookings, corporate travel, situations where the AI flags uncertainty
- **The AI learns from every human intervention** — advisor corrections feed back into the model, so the AI handles more over time

This means we can serve 100x more users per advisor than Voyagier, keeping costs low and prices accessible.

### 4. Deal Intelligence as a Feature, Not a Product

Hopper proved people will use an app just for price prediction. We bundle that capability into a full planning platform:

- Price tracking and drop alerts across flights and hotels
- "Book now vs. wait" recommendations based on historical patterns
- Alternative airport/route suggestions with cost-vs-convenience tradeoffs
- Bundle optimization (flight + hotel cheaper together)
- Loyalty points redemption factored into every comparison
- Post-booking monitoring: "Your hotel dropped $40/night — want us to rebook?"

### 5. Collaborative by Default

Group trips are one of the most painful travel experiences and neither Voyagier nor Hopper address them. We build collaboration into the core:

- Shared itineraries with real-time editing
- Vote on options (restaurants, hotels, activities)
- Group budget tracking and expense splitting
- Per-person preference merging ("Alex is vegetarian, Sam hates early mornings" → AI adjusts)
- One person can "book for group" or split payments

---

## Target Users

| Segment | Description | How We Serve Them |
|---------|-------------|-------------------|
| **Casual travelers** | 1–3 trips/year, want simplicity | Chat with AI → get a trip → book in 3 taps |
| **Frequent travelers** | 5+ trips/year, value deals and time savings | Deep personalization, deal alerts, preference memory |
| **Group trip organizers** | Families, friend groups, corporate offsites | Collaborative planning, voting, group budgets |
| **Budget-conscious travelers** | Students, backpackers, deal hunters | Deal intelligence, alternative suggestions, price tracking |
| **Luxury / experience seekers** | Want curated, high-quality recommendations | White-glove concierge tier with human advisors |
| **Business travelers** | Need efficiency, policy compliance, expensing | Fast rebooking, corporate profiles, receipt management |

---

## Core Product Pillars

### 1. Agentic Trip Planner

A rich, interactive trip-planning workspace where the AI is a first-class collaborator, not a sidebar widget.

- **Itinerary builder** — day-by-day schedule with maps, travel times, and conflict detection
- **Smart suggestions** — AI recommends activities, restaurants, and logistics based on your personal profile, weather, local events, and time constraints
- **Adaptive itineraries** — rain in the forecast? AI reshuffles outdoor activities. Flight delayed? AI adjusts Day 1 automatically
- **Collaborative planning** — invite travel companions to vote on options, add wishes, and see the shared itinerary in real time
- **Import & parse** — paste a blog post, YouTube link, TikTok, or Instagram reel and the AI extracts actionable recommendations into the itinerary
- **Map-first view** — everything plotted geographically so users can cluster activities by proximity and minimize transit

### 2. In-App Booking Engine

Users should never have to leave the app to book. The platform acts as a meta-search + booking agent.

- **Flights** — aggregate across airlines, OTAs, and fare aggregators; surface alternative airports and routing
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
- **Post-booking repricing** — monitor booked hotels/flights for price drops and automatically rebook when savings exceed a threshold

### 4. AI Travel Agent + Human Concierge

A conversational interface that handles most trips autonomously, with human advisors available for complex or high-value scenarios.

**AI Agent (always available):**
- **Voice or text intake** — user describes what they want in natural language; the AI asks clarifying questions and builds the trip
- **5-minute call flow (future)** — structured phone/voice conversation; AI transcribes, extracts preferences, and generates a complete trip proposal within minutes of hanging up
- **Preference learning** — the system remembers past trips, preferred airlines, hotel chains, budget ranges, dietary restrictions, accessibility needs, and travel style
- **Proactive management** — after booking, the agent monitors for flight delays, gate changes, weather disruptions, and rebooking opportunities

**Human Advisors (on-demand):**
- **Escalation triggers** — AI flags trips it's less confident about (complex multi-city, luxury properties, visa requirements, group coordination challenges)
- **User-initiated** — any user can request a human advisor at any point; the advisor inherits full AI context (no re-explaining)
- **Advisor tools** — advisors work within the same platform, seeing the AI's work and refining it rather than starting from scratch
- **Feedback loop** — every advisor correction trains the AI; over time, fewer trips need human intervention

### 5. Traveler Profile & Personalization Engine

The system that makes every trip better than the last.

- **Onboarding survey** — travel style, budget, dietary needs, accessibility, preferred airlines/hotels, home airport
- **Implicit learning** — what you search for, what you book vs. skip, how you rate experiences, what you change in AI-generated itineraries
- **Explicit feedback** — post-trip ratings, "more like this / less like this" on recommendations
- **Companion profiles** — store preferences for frequent travel partners (spouse, kids, friends) so the AI can merge preferences for group trips
- **Seasonal patterns** — "You usually take a beach trip in February and a European city trip in September"
- **Privacy controls** — users can view, edit, and delete any stored preference; opt out of specific tracking categories

---

## Information Architecture

```
Home
├── My Trips
│   ├── Upcoming (with real-time status)
│   ├── In Progress (live flight tracking, daily agenda, local recs)
│   └── Past (ratings, photos, trip journal)
├── Plan a Trip
│   ├── Chat with AI Agent
│   ├── Itinerary Builder
│   ├── Map View
│   ├── Collaborators & Voting
│   └── Request an Advisor
├── Explore
│   ├── Personalized Suggestions ("Based on your trips...")
│   ├── Trending Destinations
│   ├── Deals & Alerts
│   └── Inspiration (curated collections, community itineraries)
├── Bookings
│   ├── Flights
│   ├── Lodging
│   ├── Activities
│   └── Ground Transport
├── Profile
│   ├── Traveler Profile & Preferences
│   ├── Companion Profiles
│   ├── Loyalty Accounts
│   ├── Payment Methods
│   ├── Trip History & Ratings
│   └── Privacy Settings
└── AI Agent
    ├── Chat
    ├── Call (future)
    ├── Active Monitors (price alerts, flight tracking)
    └── Advisor Conversations
```

---

## Tech Stack (Proposed)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React Native (Expo) | Single codebase for iOS, Android, and web |
| **Backend** | Node.js / Express or Fastify | Fast iteration, large ecosystem for API integrations |
| **Database** | PostgreSQL + PostGIS | Relational data with geospatial queries for map features |
| **Personalization Store** | PostgreSQL + vector embeddings | Traveler profiles, preference matching, trip similarity |
| **Cache / Queue** | Redis + BullMQ | Price tracking jobs, background deal scanning |
| **AI Layer** | Claude API (Anthropic) | Conversational planning, itinerary generation, preference extraction |
| **Search / Booking APIs** | Amadeus, Skyscanner, Booking.com, Viator | Aggregated inventory and pricing |
| **Maps** | Mapbox or Google Maps | Itinerary visualization, travel time calculations |
| **Auth** | Clerk or Auth0 | Social login, multi-device support |
| **Payments** | Stripe | Unified checkout, saved payment methods |
| **Voice (future)** | Twilio + Deepgram/Whisper | Inbound calls, real-time transcription |
| **Advisor Tools** | Internal dashboard (React) | Human advisors manage escalated trips in the same platform |

---

## Phased Roadmap

### Phase 1 — MVP: AI Planner + Booking

Prove the core value prop: **AI-powered trip planning that actually books things, personalized to you.**

**In Scope:**
- Chat-based trip planning with Claude — user describes a trip, AI generates a multi-day itinerary
- Onboarding preferences survey to seed personalization from Day 1
- Itinerary view with day-by-day breakdown, map pins, and drag-to-reorder
- Flight search and comparison (via Amadeus or similar API)
- Hotel/lodging search and comparison
- In-app booking for flights and hotels (redirect to partner for final checkout is acceptable)
- Price alerts — user can "watch" a flight or hotel and get notified of drops
- User accounts with saved preferences and trip history
- Basic collaborative planning — share a trip link, companions can view and comment
- Human advisor request button — connects to a small team of advisors via chat for complex trips

### Phase 2 — Personalization + Deals

- Full preference learning from booking and rating history
- "Book now vs. wait" timing recommendations
- Alternative airport/route suggestions
- Activity and restaurant search + booking (Viator, OpenTable/Resy)
- Post-booking price monitoring and automatic rebooking
- Companion profiles and group preference merging
- Voting and polling for group trips

### Phase 3 — Voice + Proactive Agent

- 5-minute voice call intake → full trip generated from transcript
- Proactive disruption monitoring (flight delays, weather, rebooking)
- Loyalty/points integration and redemption optimization
- Bundle optimization engine (flight + hotel packages)
- Adaptive itineraries (auto-reshuffle based on weather, closures, delays)
- Car rental and ground transport booking

### Phase 4 — Scale + Ecosystem

- Community itineraries — share and clone trips from other users
- Seasonal pattern recognition ("Time for your annual beach trip?")
- Corporate travel features (policy compliance, expensing)
- AI learns from advisor corrections at scale, reducing human intervention rate
- International expansion of advisor network
- API for travel influencers/creators to embed booking into content

---

## Key Screens (MVP)

### 1. Onboarding
- Sign up / sign in
- Quick preferences survey: budget level, travel style (adventure / relaxation / culture / food), preferred airlines/hotels, home airport, dietary restrictions, accessibility needs

### 2. New Trip Chat
- Full-screen conversational interface
- AI asks: Where? When? Who's going? Budget? Must-dos?
- As the conversation progresses, a trip card builds in real time on the side (or below on mobile)
- AI tailors suggestions based on your stored profile — not generic recommendations
- User can say "book it" at any point to move to checkout
- "Talk to an advisor" button always accessible

### 3. Itinerary View
- Day-by-day cards with time slots
- Each item shows: name, location, cost, booking status (suggested / booked / watched)
- Map panel showing all pins for the selected day
- "Ask AI" floating button to modify ("move dinner to Day 3", "find a cheaper hotel")
- Share button to invite collaborators

### 4. Search & Book
- Tabbed view: Flights | Hotels | Activities (grayed out in MVP)
- Search results with filters (price, duration, stops, rating)
- Each result shows comparison across sources
- AI badge: "Recommended based on your preferences" or "Best deal — $80 less than avg"
- "Book" button → payment flow or partner redirect

### 5. My Trips Dashboard
- Cards for each trip with cover image, dates, destination, and completion status
- Quick actions: share, duplicate, archive
- "Plan something new" card with personalized destination suggestions

### 6. Deal Alerts
- List of watched items with current price and trend chart
- Push notification settings
- AI insight: "Prices for this route typically drop in 2 weeks"

---

## Business Model

| Revenue Stream | Description |
|----------------|-------------|
| **Affiliate commissions** | Earn referral fees from booking partners (flights, hotels, activities) — primary revenue driver at launch |
| **Premium subscription** | $9.99/mo — unlimited AI planning, advanced deal alerts, price drop rebooking, full preference memory |
| **Concierge tier** | $29.99/mo — everything in Premium + human advisor access, complex itinerary support, VIP bookings and perks |
| **Per-trip advisor fee** | $49–$149 per trip for non-subscribers who want one-off human advisor help |
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
| Personalization engagement | 60% of users complete preferences survey |
| Advisor escalation rate | <10% of trips need human advisor |
| Repeat trip rate | 30% of users plan a 2nd trip within 90 days |

---

## Positioning

```
                    Self-Serve ←—————————————————→ Advisor-Led
                         |                              |
            Budget       |                              |
               ↑         |   Wanderlog (plan only)      |
               |         |   Hopper (flights only)      |
               |         |                              |
               |         |         ★ TRAVEL AI          |
               |         |      (full spectrum)         |
               |         |                              |
               ↓         |                              |   Voyagier
            Luxury       |                              |   (luxury only)
                         |                              |
```

Travel AI occupies the center — **self-serve by default, advisor-available by choice, across all budget levels.** We're not a budget app or a luxury app. We're a *personalized* app that adapts to whoever you are.

---

## Open Questions

1. **Advisor sourcing** — do we hire advisors in-house, partner with an existing advisor network (e.g., Fora, CIRE), or build a marketplace?
2. **Booking depth in MVP** — full in-app checkout or redirect-to-partner to ship faster?
3. **Pricing data freshness** — how frequently can we poll flight/hotel APIs without hitting rate limits or cost issues?
4. **Legal considerations** — scraping OTA prices and acting as a booking intermediary carry legal nuance. Need legal review.
5. **Voice call MVP** — should we prototype the 5-minute call flow early (even as a beta feature) to validate the concept?
6. **Personalization cold start** — how useful is the AI on Trip 1 before it has history? The onboarding survey needs to be good enough to make the first trip feel personalized.
7. **Advisor economics** — at what subscription volume does the concierge tier become margin-positive given advisor labor costs?
