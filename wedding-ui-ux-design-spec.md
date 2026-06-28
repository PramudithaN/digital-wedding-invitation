# Wedding Invitation Manager - UI/UX Design Specification

A precise design language guide for the admin dashboard and the public invitation page. Built around Apple-level minimalism: restrained colour, generous whitespace, purposeful motion.

---

## Design Philosophy

> **Less colour. More space. Every element earns its place.**

Inspired by Apple's Human Interface Guidelines and Linear's dashboard aesthetic. The design uses a single blue primary, neutral greys for everything structural, and white as the dominant surface. Motion is subtle and physics-based - it communicates depth, not decoration.

---

## Design Tokens

### Colour palette

```css
:root {
  /* Primary */
  --blue-50:  #EFF6FF;
  --blue-100: #DBEAFE;
  --blue-500: #3B82F6;   /* primary action colour */
  --blue-600: #2563EB;   /* hover state */
  --blue-700: #1D4ED8;   /* pressed state */

  /* Neutrals - the majority of the UI lives here */
  --grey-0:   #FFFFFF;
  --grey-50:  #F9FAFB;   /* page background */
  --grey-100: #F3F4F6;   /* card / sidebar background */
  --grey-200: #E5E7EB;   /* dividers, borders */
  --grey-400: #9CA3AF;   /* placeholder text, icons (inactive) */
  --grey-600: #4B5563;   /* secondary text */
  --grey-900: #111827;   /* primary text */

  /* Semantic - used sparingly, only in status badges */
  --green-500: #22C55E;   /* attending */
  --red-400:   #F87171;   /* declined */
  --amber-400: #FBBF24;   /* pending */

  /* Surfaces */
  --surface-base:    var(--grey-0);
  --surface-subtle:  var(--grey-50);
  --surface-raised:  var(--grey-100);
  --border-default:  var(--grey-200);
  --shadow-sm:       0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:       0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg:       0 12px 40px rgba(0,0,0,0.10);
}
```

> **Rule:** Blue appears only on interactive elements (buttons, links, focus rings, active nav). Never use blue as a background fill or decorative colour.

---

### Typography

```css
/* System font stack - same as Apple.com */
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display',
             'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

/* Scale */
--text-xs:   0.75rem;   /* 12px - labels, captions */
--text-sm:   0.875rem;  /* 14px - table cells, helper text */
--text-base: 1rem;      /* 16px - body */
--text-lg:   1.125rem;  /* 18px - card titles */
--text-xl:   1.25rem;   /* 20px - section headings */
--text-2xl:  1.5rem;    /* 24px - page title */
--text-3xl:  1.875rem;  /* 30px - dashboard headline numbers */

/* Weight */
--font-normal:   400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;

/* Line height */
--leading-tight:  1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

---

### Spacing system (4px base)

```
4px   xs   - icon padding, tight gaps
8px   sm   - between label and input
12px  md   - inner card padding (compact)
16px  lg   - default inner card padding
24px  xl   - between sections within a card
32px  2xl  - between cards
48px  3xl  - section vertical spacing
64px  4xl  - page-level vertical breathing room
```

---

### Border radius

```css
--radius-sm:   6px;    /* inputs, badges */
--radius-md:   10px;   /* cards */
--radius-lg:   14px;   /* modal panels */
--radius-full: 9999px; /* pills, avatars */
```

---

## Admin Dashboard

### Layout

```
┌────────────────────────────────────────────────────────┐
│  Sidebar (240px)  │  Main content area                 │
│                   │                                    │
│  [Logo / couple]  │  Top bar: page title + actions     │
│                   │  ─────────────────────────────     │
│  Nav items        │  Page content                      │
│  (icon + label)   │                                    │
│                   │                                    │
│  ─────────────── │                                    │
│  [User avatar]    │                                    │
└────────────────────────────────────────────────────────┘

Mobile (< 768px): sidebar becomes a bottom tab bar (5 icons max)
Tablet (768–1024px): sidebar collapses to icon-only (64px wide)
Desktop (> 1024px): full sidebar (240px)
```

### Sidebar spec

```
Background:    --grey-0  (white, not grey - keeps it airy)
Border-right:  1px solid --grey-200
Width:         240px desktop / 64px tablet / hidden mobile

Logo area:     24px top padding, couple initials monogram or text logo
               e.g.  "S & P"  in --font-semibold, --grey-900

Nav item:
  height:        40px
  border-radius: --radius-sm
  padding:       0 12px
  gap:           10px (icon + label)
  icon size:     18px

  Default:   icon --grey-400, label --grey-600, background transparent
  Hover:     background --grey-100, label --grey-900, icon --grey-600
  Active:    background --blue-50, label --blue-600, icon --blue-500

Nav items:
  Dashboard   (grid icon)
  Guests      (users icon)
  RSVP        (check-circle icon)
  Send        (send icon)
  Tables      (layout icon)
  Analytics   (bar-chart icon)
  Settings    (settings icon)

Bottom of sidebar:
  Admin avatar + name, small -- --grey-400 text
```

### Top bar

```
Height:       56px
Background:   --grey-0
Border-bottom: 1px solid --grey-200
Backdrop:     backdrop-filter: blur(12px) - sticky on scroll

Left:  Page title  --text-xl --font-semibold --grey-900
Right: Action button (primary blue) + optional icon button(s)
```

### Motion - Scroll in Motion (Admin)

All scroll-triggered animations use `IntersectionObserver` with a threshold of `0.15`. No animation libraries needed - CSS only.

```css
/* Base state - elements start invisible and slightly low */
.scroll-reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered children */
.scroll-reveal:nth-child(1) { transition-delay: 0ms; }
.scroll-reveal:nth-child(2) { transition-delay: 60ms; }
.scroll-reveal:nth-child(3) { transition-delay: 120ms; }
.scroll-reveal:nth-child(4) { transition-delay: 180ms; }
```

> Easing `cubic-bezier(0.16, 1, 0.3, 1)` is Apple's spring curve - fast out, soft landing.

---

### Dashboard page

#### Headcount summary cards (top row)

6 cards in a responsive grid. Each card:

```
Background:    --grey-0
Border:        1px solid --grey-200
Border-radius: --radius-md
Padding:       20px 24px
Shadow:        --shadow-sm

Layout:
  Row 1: icon (18px, --grey-400)  +  label (--text-sm, --grey-600)
  Row 2: number (--text-3xl, --font-bold, --grey-900)
  Row 3: sub-label (--text-xs, --grey-400)  e.g. "+3 today"

Hover:  shadow elevates to --shadow-md, 200ms ease
```

Cards: Total Invited · Attending · Declined · Pending · Total Seats · +1 Guests

> Only the "Attending" card gets a subtle left border accent: `border-left: 3px solid --green-500`. No other colour.

#### RSVP progress bar

Below the cards, a single horizontal bar:

```
Height:       8px
Background:   --grey-200
Border-radius: --radius-full

Fill segments (left to right, no gap):
  Green  - attending %
  Red    - declined %
  Amber  - pending %

Labels below:  "87 attending · 14 declined · 19 pending"
               --text-sm, --grey-600
```

#### Recent activity feed

Right column (or bottom on mobile). A vertical timeline of the last 10 RSVP actions.

```
Each item:
  Left:   12px dot (green/red/amber, matching status)
  Center: "[Name] confirmed attendance"  --text-sm --grey-900
           "2 hours ago"  --text-xs --grey-400
  Right:  Side badge (pill) - "Bride" or "Groom"
           Background: --grey-100, text: --grey-600

Dot connector: 1px dashed --grey-200 vertical line
```

---

### Guest list page

#### Table spec

```
Table background:    --grey-0
Header row:
  Background:        --grey-50
  Text:              --text-xs --font-semibold --grey-400  (uppercase, letter-spacing: 0.05em)
  Border-bottom:     1px solid --grey-200

Data row:
  Height:            52px
  Padding:           0 16px
  Border-bottom:     1px solid --grey-200
  Hover background:  --grey-50 (200ms ease)

Columns:
  Name         - --text-sm --font-medium --grey-900
  Side         - pill badge (see badge spec below)
  Category     - coloured dot (8px) + --text-sm --grey-600
  Status       - pill badge
  Meal         - --text-sm --grey-600
  Sent         - --text-xs --grey-400
  Actions      - 3 icon buttons (send, edit, delete) shown on row hover only
```

#### Badge / pill spec

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.5;
}

/* Status variants */
.badge-attending { background: #F0FDF4; color: #16A34A; }
.badge-declined  { background: #FEF2F2; color: #DC2626; }
.badge-pending   { background: #FFFBEB; color: #D97706; }

/* Side variants */
.badge-bride { background: #FDF4FF; color: #9333EA; }
.badge-groom { background: #EFF6FF; color: #2563EB; }
```

> Pastels only. Never saturated fills on badges.

#### Mobile card view (< 640px)

Each guest becomes a card instead of a table row:

```
Card:
  Background:    --grey-0
  Border:        1px solid --grey-200
  Border-radius: --radius-md
  Padding:       16px
  Margin-bottom: 8px

  Row 1: Name (--font-medium) + Status badge (right-aligned)
  Row 2: Side badge + Category dot + label (--text-sm --grey-600)
  Row 3: Phone  --text-xs --grey-400
  Row 4: Action buttons (Send · Edit · Delete) as text links, --blue-500
```

---

### Send invites page

Clean list of guests with a prominent **Send via WhatsApp** button per row. Batch action bar appears when any rows are selected (checkbox multi-select).

```
Batch bar (appears at bottom on mobile, top on desktop):
  Background:    --grey-900
  Text:          white
  Content:       "3 guests selected  [Send all]  [Deselect]"
  Border-radius: --radius-lg
  Shadow:        --shadow-lg
  Animation:     slides up from bottom, spring easing
```

---

### RSVP Tracker page

Split layout:

- **Left / top:** Filterable table (same style as guest list, columns adapted for RSVP data)
- **Right / bottom:** Bride vs Groom side-by-side column cards

```
Side column card:
  Header:   "Bride's side"  --text-xl --font-semibold
            Total confirmed count (large, --blue-600 for groom, --purple-600 for bride)
  Body:     Category rows with confirmed/total ratio
            e.g. "Family   12 / 18   [████████░░░░]"
  Footer:   Meal breakdown mini row
```

---

## Public Invitation Page

The invitation page is a completely separate visual world from the admin. Where the admin is functional and minimal, the invitation is warm, refined, and immersive.

### Design language - invitation

```
Palette:
  Background:  #FAFAF8   (warm off-white, not clinical white)
  Text primary:   #1A1A1A
  Text secondary: #6B6B6B
  Accent:         #C8A882   (warm champagne gold - used only for decorative elements)
  Dividers:       #E8E4DE

Typography:
  Display (names): 'Playfair Display', Georgia, serif
  Body:            'Inter', system-ui, sans-serif
  Accent script:   'Great Vibes', cursive  (for "&" symbol only)

Motion philosophy:
  Everything fades in on scroll.
  Nothing bounces, flashes, or demands attention.
  Duration: 600–900ms. Easing: ease-out. Delay: stagger by section.
```

---

### Invitation page - section by section

#### Section 1 - Hero (full viewport)

```
Layout:     Full-screen, centered content
Background: Warm #FAFAF8 with a very subtle radial gradient (centre slightly lighter)
            OR a high-quality blurred floral photograph at 8% opacity as background

Content (centered, stacked):
  ┌─────────────────────────────┐
  │   [decorative line element] │  ← thin SVG flourish, 80px wide, champagne gold
  │                             │
  │     Samantha & Priya        │  ← Playfair Display, 52px mobile / 72px desktop
  │                             │     letter-spacing: -0.02em
  │    "Together forever"       │  ← Great Vibes, 28px, --accent gold, optional tagline
  │                             │
  │   Saturday, 14 March 2026   │  ← Inter, 16px, --text-secondary
  │   Grand Pavilion, Colombo   │
  │                             │
  │    ▼  Scroll to explore     │  ← --text-xs, --grey-400, gentle pulse animation
  └─────────────────────────────┘

Animation:
  Names:     fade up, 900ms, delay 200ms
  Tagline:   fade up, 700ms, delay 400ms
  Date/venue: fade up, 600ms, delay 600ms
  Scroll cue: fade in, then loop subtle bounce (translateY 0 → 6px → 0), 2s loop
```

---

#### Section 2 - Countdown timer

```
Background:  white card, max-width 560px, centred, --shadow-sm

Layout:  4 columns
┌────────┬────────┬────────┬────────┐
│  42    │  08    │  14    │  36    │
│  DAYS  │  HRS   │  MIN   │  SEC   │
└────────┴────────┴────────┴────────┘

Number: Playfair Display, 48px, --grey-900
Label:  Inter, 10px, --grey-400, letter-spacing 0.1em, uppercase
Column divider: 1px solid --grey-200

Seconds column animates in real time.
On wedding day: replaces timer with "Today is the day! 🎉"

Scroll-in animation: fade up as a whole card, threshold 0.3
```

---

#### Section 3 - Event timeline

Vertical timeline. Each row is an event card.

```
Timeline line: 1px solid --grey-200, centred vertically

Each event:
  Left:  Time  (Playfair, --text-xl, --grey-900)
  Center: Circle dot (16px, background --accent, border 2px solid white)
  Right: Card
           Title:     --text-base --font-semibold --grey-900
           Location:  --text-sm --grey-600
           Duration:  --text-xs --grey-400

Events:
  3:00 PM   Guest Arrival        Grand Pavilion Foyer
  3:30 PM   Ceremony             Main Hall
  4:30 PM   Cocktails & Photos   Garden Terrace
  6:00 PM   Reception Dinner     Banquet Hall
  9:00 PM   Dancing & Farewell   Main Hall

Scroll animation: each event card fades in + slides in from its side
  Left events:  translateX(-20px) → 0
  Right events: translateX(20px) → 0
  Stagger: 150ms between events
```

---

#### Section 4 - RSVP form

```
Background:   #FAFAF8 (matches page)
Max-width:    480px, centred
Card:         --grey-0, border 1px solid --grey-200, --radius-lg, padding 40px

Header:
  "Will you join us?"  - Playfair, --text-2xl, centred
  "Please respond by 28 February 2026"  - --text-sm --grey-400, centred

Form fields:
  [Attending? toggle - Yes / No  large pill buttons, full width]
  [+ 1?  checkbox + name text field, fades in if Yes selected]
  [Meal preference  radio: Veg · Non-veg · Vegan]
  [Dietary notes  textarea, optional]
  [Message to the couple  textarea, optional]
  [Submit button - full width, --blue-500, --radius-sm, 48px height]

Field style:
  Border:        1px solid --grey-200
  Border-radius: --radius-sm
  Focus:         border-color --blue-500, box-shadow 0 0 0 3px --blue-100
  Label:         --text-sm --font-medium --grey-700, margin-bottom 6px

Toggle buttons (Attending):
  Default:   border 1px solid --grey-200, background --grey-0, text --grey-600
  Selected:  border --blue-500, background --blue-50, text --blue-600

Confirmation screen (replaces form on submit):
  Animated checkmark (SVG stroke-dashoffset animation, 600ms)
  "Thank you, [Name]! We can't wait to celebrate with you."
  Playfair Display, centred, fade in 400ms
```

---

#### Section 5 - Add to Calendar

```
Background:   white card, --shadow-sm, --radius-md
Max-width:    400px, centred
Padding:      32px

Heading:  "Save the date"  --text-xl Playfair

3 buttons in a row (or stacked on mobile):
  [Google Calendar]  [Apple Calendar]  [Outlook]

Button style:
  Background:  --grey-100
  Border:      1px solid --grey-200
  Border-radius: --radius-sm
  Padding:     10px 20px
  Icon:        16px, left of label
  Hover:       background --grey-200, 200ms

Links generate:
  Google: https://calendar.google.com/calendar/render?action=TEMPLATE&...
  Apple:  downloadable .ics file
  Outlook: .ics file (same as Apple)
```

---

#### Section 6 - Moments (Image Gallery)

A masonry-style photo gallery of engagement / pre-wedding moments.

```
Layout:
  Desktop: 3-column masonry
  Tablet:  2-column masonry
  Mobile:  horizontal scroll filmstrip (snap scroll)

Image container:
  Border-radius: --radius-md
  overflow: hidden
  Background: --grey-100 (shimmer placeholder while loading)

Hover effect (desktop only):
  Image scales to 1.03 over 300ms ease
  Subtle dark vignette overlay at 20% opacity fades in
  No text overlay - keep it clean

Scroll animation:
  Each image fades up independently as it enters viewport
  Stagger: 100ms between images
  No image loads until it's about to enter the viewport (lazy loading)

Caption (optional, below gallery):
  "Our journey together"  - --text-sm --grey-400, centred, italic
```

---

#### Section 7 - Venue (Grand Pavilion)

```
Layout:
  Left:   Venue information card
  Right:  Embedded Google Map  (or static map image with link)
  Mobile: Stacked, map below info

Venue card (left):
  Background:  --grey-0
  Border:      1px solid --grey-200
  --radius-md
  Padding:     32px

  Content:
    "Grand Pavilion"       Playfair, --text-2xl
    "Colombo 03, Sri Lanka" --text-sm --grey-600
    [Divider line]
    Address block          --text-sm --grey-700, line-height 1.6
    [Divider line]
    "Parking available on-site"  --text-xs --grey-400, icon prefix
    "Valet service from 2:30 PM" --text-xs --grey-400, icon prefix
    [Get directions button]  → opens Google Maps
      Style: border 1px solid --blue-500, text --blue-600, --radius-sm
             Background: transparent (ghost button)

Map embed (right):
  Border-radius: --radius-md
  overflow: hidden
  Height: 320px desktop / 220px mobile
  Border: 1px solid --grey-200

  Use Google Maps Embed API:
  https://maps.googleapis.com/maps/api/staticmap or iFrame embed

Scroll animation:
  Left card:  fade in + translateX(-20px) → 0
  Right map:  fade in + translateX(20px) → 0
  Both trigger together at threshold 0.2
```

---

#### Section 8 - Footer

```
Background:   --grey-900  (dark base - only dark element on the entire page)
Padding:      48px 24px
Text colour:  white

Content:
  Couple names large   Playfair, 32px, white
  Date                 --text-sm, --grey-400
  [Decorative divider SVG flourish]
  "Made with love for our special day"  --text-xs --grey-400
```

---

### Invitation page scroll animation - master config

```js
// scrollReveal.js - attach to all .reveal elements
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate once only
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
```

```css
/* Base */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.65s ease-out, transform 0.65s ease-out;
}

.reveal.from-left  { transform: translateX(-24px); }
.reveal.from-right { transform: translateX(24px); }

.reveal.visible {
  opacity: 1;
  transform: translate(0);
}

/* Stagger utility */
.stagger-1 { transition-delay: 0ms; }
.stagger-2 { transition-delay: 100ms; }
.stagger-3 { transition-delay: 200ms; }
.stagger-4 { transition-delay: 300ms; }
.stagger-5 { transition-delay: 400ms; }
```

---

## Font loading (Next.js)

```ts
// app/layout.tsx
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

// For the "&" script accent:
// Load 'Great Vibes' via @import in globals.css (weight 400 only)
```

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');

.font-script { font-family: 'Great Vibes', cursive; }
```

---

## Tailwind config extensions

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans:     ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display:  ['var(--font-playfair)', 'Georgia', 'serif'],
        script:   ['Great Vibes', 'cursive'],
      },
      colors: {
        brand: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        accent: {
          gold: '#C8A882',
        },
        neutral: {
          0:   '#FFFFFF',
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          400: '#9CA3AF',
          600: '#4B5563',
          900: '#111827',
        },
      },
      boxShadow: {
        sm:  '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        md:  '0 4px 12px rgba(0,0,0,0.08)',
        lg:  '0 12px 40px rgba(0,0,0,0.10)',
      },
      borderRadius: {
        sm:   '6px',
        md:   '10px',
        lg:   '14px',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'fade-up':    'fade-up 0.65s ease-out forwards',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(6px)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
};
```

---

## Component library checklist

### Admin dashboard components

- [ ] `<Sidebar>` - collapsible, icon-only mode, mobile bottom bar
- [ ] `<TopBar>` - sticky, blurred, page title + action slot
- [ ] `<StatCard>` - icon + number + sub-label, hover elevation
- [ ] `<RSVPProgressBar>` - segmented horizontal bar
- [ ] `<ActivityFeed>` - dot timeline, relative timestamps
- [ ] `<GuestTable>` - sortable, filterable, mobile card fallback
- [ ] `<StatusBadge>` - attending / declined / pending pill
- [ ] `<SideBadge>` - bride / groom pill
- [ ] `<SendButton>` - WhatsApp deep-link, loading state
- [ ] `<BatchActionBar>` - slide-up bar on multi-select
- [ ] `<SideBySlideView>` - two-column confirmed breakdown
- [ ] `<MealBreakdown>` - mini bar chart, text labels
- [ ] `<GuestForm>` - add / edit guest modal / drawer

### Invitation page components

- [ ] `<HeroSection>` - full-viewport, names, tagline, scroll cue
- [ ] `<CountdownTimer>` - live DD HH MM SS
- [ ] `<EventTimeline>` - vertical timeline, alternating cards
- [ ] `<RSVPForm>` - toggle, meal, +1, submit, confirmation screen
- [ ] `<AddToCalendar>` - Google / Apple / Outlook buttons + .ics
- [ ] `<MomentsGallery>` - masonry desktop, filmstrip mobile
- [ ] `<VenueSection>` - info card + Google Maps embed
- [ ] `<InviteFooter>` - dark footer, couple names

---

## Key design rules summary

| Rule | Admin | Invitation |
|---|---|---|
| Primary colour | Blue (#3B82F6) - CTAs only | Champagne gold - decorative only |
| Background | Grey-50 page / white cards | Warm off-white #FAFAF8 |
| Typography | System sans-serif | Playfair Display + Inter |
| Motion trigger | IntersectionObserver, 0.15 threshold | IntersectionObserver, 0.15 threshold |
| Motion style | Fade up 16px, 450ms spring | Fade up 24px, 650ms ease-out |
| Animate once | Yes | Yes |
| Dark surfaces | Never | Footer only |
| Saturated colour | Status badges only (pastel) | Never |
| Shadows | sm on cards, md on hover | sm on cards only |
| Border style | 1px solid grey-200 | 1px solid #E8E4DE |
