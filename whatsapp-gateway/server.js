const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

let client = null;
let status = { state: 'idle' };
let isSending = false;

app.get('/status', (req, res) => {
  res.json(status);
});

app.post('/connect', (req, res) => {
  const { action } = req.body || {};

  if (action === 'disconnect') {
    disconnectClient();
    return res.json({ success: true, message: 'Disconnected' });
  }

  if (client) {
    return res.json({ success: true, message: 'Already initializing or connected' });
  }

  initializeClient();
  res.json({ success: true, message: 'Initialization started' });
});

app.post('/send', async (req, res) => {
  const { targets } = req.body || {};

  if (!client || status.state !== 'ready') {
    return res.status(400).json({ error: 'WhatsApp client is not ready. Connect first.' });
  }

  if (isSending) {
    return res.status(400).json({ error: 'Sending already in progress' });
  }

  if (!targets || !Array.isArray(targets) || targets.length === 0) {
    return res.status(400).json({ error: 'No targets provided' });
  }

  isSending = true;
  status = {
    state: 'sending',
    progress: { current: 0, total: targets.length, currentGuestName: targets[0].name || 'Guest' }
  };

  // Run sending in the background
  (async () => {
    for (let i = 0; i < targets.length; i++) {
      if (!isSending) break;

      const target = targets[i];
      status = {
        state: 'sending',
        progress: { current: i + 1, total: targets.length, currentGuestName: target.name || 'Guest' }
      };

      try {
        await client.sendMessage(target.phone, target.message);
      } catch (err) {
        console.error(`Failed to send to ${target.phone}:`, err.message);
      }

      if (i < targets.length - 1) {
        const delay = Math.floor(Math.random() * 7000) + 8000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    status = { state: 'completed', progress: { current: targets.length, total: targets.length } };
    isSending = false;
  })();

  res.json({ success: true, message: 'Sending started' });
});

const fs = require('fs');

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

function initializeClient() {
  status = { state: 'initializing' };

  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'gateway-session' }),
    puppeteer: {
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || getExecutablePath(),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  client.on('qr', (qr) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
    status = { state: 'qr', qrCode: qrUrl };
  });

  client.on('ready', () => {
    status = { state: 'ready' };
  });

  client.on('auth_failure', (msg) => {
    status = { state: 'error', error: `Auth failed: ${msg}` };
    disconnectClient(true);
  });

  client.on('disconnected', () => {
    status = { state: 'idle' };
    disconnectClient();
  });

  client.initialize().catch(err => {
    status = { state: 'error', error: err.message };
    disconnectClient(true);
  });
}

function disconnectClient(keepErrorState = false) {
  if (client) {
    client.destroy().catch(() => {});
    client = null;
  }
  if (!keepErrorState) {
    status = { state: 'idle' };
  }
  isSending = false;
}

app.listen(PORT, () => {
  console.log(`WhatsApp Gateway listening on port ${PORT}`);
});
