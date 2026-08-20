<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Startup Rules for Antigravity

When a user instructs you to **"start the project"**, you must execute the following actions in sequence to ensure the environment is fully up-to-date and running correctly:

1. **Pull Latest Changes from Main Branch**:
   - Run `git checkout main` and `git pull origin main` to sync local code with remote.
2. **Sync Project Dependencies**:
   - Run `npm install` at the root of the project.
   - Run `npm install` in the `whatsapp-gateway/` directory to sync its dependencies as well.
3. **Start the Servers**:
   - Run `npm run dev` in the root directory to start the Next.js development server.
   - Run `npm start` in the `whatsapp-gateway/` directory if the user intends to use the WhatsApp gateway features (ensure `WHATSAPP_GATEWAY_URL` is set in `.env`).

For full configuration guidelines and database setup instructions, refer to [LOCAL_SETUP.md](file:///D:/Pramuditha/Dev%20projects/digital-wedding-invitation/LOCAL_SETUP.md).
