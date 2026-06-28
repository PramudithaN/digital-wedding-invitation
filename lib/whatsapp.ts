import { DEFAULT_WHATSAPP_TEMPLATE } from './constants';

// Clean phone numbers for wa.me deep links (e.g. "+94 77 123 4567" -> "94771234567")
export function formatPhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '');
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
  }
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
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
  }
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
  
  if (!sid || !token) {
    return { success: false, error: 'Twilio accounts credentials are not configured in environment variables.' };
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
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
    // Twilio phones require '+' prefix and country code
    let formattedTo = phone.trim();
    if (!formattedTo.startsWith('+')) {
      formattedTo = '+' + formattedTo;
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
