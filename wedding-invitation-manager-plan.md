# Wedding Invitation Manager - Implementation Plan

A full-stack digital wedding invitation and RSVP management system with an admin dashboard, beautiful guest-facing invite cards, WhatsApp sending, and real-time headcount tracking.

---

## System Overview

| Layer | What it does |
|---|---|
| **Public / Guest-facing** | Digital invite card (unique URL per guest), RSVP form, WhatsApp deep-link |
| **Backend / API** | Guest CRUD, RSVP submission, invite link generation & open tracking |
| **Database** | Guests, RSVPs, categories, invite links |
| **Admin dashboard** | Guest manager, send invites, RSVP tracker, headcount, analytics, export |

---

## Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | **Next.js 14** (App Router) | One codebase for admin + public invite page; SSR for the card |
| Styling | **Tailwind CSS** | Mobile-first, rapid iteration |
| Database | **PostgreSQL via Supabase** | Free hosted tier, built-in auth, real-time subscriptions |
| Auth | **Supabase Auth / NextAuth.js** | Password-protected admin, no public signup |
| WhatsApp | `wa.me` deep-link → Twilio API | Start free, upgrade to automated sending if needed |
| Hosting | **Vercel** | Native Next.js support, free tier handles wedding-scale traffic |

---

## Database Schema

### `categories`
```sql
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id  UUID NOT NULL,
  name        TEXT NOT NULL,          -- e.g. "Family", "Friends", "Work"
  colour      TEXT NOT NULL,          -- hex colour for UI label
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### `guests`
```sql
CREATE TABLE guests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  phone          TEXT,                -- with country code, e.g. +94771234567
  email          TEXT,
  side           TEXT CHECK (side IN ('bride', 'groom')),
  category_id    UUID REFERENCES categories(id),
  invite_token   UUID UNIQUE DEFAULT gen_random_uuid(),  -- used in invite URL
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);
```

### `rsvps`
```sql
CREATE TABLE rsvps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id        UUID UNIQUE REFERENCES guests(id) ON DELETE CASCADE,
  status          TEXT CHECK (status IN ('attending', 'declined', 'pending')) DEFAULT 'pending',
  plus_one        BOOLEAN DEFAULT FALSE,
  plus_one_name   TEXT,
  meal_choice     TEXT,              -- e.g. "veg", "non-veg", "vegan"
  dietary_notes   TEXT,
  message         TEXT,              -- personal note from guest
  responded_at    TIMESTAMPTZ
);
```

### `invite_links`
```sql
CREATE TABLE invite_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id    UUID REFERENCES guests(id) ON DELETE CASCADE,
  short_code  TEXT UNIQUE NOT NULL,  -- used in short URL
  channel     TEXT DEFAULT 'whatsapp',
  sent_at     TIMESTAMPTZ,
  opened_at   TIMESTAMPTZ            -- set on first page load
);
```

---

## Project Structure

```
/
├── app/
│   ├── (admin)/
│   │   ├── layout.tsx              # Admin shell with sidebar / bottom nav
│   │   ├── dashboard/page.tsx      # Summary cards + charts
│   │   ├── guests/page.tsx         # Guest list table
│   │   ├── guests/[id]/page.tsx    # Edit guest
│   │   ├── rsvp/page.tsx           # RSVP tracker
│   │   ├── tables/page.tsx         # Bride vs groom side view
│   │   ├── categories/page.tsx     # Manage categories
│   │   ├── analytics/page.tsx      # Charts and export
│   │   └── settings/page.tsx       # Wedding details, card content
│   ├── invite/
│   │   └── [token]/page.tsx        # Public invitation card
│   └── api/
│       ├── guests/route.ts
│       ├── rsvp/route.ts
│       └── invite/route.ts
├── components/
│   ├── admin/
│   │   ├── GuestTable.tsx
│   │   ├── HeadcountCards.tsx
│   │   ├── RSVPStatusBadge.tsx
│   │   ├── SendWhatsAppButton.tsx
│   │   └── SideBySlideView.tsx
│   └── invite/
│       ├── InviteCard.tsx          # The beautiful full-screen card
│       └── RSVPForm.tsx
├── lib/
│   ├── supabase.ts
│   ├── whatsapp.ts                 # Link builder + Twilio client
│   └── tokens.ts
└── tailwind.config.ts
```

---

## Implementation Phases

### Phase 1 - Foundation `(Week 1–2)`

**Goal:** Project skeleton + admin auth + basic guest management.

- [ ] Initialise Next.js 14 project with Tailwind CSS and TypeScript
- [ ] Set up Supabase project - run schema migrations
- [ ] Admin login page (Supabase Auth)
- [ ] Protected admin layout with responsive sidebar (collapses to bottom tab bar on mobile)
- [ ] Guest add / edit / delete form
  - Fields: name, phone, email, side (bride / groom), category, notes
- [ ] Simple guest list table with search and filter by side / category
- [ ] Category manager (create, colour-code, delete)

**Deliverable:** Admin can log in and manage a guest list.

---

### Phase 2 - Digital Invitation Card `(Week 2–3)`

**Goal:** A beautiful, shareable, mobile-first invite page for each guest.

**Route:** `/invite/[token]`

Each guest gets a unique URL containing their `invite_token`. On load, the server looks up the guest, marks `invite_links.opened_at`, and renders a personalised card.

#### Card design spec
- Full-screen hero with couple's names in a serif display font (e.g. **Playfair Display**)
- Wedding date, venue name, and address
- Countdown timer to the wedding day
- Subtle entrance animations (fade-in, soft upward drift) - CSS only, no heavy libraries
- Floral or gold-foil decorative accents as SVG or CSS
- Personalised greeting: *"Dear Sarah, you are warmly invited…"*
- Smooth scroll to RSVP form below the card

#### RSVP form (embedded on the card)
- Attending? Yes / No toggle
- Plus one - checkbox + name field (if yes)
- Meal choice - radio buttons (Veg / Non-veg / Vegan / No preference)
- Dietary notes - short text
- Personal message - optional textarea
- Submit → writes to `rsvps` table → shows animated confirmation screen

**Mobile-first rules:**
- No horizontal scroll at any viewport
- Tap targets ≥ 44px
- Font sizes legible at 375px width
- Card hero image loads at appropriate resolution via `next/image`

**Deliverable:** Guests can open their invite link and RSVP entirely on mobile.

---

### Phase 3 - WhatsApp Sending `(Week 3)`

**Goal:** Admin can send personalised invite links to guests via WhatsApp, individually or in batch.

#### Option A - `wa.me` deep-link (free, manual send)

Each guest row in the admin table gets a **Send via WhatsApp** button.

```
https://wa.me/94771234567?text=Hi%20Sarah%2C%20you%27re%20warmly%20invited%20to%20our%20wedding!%20Please%20RSVP%20here%3A%20https%3A%2F%2Fyourdomain.com%2Finvite%2Fabc123
```

On mobile this opens WhatsApp with the message pre-filled - admin taps send. On desktop it opens WhatsApp Web.

#### Option B - Twilio WhatsApp Business API (automated)

For batch sending without manual taps. The admin clicks **Send all pending** and the server queues messages via Twilio's API. Requires a WhatsApp Business number.

```ts
// lib/whatsapp.ts
import twilio from 'twilio';

export async function sendWhatsAppInvite(phone: string, guestName: string, token: string) {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  const inviteUrl = `${process.env.BASE_URL}/invite/${token}`;
  await client.messages.create({
    from: 'whatsapp:+14155238886',
    to: `whatsapp:${phone}`,
    body: `Hi ${guestName}, you're warmly invited to our wedding! 🎉\nPlease RSVP here: ${inviteUrl}`,
  });
}
```

#### Admin UI for sending
- Per-guest: "Send" button in guest row → opens WhatsApp deep-link (Option A) or calls API (Option B)
- Batch: "Send to all not yet sent" button with confirmation modal
- Status column shows: Not sent / Sent (date) / Opened (date)

**Deliverable:** Admin can send personalised invite links to all guests via WhatsApp.

---

### Phase 4 - RSVP Tracking & Tables `(Week 4)`

**Goal:** Full visibility into who's coming, from which side, in which category.

#### RSVP tracker table

Filterable, sortable table with columns:

| Name | Side | Category | Status | Meal | +1 | Responded |
|---|---|---|---|---|---|---|
| Sarah K. | Bride | Family | ✅ Attending | Veg | Yes - Tom | 12 Jun |
| James R. | Groom | Friends | ❌ Declined | - | - | 14 Jun |
| Maya L. | Bride | Work | ⏳ Pending | - | - | - |

- Filter by: side, category, status, meal choice
- Search by name
- Click row to view full RSVP details + edit status manually (for guests who respond by phone)
- Colour-coded status badges (green / red / amber)

#### Headcount summary cards

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Total invited  │ │   Attending ✅  │ │   Declined ❌   │
│       120       │ │       87        │ │       14        │
└─────────────────┘ └─────────────────┘ └─────────────────┘
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Pending ⏳     │ │   Total seats   │ │  +1 guests      │
│       19        │ │   87 + 12 = 99  │ │       12        │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

#### Side-by-side view

Two-column layout: Bride's side (left) | Groom's side (right). Each column shows:
- Category sub-groups (Family, Friends, Work…)
- Confirmed count per group
- Total confirmed for that side

#### Meal breakdown

Veg: 34 | Non-veg: 41 | Vegan: 8 | No preference: 4

**Deliverable:** Admin has a full picture of attendance and headcount in real time.

---

### Phase 5 - Analytics & Export `(Week 5)`

**Goal:** Insights over time + printable / shareable lists.

#### Analytics
- Response rate over time (line chart - responses per day since invites sent)
- Open rate: % of invite links opened
- Pending breakdown: invited but not opened / opened but not responded
- Category-level response rate bar chart

#### Export options
- **CSV export** - full guest list with RSVP status, meal, +1
- **Confirmed attendees PDF** - clean printable list grouped by side and category
- **Seating helper CSV** - name, side, category, meal, +1 name - ready to paste into a seating chart tool

---

## Mobile Responsiveness Rules

These apply across the entire project:

| Context | Rule |
|---|---|
| Admin sidebar | Collapses to a bottom tab bar on screens < 768px |
| Guest table | Becomes a card stack on mobile (one card per guest, key fields visible) |
| Forms | Single-column layout, large tap targets (min 44px height) |
| Headcount cards | 2-column grid on mobile, 3-column on tablet, 6-column on desktop |
| Invite card | Designed mobile-first; hero image scales via `object-fit: cover` |
| RSVP form | Full-width inputs, large radio buttons, sticky submit button at bottom |
| Send button | Always prominently placed - admin will use this from their own phone |

---

## WhatsApp Message Template

```
Hi [Name] 👋,

You're warmly invited to celebrate the wedding of

  ✨ [Bride Name] & [Groom Name] ✨

📅 [Date]
📍 [Venue], [City]

Please let us know if you can make it:
👉 [Invite URL]

We hope to celebrate this special day with you! 💍
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Twilio (optional - for automated WhatsApp sending)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## Estimated Timeline

| Phase | Feature | Duration |
|---|---|---|
| 1 | Foundation, auth, guest management | Week 1–2 |
| 2 | Digital invitation card + RSVP form | Week 2–3 |
| 3 | WhatsApp sending (deep-link + optional API) | Week 3 |
| 4 | RSVP tracking, tables, headcount | Week 4 |
| 5 | Analytics, export (CSV + PDF) | Week 5 |

**Total:** ~5 weeks solo, ~2–3 weeks with frontend/backend split.

The biggest time investment is Phase 2 (making the invite card genuinely beautiful) and the WhatsApp integration decision (manual deep-link vs automated API).

---

## Recommended Starting Point

1. `npx create-next-app@latest wedding-manager --typescript --tailwind --app`
2. Create a Supabase project and run the schema SQL above
3. Build the guest add/edit form first - it unblocks everything else
4. Design the invite card in isolation before wiring up the token-based routing
5. Use `wa.me` links first; upgrade to Twilio only if you need batch automation
