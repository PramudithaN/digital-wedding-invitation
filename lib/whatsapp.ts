import { DEFAULT_WHATSAPP_TEMPLATE } from './constants';

const DEFAULT_COUNTRY_CODE = '94';

function resolveBaseUrl(runtimeBaseUrl?: string): string {
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
  const candidates = [
    runtimeBaseUrl,
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXTAUTH_URL,
    vercelUrl,
    'http://localhost:3000'
  ];

  const selected = candidates.find((item) => !!item && item.trim() !== '');
  return (selected || 'http://localhost:3000').replace(/\/$/, '');
}

// Normalize numbers into E.164-like format (e.g. "0771234567" -> "+94771234567").
export function normalizePhoneNumber(phone: string, defaultCountryCode: string = DEFAULT_COUNTRY_CODE): string {
  const trimmedPhone = phone.trim();
  if (!trimmedPhone) {
    return '';
  }

  if (trimmedPhone.startsWith('+')) {
    return `+${trimmedPhone.replace(/[^\d]/g, '')}`;
  }

  const digitsOnly = trimmedPhone.replace(/[^\d]/g, '');
  if (!digitsOnly) {
    return '';
  }

  if (digitsOnly.startsWith('00')) {
    return `+${digitsOnly.slice(2)}`;
  }

  if (digitsOnly.startsWith('0')) {
    return `+${defaultCountryCode}${digitsOnly.slice(1)}`;
  }

  if (digitsOnly.startsWith(defaultCountryCode)) {
    return `+${digitsOnly}`;
  }

  return `+${defaultCountryCode}${digitsOnly}`;
}

// Clean phone numbers for wa.me deep links (e.g. "+94 77 123 4567" -> "94771234567")
export function formatPhoneNumber(phone: string): string {
  return normalizePhoneNumber(phone).replace(/[^\d]/g, '');
}

export function buildWhatsAppLink(
  phone: string, 
  guestName: string, 
  inviteToken: string,
  weddingDetails: {
    bride_name: string;
    groom_name: string;
    date: string;
    venue: string;
    city: string;
  },
  runtimeBaseUrl?: string
): string {
  const baseUrl = resolveBaseUrl(runtimeBaseUrl);
  const inviteUrl = `${baseUrl}/invite/${inviteToken}`;
  
  const message = DEFAULT_WHATSAPP_TEMPLATE
    .replace('{name}', guestName)
    .replace('{bride}', weddingDetails.bride_name)
    .replace('{groom}', weddingDetails.groom_name)
    .replace('{date}', weddingDetails.date)
    .replace('{venue}', weddingDetails.venue)
    .replace('{city}', weddingDetails.city)
    .replace('{url}', inviteUrl);
    
  const cleanPhone = formatPhoneNumber(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export async function sendWhatsAppInviteViaTwilio(
  phone: string, 
  guestName: string, 
  inviteToken: string,
  weddingDetails: {
    bride_name: string;
    groom_name: string;
    date: string;
    venue: string;
    city: string;
  },
  runtimeBaseUrl?: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
  
  if (!sid || !token) {
    return { success: false, error: 'Twilio accounts credentials are not configured in environment variables.' };
  }
  
  const baseUrl = resolveBaseUrl(runtimeBaseUrl);
  const inviteUrl = `${baseUrl}/invite/${inviteToken}`;
  
  const message = DEFAULT_WHATSAPP_TEMPLATE
    .replace('{name}', guestName)
    .replace('{bride}', weddingDetails.bride_name)
    .replace('{groom}', weddingDetails.groom_name)
    .replace('{date}', weddingDetails.date)
    .replace('{venue}', weddingDetails.venue)
    .replace('{city}', weddingDetails.city)
    .replace('{url}', inviteUrl);

  try {
    const formattedTo = normalizePhoneNumber(phone);
    if (!formattedTo) {
      return { success: false, error: 'Invalid phone number' };
    }
    
    const recipient = `whatsapp:${formattedTo}`;
    const sender = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;
    
    // Encode SID & token for Basic Auth
    const authString = Buffer.from(`${sid}:${token}`).toString('base64');
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: sender,
          To: recipient,
          Body: message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Twilio API Error (Status ${response.status})`);
    }
    
    return { success: true, sid: data.sid };
  } catch (error: any) {
    console.error('Error sending SMS/WhatsApp via Twilio API:', error);
    return { success: false, error: error.message };
  }
}
