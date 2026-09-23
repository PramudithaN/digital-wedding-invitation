# Digital Wedding Invitation Manager

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Material UI](https://img.shields.io/badge/Material_UI-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

> A modern wedding administration portal and guest management platform featuring real-time guest registries, RSVP tracking, interactive seating table assignments, and automated WhatsApp invitation link generation.

---

## Preview

**Invitation Card Mobile View**
![Preview](public/ok31.webp)

---

## Overview

This application serves as a centralized management platform for wedding coordination. Administrators can manage guest profiles (categorization, wedding side affiliation, private notes, and seat quotas), dispatch WhatsApp invitations with localized phone number formatting, and manage RSVP responses. The public-facing invitation card features customized guest parameters, countdown timers, calendar integrations, and venue map locations.

---

## Key Features

- **Real-Time Data Management**: Guest creation and status updates synchronize seamlessly in the background without disruptive full-screen loading states.
- **Mobile-Optimized Interface**: Clean touch targets and responsive layouts tailored for mobile and tablet devices.
- **Guest Affiliation Mapping**: Visual accent indicators provide clear guest categorization between Bride and Groom sides.
- **WhatsApp E.164 Phone Normalization**: Automatically validates and formats local phone numbers to the international `+94` standard for direct messaging integration.
- **Route Protection & Access Control**: Next.js Proxy/Middleware safeguards administrator routes while routing unauthenticated guests to public lookup pages.
- **Schedule & Location Integration**: Synchronized event countdowns, Google Maps navigation links, and downloadable `.ics` calendar files.
- **Seating Arrangement Lookup**: Public table lookup enabling attending guests to find their assigned tables quickly.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js v16.2.9](https://nextjs.org/) |
| UI Components | [Material UI v9.1.2](https://mui.com/) |
| Styling | [TailwindCSS v4.0](https://tailwindcss.com/) |
| Language | [TypeScript v5.0](https://www.typescriptlang.org/) |
| Icons | [Lucide React v1.21.0](https://lucide.dev/) |
| Database | [Supabase PostgreSQL](https://supabase.com/) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) **v20.0 or higher**
- [npm](https://www.npmjs.com/) **v10.0 or higher**
- [Git](https://git-scm.com/)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/PramudithaN/digital-wedding-invitation.git
cd digital-wedding-invitation
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_PASSWORD=your_admin_password
```

### 4. Run the development server

```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Compiles and optimizes the application for production |
| `npm run start` | Runs the compiled production build locally |
| `npm run lint` | Runs ESLint for code analysis and syntax checks |

---

## Project Structure

```
digital-wedding-invitation/
├── app/                        # Next.js App Router
│   ├── (admin)/                # Protected administrative dashboards and tools
│   ├── api/                    # Server-side API endpoints
│   ├── find-table/             # Public seating arrangement lookup
│   ├── invite/                 # Public invitation landing pages
│   ├── login/                  # Administrator authentication
│   └── page.tsx                # Root routing handler
├── components/                 # Reusable UI components
├── lib/                        # Database clients, utilities, and type definitions
├── public/                     # Static media and background assets
├── proxy.ts                    # Edge route protection and access control
├── tsconfig.json               # TypeScript configuration
└── package.json                # Project dependencies and metadata
```

---

## Contact & Author

- **GitHub**: [PramudithaN](https://github.com/PramudithaN)
- **LinkedIn**: [Pramuditha Nadun](https://linkedin.com/in/pramuditha-nadun-612b1b204)
- **Email**: pramudithanadun@gmail.com

---

Developed by Pramuditha Nadun.
