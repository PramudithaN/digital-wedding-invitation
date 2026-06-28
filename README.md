# Digital Wedding Invitation Manager

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Material UI](https://img.shields.io/badge/Material_UI-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

> A premium, responsive Next.js wedding administration portal featuring real-time guest registries, RSVP monitors, interactive seating table assignments, and automated WhatsApp invitation link generation.

---

## 📸 Preview

**Invitation Card Mobile Landing**
![Preview](public/ok31.webp)

---

## 📖 About This Project

This application acts as a comprehensive manager for wedding arrangements. Administrators can coordinate guest details (like category, side of the wedding, private notes, and seat requirements), trigger WhatsApp reminders with localized phone number formatting, and manually override response statuses. The public-facing invitation card is rendered with warm aesthetics, customized invite parameters, countdown timers, calendar additions, and map venues.

---

## ✨ Features

- 🚀 **Silent Data Fetching** - Guest additions and status updates load silently in the background, updating views instantly without full-screen spinners.
- 📱 **Mobile Touch Optimization** - Action buttons are sized to medium tap targets with distinct gap spacing to prevent mistaps on smaller screens.
- 🎨 **Visual Brand Accent Mapping** - Cards display side-specific border lines (purple for the Bride, blue for the Groom) for clear guest identification.
- 💬 **WhatsApp E.164 Normalization** - Automatically cleans up local input numbers and formats them to international standard `+94` codes to launch whatsapp messaging templates.
- 🔒 **Cookie-Based Route Protection** - Restricts administrator dashboards and trackers using Next.js middleware checking.
- 📆 **Integrated Schedule & Mapping** - Synchronizes dates, times, countdown counters, Google Maps venue shortcuts, and downloadable `.ics` calendar events.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js v16.2.9](https://nextjs.org/) |
| UI Components | [Material UI v9.1.2](https://mui.com/) |
| Styling | [TailwindCSS v4.0](https://tailwindcss.com/) |
| Language | [TypeScript v5.0](https://www.typescriptlang.org/) |
| Icons | [Lucide React v1.21.0](https://lucide.dev/) |
| Database | [Supabase PostgreSQL](https://supabase.com/) |

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) **v20.0 or higher**
- [npm](https://www.npmjs.com/) **v10.0 or higher**
- [Git](https://git-scm.com/)

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/PramudithaN/digital-wedding-invitation.git
cd digital-wedding-invitation
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=Your Supabase anonymous public API key
SUPABASE_SERVICE_ROLE_KEY=Your Supabase database service role key
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the Next.js development server in Turbopack mode |
| `npm run build` | Compiles the production-ready optimized build |
| `npm run start` | Runs the compiled production build locally |
| `npm run lint` | Performs code syntax verification checks with ESLint |

---

## 📁 Project Structure

```
digital-wedding-invitation/
├── app/                        # Next.js app router files
│   ├── (admin)/                # Admin tracker dashboards and settings
│   ├── api/                    # Server side endpoints for guests, RSVPs, and SMS
│   └── invite/                 # Public wedding invitation cards for guests
├── components/                 # Shared UI layouts and widgets
├── lib/                        # Type declarations, constant arrays, and DB connections
├── public/                     # Static mandala templates and backgrounds
├── tsconfig.json               # TypeScript compiler options
└── package.json                # Project dependencies and custom scripts
```

---

## 🙋‍♂️ Connect with Me

- **GitHub**: [github.com/PramudithaN](https://github.com/PramudithaN)
- **LinkedIn**: [linkedin.com/in/pramuditha-nadun-612b1b204](https://linkedin.com/in/pramuditha-nadun-612b1b204)
- **Email**: pramudithanadun@gmail.com

---

*Developed with ❤️ by Pramuditha Nadun.*
