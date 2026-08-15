export const WEDDING_DETAILS = {
  bride_name: 'Oshidhie',
  groom_name: 'Kaveen',
  date: 'Saturday, September 19, 2026',
  time: '4:00 PM',
  iso_date: '2026-09-19T16:00:00', // For countdown timer
  venue: 'Grand Monarch',
  city: 'Colombo, Sri Lanka',
  address: '123 Galle Road, Colombo 03',
  google_maps_url: 'https://maps.google.com',
  registry_url: 'https://weddingregistry.com',
};

const emojiWave = String.fromCodePoint(0x1F44B);
const emojiCalendar = String.fromCodePoint(0x1F4C5);
const emojiPin = String.fromCodePoint(0x1F4CD);
const emojiFinger = String.fromCodePoint(0x1F449);
const emojiRing = String.fromCodePoint(0x1F48D);

export const DEFAULT_WHATSAPP_TEMPLATE = 
`Hi {name} ${emojiWave},

You're warmly invited to celebrate the wedding of

  *{bride} & {groom}*

${emojiCalendar} {date}
${emojiPin} {venue}, {city}

Please let us know if you can make it:
${emojiFinger} _{url}_

We hope to celebrate this special day with you! ${emojiRing}`;
