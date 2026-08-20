# Local Setup and Startup Guide

This document provides step-by-step instructions for running the **Digital Wedding Invitation Manager** project locally on your machine. This project consists of a Next.js web application and an optional, companion Node.js/Express WhatsApp gateway.

---

## 🏗️ Architecture Overview

The project features a decoupled architecture:
1. **Frontend / Admin Dashboard**: A responsive, modern [Next.js](https://nextjs.org/) (v16.2.9) application utilizing [Material UI](https://mui.com/) (v9.1.2) and [TailwindCSS](https://tailwindcss.com/) (v4.0).
2. **Database Backend**: Powered by [Supabase](https://supabase.com/) (PostgreSQL) with Row Level Security (RLS) policies.
3. **WhatsApp Gateway**: A stateless Express.js server (in [whatsapp-gateway/](file:///D:/Pramuditha/Dev%20projects/digital-wedding-invitation/whatsapp-gateway)) that controls local WhatsApp sessions using [whatsapp-web.js](https://wwebjs.dev/) and Puppeteer.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v20.0 or higher)
*   [npm](https://www.npmjs.com/) (v10.0 or higher)
*   [Git](https://git-scm.com/)
*   **Google Chrome** or **Microsoft Edge** browser installed in default locations (required for local WhatsApp Web simulation via Puppeteer)
*   A [Supabase](https://supabase.com/) account and project (free tier is sufficient)

---

## ⚙️ Step-by-Step Setup

### Step 1: Clone the Repository & Update
Clone the codebase and ensure you are on the `main` branch:
```bash
git clone https://github.com/PramudithaN/digital-wedding-invitation.git
cd digital-wedding-invitation
git checkout main
git pull origin main
```

### Step 2: Database Setup (Supabase)
1. Log in to your **Supabase Dashboard** and create a new project.
2. Go to the **SQL Editor** in the side navigation panel.
3. Open the [`supabase-schema.sql`](file:///D:/Pramuditha/Dev%20projects/digital-wedding-invitation/supabase-schema.sql) file located at the root of the project.
4. Copy its content, paste it into the SQL Editor, and click **Run**. This will create the required tables (`categories`, `guests`, `rsvps`, `settings`) and configure Row Level Security (RLS) policies.

### Step 3: Configure Environment Variables
Create a file named `.env` in the root of the project and populate it with your Supabase credentials and gateway details:
```env
# Supabase Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-public-api-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# WhatsApp Gateway Connection URL
# Set this to the local gateway server URL (typically http://localhost:8080)
WHATSAPP_GATEWAY_URL=http://localhost:8080

# The base url where your next.js server is accessed (useful for deep-linking)
NEXT_PUBLIC_HOSTED_URL=http://localhost:3000
```

### Step 4: Install Dependencies & Run Next.js
At the root of the project, run:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Step 5: Setup & Start WhatsApp Gateway (Optional)
If you wish to send bulk invitations automatically through WhatsApp:
1. Navigate to the `whatsapp-gateway` directory:
   ```bash
   cd whatsapp-gateway
   ```
2. Install its dependencies:
   ```bash
   npm install
   ```
3. Run the gateway server:
   ```bash
   npm start
   ```
   *Note: The gateway runs on port `8080` by default. Make sure `WHATSAPP_GATEWAY_URL=http://localhost:8080` is configured in your root `.env` file.*

---

## 🤖 Running the Project with Antigravity

Since you are using the **Antigravity** AI assistant, you can automate starting the project using a simple user prompt.

When you ask the Antigravity agent to **"start the project"**, it reads the custom workspace instructions in [`AGENTS.md`](file:///D:/Pramuditha/Dev%20projects/digital-wedding-invitation/AGENTS.md) and executes the following sequence:

1. **Pulls Latest Code**: Runs `git pull origin main` to ensure your local branch is synchronized.
2. **Syncs Dependencies**: Installs node modules for the main app and `whatsapp-gateway`.
3. **Launches Servers**: Initiates the Next.js development server and the WhatsApp gateway server.

Simply tell Antigravity:
> *"Start the project"*
