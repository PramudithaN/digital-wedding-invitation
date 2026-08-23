const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

const sessions = {
  bride: {
    client: null,
    status: { state: 'idle' },
    isSending: false
  },
  groom: {
    client: null,
    status: { state: 'idle' },
    isSending: false
  },
  bride_relative: {
    client: null,
    status: { state: 'idle' },
    isSending: false
  },

  groom_mother: {
    client: null,
    status: { state: 'idle' },
    isSending: false
  },
  groom_father: {
    client: null,
    status: { state: 'idle' },
    isSending: false
  }
};

function getSessionName(req) {
  const sessionName = req.query.session || (req.body && req.body.session) || 'bride';
  if (['bride', 'groom', 'bride_relative', 'groom_mother', 'groom_father'].includes(sessionName)) {
    return sessionName;
  }
  return 'bride';
}

function getSessionObj(req) {
  const name = getSessionName(req);
  return sessions[name];
}

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

function initializeClient(sessionName) {
  const session = sessions[sessionName];
  session.status = { state: 'initializing' };

  session.client = new Client({
    authStrategy: new LocalAuth({ clientId: `${sessionName}-session` }),
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

  session.client.on('qr', (qr) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
    session.status = { state: 'qr', qrCode: qrUrl };
  });

  session.client.on('ready', () => {
    session.status = { state: 'ready' };
  });

  session.client.on('auth_failure', (msg) => {
    session.status = { state: 'error', error: `Auth failed: ${msg}` };
    disconnectClient(sessionName, true);
  });

  session.client.on('disconnected', () => {
    session.status = { state: 'idle' };
    disconnectClient(sessionName);
  });

  session.client.initialize().catch(err => {
    session.status = { state: 'error', error: err.message };
    disconnectClient(sessionName, true);
  });
}

function disconnectClient(sessionName, keepErrorState = false) {
  const session = sessions[sessionName];
  if (session.client) {
    session.client.destroy().catch(() => {});
    session.client = null;
  }
  if (!keepErrorState) {
    session.status = { state: 'idle' };
  }
  session.isSending = false;
}

app.get('/status', (req, res) => {
  const session = getSessionObj(req);
  res.json(session.status);
});

app.post('/connect', (req, res) => {
  const { action } = req.body || {};
  const sessionName = getSessionName(req);
  const session = sessions[sessionName];

  if (action === 'disconnect') {
    disconnectClient(sessionName);
    return res.json({ success: true, message: `Disconnected ${sessionName} session` });
  }

  if (session.client) {
    return res.json({ success: true, message: 'Already initializing or connected' });
  }

  initializeClient(sessionName);
  res.json({ success: true, message: `Initialization started for ${sessionName} session` });
});

app.post('/send', async (req, res) => {
  const { targets } = req.body || {};
  const sessionName = getSessionName(req);
  const session = sessions[sessionName];

  if (!session.client || session.status.state !== 'ready') {
    return res.status(400).json({ error: `WhatsApp client for ${sessionName} is not ready. Connect first.` });
  }

  if (session.isSending) {
    return res.status(400).json({ error: 'Sending already in progress' });
  }

  if (!targets || !Array.isArray(targets) || targets.length === 0) {
    return res.status(400).json({ error: 'No targets provided' });
  }

  session.isSending = true;
  session.status = {
    state: 'sending',
    progress: { current: 0, total: targets.length, currentGuestName: targets[0].name || 'Guest' }
  };

  // Run sending in the background
  (async () => {
    for (let i = 0; i < targets.length; i++) {
      if (!session.isSending) break;

      const target = targets[i];
      session.status = {
        state: 'sending',
        progress: { current: i + 1, total: targets.length, currentGuestName: target.name || 'Guest' }
      };

      try {
        await session.client.sendMessage(target.phone, target.message);
      } catch (err) {
        console.error(`[${sessionName}] Failed to send to ${target.phone}:`, err.message);
      }

      if (i < targets.length - 1) {
        const delay = Math.floor(Math.random() * 7000) + 8000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    session.status = { state: 'completed', progress: { current: targets.length, total: targets.length } };
    session.isSending = false;
  })();

  res.json({ success: true, message: `Sending started for ${sessionName} session` });
});

app.listen(PORT, () => {
  console.log(`WhatsApp Gateway listening on port ${PORT}`);
});
