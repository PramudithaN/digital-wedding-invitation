const fs = require('fs');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Path to mock database
const dbPath = path.join(__dirname, '../mock-db.json');

// Read database
if (!fs.existsSync(dbPath)) {
  console.error("Database file not found at " + dbPath);
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const guests = db.guests || [];
const weddingDetails = db.weddingDetails || {
  bride_name: 'Oshidhie',
  groom_name: 'Kaveen',
  date: 'Wednesday, September 23, 2026',
  venue: 'Monarch Imperial',
  city: 'Colombo, Sri Lanka'
};

// Filter guests: has phone, and RSVP status is pending/empty, and invite not sent yet (no sent_at)
const targets = guests.filter(g => {
  if (!g.phone) return false;
  const alreadySent = g.invite_link && g.invite_link.sent_at;
  const isPending = !g.rsvp || !g.rsvp.status || g.rsvp.status === 'pending';
  return !alreadySent && isPending;
});

if (targets.length === 0) {
  console.log("No pending guests with phone numbers found to invite.");
  process.exit(0);
}

console.log(`Found ${targets.length} guests to invite.`);

function getExecutablePath() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

// Initialize WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    executablePath: getExecutablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('\n================================================================================');
  console.log('Please scan the QR code below using your phone\'s WhatsApp to authenticate:');
  console.log('================================================================================\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('\nWhatsApp client is authenticated and ready! Starting bulk send...\n');
  
  for (let i = 0; i < targets.length; i++) {
    const guest = targets[i];
    
    // Clean phone number (leave digits only)
    let phoneClean = guest.phone.replace(/[^\d]/g, '');
    
    // Add local country code if starting with 0
    if (phoneClean.startsWith('0')) {
      phoneClean = '94' + phoneClean.slice(1);
    }
    
    const whatsappId = `${phoneClean}@c.us`;
    const inviteUrl = `https://digital-wedding-invitation-beige.vercel.app/invite/${guest.invite_token}`;
    
    const message = `Hi ${guest.name} 👋,\n\nYou're warmly invited to celebrate the wedding of\n\n  *${weddingDetails.bride_name} & ${weddingDetails.groom_name}*\n\n📅 ${weddingDetails.date}\n📍 ${weddingDetails.venue}, ${weddingDetails.city}\n\nPlease let us know if you can make it:\n👉 _${inviteUrl}_\n\nWe hope to celebrate this special day with you! 💍`;

    try {
      console.log(`[${i + 1}/${targets.length}] Sending invite to ${guest.name} (${guest.phone})...`);
      await client.sendMessage(whatsappId, message);
      
      // Update local db state to record invitation sent
      const now = new Date().toISOString();
      const dbGuest = db.guests.find(g => g.id === guest.id);
      if (dbGuest) {
        dbGuest.invite_link = dbGuest.invite_link || {};
        dbGuest.invite_link.sent_at = now;
      }
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
      
      console.log(`✅ Successfully sent to ${guest.name}!`);
    } catch (err) {
      console.error(`❌ Failed to send to ${guest.name}:`, err.message);
    }

    // Wait 10-18 seconds between messages to mimic human behavior and avoid WhatsApp spam flags
    if (i < targets.length - 1) {
      const delay = Math.floor(Math.random() * 8000) + 10000;
      console.log(`Waiting ${delay / 1000} seconds before next message to keep your WhatsApp number safe...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.log('\n================================================================================');
  console.log('Bulk manual sending script completed successfully!');
  console.log('================================================================================\n');
  
  await client.destroy();
  process.exit(0);
});

client.initialize();
