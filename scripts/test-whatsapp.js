const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Starting local WhatsApp tester...');
console.log('Initializing client (this may take a few seconds)...');

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

client.on('ready', () => {
  console.log('\nWhatsApp client is authenticated and ready!\n');
  
  rl.question('Enter the phone number you want to send a test message to (with country code, e.g., 94771234567): ', (phone) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (!cleanPhone) {
      console.log('Invalid phone number. Exiting...');
      client.destroy();
      rl.close();
      process.exit(1);
    }

    rl.question('Enter the test message: ', async (msg) => {
      const whatsappId = `${cleanPhone}@c.us`;
      try {
        console.log(`Sending message to ${whatsappId}...`);
        await client.sendMessage(whatsappId, msg);
        console.log('✅ Test message sent successfully!');
      } catch (err) {
        console.error('❌ Failed to send message:', err.message);
      } finally {
        await client.destroy();
        rl.close();
        process.exit(0);
      }
    });
  });
});

client.on('auth_failure', (msg) => {
  console.error('❌ Authentication failed:', msg);
  rl.close();
  process.exit(1);
});

client.initialize();
