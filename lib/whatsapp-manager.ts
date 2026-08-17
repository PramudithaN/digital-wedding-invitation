import { Client, LocalAuth } from 'whatsapp-web.js';
import fs from 'fs';
import path from 'path';
import { getGuests, logInviteSent, getWeddingDetails } from './db';
import { DEFAULT_WHATSAPP_TEMPLATE } from './constants';
import { formatPhoneNumber } from './whatsapp';

export interface WhatsAppStatus {
  state: 'idle' | 'initializing' | 'qr' | 'ready' | 'sending' | 'completed' | 'error';
  qrCode?: string;
  progress?: {
    current: number;
    total: number;
    currentGuestName?: string;
  };
  error?: string;
}

const globalForWhatsApp = globalThis as unknown as {
  whatsappClient: Client | null;
  whatsappStatus: WhatsAppStatus;
  isSendingInProgress: boolean;
};

if (!globalForWhatsApp.whatsappStatus) {
  globalForWhatsApp.whatsappStatus = { state: 'idle' };
}
globalForWhatsApp.isSendingInProgress = globalForWhatsApp.isSendingInProgress || false;

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

export function getWhatsAppStatus(): WhatsAppStatus {
  return globalForWhatsApp.whatsappStatus;
}

export async function disconnectWhatsApp() {
  if (globalForWhatsApp.whatsappClient) {
    try {
      await globalForWhatsApp.whatsappClient.destroy();
    } catch (e) {
      console.error('Error destroying client:', e);
    }
    globalForWhatsApp.whatsappClient = null;
  }
  globalForWhatsApp.whatsappStatus = { state: 'idle' };
  globalForWhatsApp.isSendingInProgress = false;
}

export async function initializeWhatsApp() {
  if (globalForWhatsApp.whatsappClient) {
    // Client already exists
    return;
  }

  globalForWhatsApp.whatsappStatus = { state: 'initializing' };

  try {
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'wedding-invitations-client'
      }),
      puppeteer: {
        headless: true,
        executablePath: getExecutablePath(),
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    globalForWhatsApp.whatsappClient = client;

    client.on('qr', (qr) => {
      // Generate a QR code API URL using qrserver.com
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
      globalForWhatsApp.whatsappStatus = {
        state: 'qr',
        qrCode: qrUrl
      };
    });

    client.on('ready', () => {
      globalForWhatsApp.whatsappStatus = {
        state: 'ready'
      };
    });

    client.on('auth_failure', (msg) => {
      globalForWhatsApp.whatsappStatus = {
        state: 'error',
        error: `Authentication failed: ${msg}`
      };
      disconnectWhatsApp();
    });

    client.on('disconnected', (reason) => {
      globalForWhatsApp.whatsappStatus = {
        state: 'idle'
      };
      disconnectWhatsApp();
    });

    client.initialize().catch((err) => {
      globalForWhatsApp.whatsappStatus = {
        state: 'error',
        error: `Initialization failed: ${err.message}`
      };
      disconnectWhatsApp();
    });
  } catch (err: any) {
    globalForWhatsApp.whatsappStatus = {
      state: 'error',
      error: `Failed to initialize client: ${err.message}`
    };
    globalForWhatsApp.isSendingInProgress = false;
  }
}

export async function startBulkSend(targetFilter: 'pending' | 'all') {
  if (!globalForWhatsApp.whatsappClient || globalForWhatsApp.whatsappStatus.state !== 'ready') {
    throw new Error('WhatsApp client is not ready. Please connect first.');
  }

  if (globalForWhatsApp.isSendingInProgress) {
    return; // Already sending
  }

  globalForWhatsApp.isSendingInProgress = true;

  try {
    const guests = await getGuests();
    const weddingDetails = await getWeddingDetails();

    const targets = guests.filter(g => {
      if (!g.phone) return false;
      if (targetFilter === 'pending') {
        return !g.rsvp?.status || g.rsvp.status === 'pending';
      }
      return true;
    });

    if (targets.length === 0) {
      globalForWhatsApp.whatsappStatus = {
        state: 'completed',
        progress: { current: 0, total: 0 }
      };
      globalForWhatsApp.isSendingInProgress = false;
      return;
    }

    globalForWhatsApp.whatsappStatus = {
      state: 'sending',
      progress: {
        current: 0,
        total: targets.length,
        currentGuestName: targets[0].name
      }
    };

    // Run send loop in background
    (async () => {
      for (let i = 0; i < targets.length; i++) {
        if (!globalForWhatsApp.isSendingInProgress) {
          // Stopped/disconnected manually
          break;
        }

        const guest = targets[i];
        
        globalForWhatsApp.whatsappStatus = {
          state: 'sending',
          progress: {
            current: i + 1,
            total: targets.length,
            currentGuestName: guest.name
          }
        };

        let phoneClean = guest.phone.replace(/[^\d]/g, '');
        if (phoneClean.startsWith('0')) {
          phoneClean = '94' + phoneClean.slice(1);
        }
        
        const whatsappId = `${phoneClean}@c.us`;
        const inviteUrl = `${globalThis.location?.origin || 'https://digital-wedding-invitation-beige.vercel.app'}/invite/${guest.invite_token}`;
        
        const message = DEFAULT_WHATSAPP_TEMPLATE
          .replace('{name}', guest.name)
          .replace('{bride}', weddingDetails.bride_name)
          .replace('{groom}', weddingDetails.groom_name)
          .replace('{date}', weddingDetails.date)
          .replace('{venue}', weddingDetails.venue)
          .replace('{city}', weddingDetails.city)
          .replace('{url}', inviteUrl);

        try {
          await globalForWhatsApp.whatsappClient!.sendMessage(whatsappId, message);
          await logInviteSent(guest.id, 'whatsapp');
        } catch (err) {
          console.error(`Failed to send message to ${guest.name}:`, err);
        }

        // Wait 8-15 seconds between messages
        if (i < targets.length - 1) {
          const delay = Math.floor(Math.random() * 7000) + 8000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      globalForWhatsApp.whatsappStatus = {
        state: 'completed',
        progress: {
          current: targets.length,
          total: targets.length
        }
      };
      globalForWhatsApp.isSendingInProgress = false;
    })();

  } catch (err: any) {
    globalForWhatsApp.whatsappStatus = {
      state: 'error',
      error: `Bulk sending failed: ${err.message}`
    };
    globalForWhatsApp.isSendingInProgress = false;
  }
}
