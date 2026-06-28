import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { Category, Guest, RSVP, InviteLink, GuestWithDetails } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseUrl.trim() !== ''
);

const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null;

const MOCK_DB_PATH = path.join(process.cwd(), 'mock-db.json');

// Helper to interact with local JSON file when Supabase is not configured
function readMockDB(): {
  categories: Category[];
  guests: Guest[];
  rsvps: RSVP[];
  invite_links: InviteLink[];
} {
  if (!fs.existsSync(MOCK_DB_PATH)) {
    const defaultData = {
      categories: [
        { id: 'cat-1', name: 'Family', colour: '#4F46E5', created_at: new Date().toISOString() },
        { id: 'cat-2', name: 'Friends', colour: '#10B981', created_at: new Date().toISOString() },
        { id: 'cat-3', name: 'Work', colour: '#F59E0B', created_at: new Date().toISOString() }
      ],
      guests: [
        { 
          id: 'guest-1', 
          name: 'Sarah Karunaratne', 
          phone: '+94771234567', 
          email: 'sarah@example.com', 
          side: 'bride' as const, 
          category_id: 'cat-1', 
          invite_token: 'sarah-token-777', 
          notes: 'Bride\'s sister, helper with flowers', 
          created_at: new Date().toISOString() 
        },
        { 
          id: 'guest-2', 
          name: 'James Wijesinghe', 
          phone: '+94777654321', 
          email: 'james@example.com', 
          side: 'groom' as const, 
          category_id: 'cat-2', 
          invite_token: 'james-token-888', 
          notes: 'Groom\'s college roommate', 
          created_at: new Date().toISOString() 
        },
        {
          id: 'guest-3',
          name: 'Maya Lee',
          phone: '+94772345678',
          email: 'maya@example.com',
          side: 'bride' as const,
          category_id: 'cat-3',
          invite_token: 'maya-token-999',
          notes: 'Work colleague',
          created_at: new Date().toISOString()
        }
      ],
      rsvps: [
        { 
          id: 'rsvp-1', 
          guest_id: 'guest-1', 
          status: 'attending' as const, 
          plus_one: true, 
          plus_one_name: 'Tom', 
          meal_choice: 'veg', 
          dietary_notes: 'Gluten free', 
          message: 'Super excited for the big day!', 
          responded_at: new Date().toISOString() 
        },
        { 
          id: 'rsvp-2', 
          guest_id: 'guest-2', 
          status: 'declined' as const, 
          plus_one: false, 
          meal_choice: '', 
          dietary_notes: '', 
          message: 'Sorry I cannot make it, I will be out of the country. Wishing you the best!', 
          responded_at: new Date().toISOString() 
        }
      ],
      invite_links: [
        { 
          id: 'link-1', 
          guest_id: 'guest-1', 
          short_code: 'sarahk', 
          channel: 'whatsapp', 
          sent_at: new Date().toISOString(), 
          opened_at: new Date().toISOString() 
        }
      ]
    };
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
  try {
    const content = fs.readFileSync(MOCK_DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.error('Error reading mock db:', e);
    return { categories: [], guests: [], rsvps: [], invite_links: [] };
  }
}

function writeMockDB(data: any) {
  try {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing mock db:', e);
  }
}

// Helper to generate a UUID-like random token
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// CATEGORIES API
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase!
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  } else {
    const db = readMockDB();
    return db.categories.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export async function addCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase!
      .from('categories')
      .insert([category])
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const db = readMockDB();
    const newCategory: Category = {
      ...category,
      id: 'cat-' + Date.now(),
      created_at: new Date().toISOString()
    };
    db.categories.push(newCategory);
    writeMockDB(db);
    return newCategory;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase!
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } else {
    const db = readMockDB();
    db.categories = db.categories.filter(c => c.id !== id);
    // Unset category_id for guests in this category
    db.guests = db.guests.map(g => g.category_id === id ? { ...g, category_id: undefined } : g);
    writeMockDB(db);
  }
}

// GUESTS API
export async function getGuests(): Promise<GuestWithDetails[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase!
      .from('guests')
      .select(`
        *,
        category:categories(*),
        rsvp:rsvps(*),
        invite_link:invite_links(*)
      `)
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  } else {
    const db = readMockDB();
    return db.guests.map(guest => {
      const category = db.categories.find(c => c.id === guest.category_id) || null;
      const rsvp = db.rsvps.find(r => r.guest_id === guest.id) || null;
      const invite_link = db.invite_links.find(l => l.guest_id === guest.id) || null;
      return {
        ...guest,
        category,
        rsvp,
        invite_link
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }
}

export async function getGuest(id: string): Promise<GuestWithDetails | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase!
      .from('guests')
      .select(`
        *,
        category:categories(*),
        rsvp:rsvps(*),
        invite_link:invite_links(*)
      `)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  } else {
    const db = readMockDB();
    const guest = db.guests.find(g => g.id === id);
    if (!guest) return null;
    const category = db.categories.find(c => c.id === guest.category_id) || null;
    const rsvp = db.rsvps.find(r => r.guest_id === guest.id) || null;
    const invite_link = db.invite_links.find(l => l.guest_id === guest.id) || null;
    return {
      ...guest,
      category,
      rsvp,
      invite_link
    };
  }
}

export async function getGuestByToken(token: string): Promise<GuestWithDetails | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase!
      .from('guests')
      .select(`
        *,
        category:categories(*),
        rsvp:rsvps(*),
        invite_link:invite_links(*)
      `)
      .eq('invite_token', token)
      .maybeSingle();
    if (error) throw error;
    return data;
  } else {
    const db = readMockDB();
    const guest = db.guests.find(g => g.invite_token === token);
    if (!guest) return null;
    const category = db.categories.find(c => c.id === guest.category_id) || null;
    const rsvp = db.rsvps.find(r => r.guest_id === guest.id) || null;
    const invite_link = db.invite_links.find(l => l.guest_id === guest.id) || null;
    return {
      ...guest,
      category,
      rsvp,
      invite_link
    };
  }
}

export async function addGuest(guest: Omit<Guest, 'id' | 'created_at' | 'invite_token'>): Promise<Guest> {
  const inviteToken = generateUUID();
  if (isSupabaseConfigured) {
    const { data, error } = await supabase!
      .from('guests')
      .insert([{ ...guest, invite_token: inviteToken }])
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const db = readMockDB();
    const newGuest: Guest = {
      ...guest,
      id: 'guest-' + Date.now(),
      invite_token: inviteToken,
      created_at: new Date().toISOString()
    };
    db.guests.push(newGuest);
    writeMockDB(db);
    return newGuest;
  }
}

export async function updateGuest(id: string, guestUpdates: Partial<Guest>): Promise<Guest> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase!
      .from('guests')
      .update(guestUpdates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const db = readMockDB();
    const guestIndex = db.guests.findIndex(g => g.id === id);
    if (guestIndex === -1) throw new Error('Guest not found');
    const updatedGuest = {
      ...db.guests[guestIndex],
      ...guestUpdates
    };
    db.guests[guestIndex] = updatedGuest;
    writeMockDB(db);
    return updatedGuest;
  }
}

export async function deleteGuest(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase!
      .from('guests')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } else {
    const db = readMockDB();
    db.guests = db.guests.filter(g => g.id !== id);
    db.rsvps = db.rsvps.filter(r => r.guest_id !== id);
    db.invite_links = db.invite_links.filter(l => l.guest_id !== id);
    writeMockDB(db);
  }
}

// RSVPs API
export async function getRSVPs(): Promise<RSVP[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase!
      .from('rsvps')
      .select('*');
    if (error) throw error;
    return data || [];
  } else {
    const db = readMockDB();
    return db.rsvps;
  }
}

export async function saveRSVP(
  guestId: string, 
  rsvpData: Omit<RSVP, 'id' | 'guest_id' | 'responded_at'>
): Promise<RSVP> {
  const respondedAt = new Date().toISOString();
  if (isSupabaseConfigured) {
    // Check if RSVP exists
    const { data: existingRSVP } = await supabase!
      .from('rsvps')
      .select('id')
      .eq('guest_id', guestId)
      .maybeSingle();

    let result;
    if (existingRSVP) {
      const { data, error } = await supabase!
        .from('rsvps')
        .update({
          ...rsvpData,
          responded_at: respondedAt
        })
        .eq('guest_id', guestId)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase!
        .from('rsvps')
        .insert([{
          guest_id: guestId,
          ...rsvpData,
          responded_at: respondedAt
        }])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }
    return result;
  } else {
    const db = readMockDB();
    const rsvpIndex = db.rsvps.findIndex(r => r.guest_id === guestId);
    
    let savedRSVP: RSVP;
    if (rsvpIndex !== -1) {
      savedRSVP = {
        ...db.rsvps[rsvpIndex],
        ...rsvpData,
        responded_at: respondedAt
      };
      db.rsvps[rsvpIndex] = savedRSVP;
    } else {
      savedRSVP = {
        id: 'rsvp-' + Date.now(),
        guest_id: guestId,
        ...rsvpData,
        responded_at: respondedAt
      };
      db.rsvps.push(savedRSVP);
    }
    writeMockDB(db);
    return savedRSVP;
  }
}

export async function updateRSVPStatus(guestId: string, status: 'attending' | 'declined' | 'pending'): Promise<void> {
  if (isSupabaseConfigured) {
    // Check if RSVP exists
    const { data: existingRSVP } = await supabase!
      .from('rsvps')
      .select('id')
      .eq('guest_id', guestId)
      .maybeSingle();

    if (existingRSVP) {
      const { error } = await supabase!
        .from('rsvps')
        .update({ status, responded_at: new Date().toISOString() })
        .eq('guest_id', guestId);
      if (error) throw error;
    } else {
      const { error } = await supabase!
        .from('rsvps')
        .insert([{ 
          guest_id: guestId, 
          status, 
          plus_one: false, 
          responded_at: new Date().toISOString() 
        }]);
      if (error) throw error;
    }
  } else {
    const db = readMockDB();
    const rsvpIndex = db.rsvps.findIndex(r => r.guest_id === guestId);
    if (rsvpIndex !== -1) {
      db.rsvps[rsvpIndex] = {
        ...db.rsvps[rsvpIndex],
        status,
        responded_at: new Date().toISOString()
      };
    } else {
      db.rsvps.push({
        id: 'rsvp-' + Date.now(),
        guest_id: guestId,
        status,
        plus_one: false,
        responded_at: new Date().toISOString()
      });
    }
    writeMockDB(db);
  }
}

// INVITE LINKS API
export async function getInviteLinks(): Promise<InviteLink[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase!
      .from('invite_links')
      .select('*');
    if (error) throw error;
    return data || [];
  } else {
    const db = readMockDB();
    return db.invite_links;
  }
}

export async function markInviteOpened(guestId: string): Promise<void> {
  const openedAt = new Date().toISOString();
  if (isSupabaseConfigured) {
    // Check if invite link exists
    const { data: existingLink } = await supabase!
      .from('invite_links')
      .select('id, opened_at')
      .eq('guest_id', guestId)
      .maybeSingle();

    if (existingLink) {
      // Only set opened_at if not already set
      if (!existingLink.opened_at) {
        const { error } = await supabase!
          .from('invite_links')
          .update({ opened_at: openedAt })
          .eq('guest_id', guestId);
        if (error) throw error;
      }
    } else {
      // Generate a short code (last 6 chars of guestId or random)
      const shortCode = guestId.substring(0, 6);
      const { error } = await supabase!
        .from('invite_links')
        .insert([{
          guest_id: guestId,
          short_code: shortCode,
          opened_at: openedAt,
          channel: 'whatsapp'
        }]);
      if (error) throw error;
    }
  } else {
    const db = readMockDB();
    const linkIndex = db.invite_links.findIndex(l => l.guest_id === guestId);
    if (linkIndex !== -1) {
      if (!db.invite_links[linkIndex].opened_at) {
        db.invite_links[linkIndex] = {
          ...db.invite_links[linkIndex],
          opened_at: openedAt
        };
      }
    } else {
      db.invite_links.push({
        id: 'link-' + Date.now(),
        guest_id: guestId,
        short_code: guestId.substring(0, 6),
        channel: 'whatsapp',
        opened_at: openedAt
      });
    }
    writeMockDB(db);
  }
}

export async function logInviteSent(guestId: string, channel: string = 'whatsapp'): Promise<void> {
  const sentAt = new Date().toISOString();
  if (isSupabaseConfigured) {
    const { data: existingLink } = await supabase!
      .from('invite_links')
      .select('id')
      .eq('guest_id', guestId)
      .maybeSingle();

    if (existingLink) {
      const { error } = await supabase!
        .from('invite_links')
        .update({ sent_at: sentAt, channel })
        .eq('guest_id', guestId);
      if (error) throw error;
    } else {
      const shortCode = guestId.substring(0, 6);
      const { error } = await supabase!
        .from('invite_links')
        .insert([{
          guest_id: guestId,
          short_code: shortCode,
          sent_at: sentAt,
          channel
        }]);
      if (error) throw error;
    }
  } else {
    const db = readMockDB();
    const linkIndex = db.invite_links.findIndex(l => l.guest_id === guestId);
    if (linkIndex !== -1) {
      db.invite_links[linkIndex] = {
        ...db.invite_links[linkIndex],
        sent_at: sentAt,
        channel
      };
    } else {
      db.invite_links.push({
        id: 'link-' + Date.now(),
        guest_id: guestId,
        short_code: guestId.substring(0, 6),
        channel,
        sent_at: sentAt
      });
    }
    writeMockDB(db);
  }
}

// WEDDING SETTINGS CONFIGURATION
const CONFIG_PATH = path.join(process.cwd(), 'wedding-config.json');

export async function getWeddingDetails(): Promise<{
  bride_name: string;
  groom_name: string;
  date: string;
  time: string;
  iso_date: string;
  venue: string;
  city: string;
  address: string;
  google_maps_url: string;
  registry_url: string;
}> {
  if (!fs.existsSync(CONFIG_PATH)) {
    const defaultDetails = {
      bride_name: 'Oshidhie',
      groom_name: 'Kaveen',
      date: 'Saturday, September 19, 2026',
      time: '4:00 PM',
      iso_date: '2026-09-19T16:00:00',
      venue: 'Grand Monarch',
      city: 'Colombo, Sri Lanka',
      address: '123 Galle Road, Colombo 03',
      google_maps_url: 'https://maps.google.com',
      registry_url: 'https://weddingregistry.com',
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultDetails, null, 2), 'utf-8');
    return defaultDetails;
  }
  try {
    const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.error('Error reading wedding config:', e);
    return {
      bride_name: 'Oshidhie',
      groom_name: 'Kaveen',
      date: 'Saturday, September 19, 2026',
      time: '4:00 PM',
      iso_date: '2026-09-19T16:00:00',
      venue: 'Grand Monarch',
      city: 'Colombo, Sri Lanka',
      address: '123 Galle Road, Colombo 03',
      google_maps_url: 'https://maps.google.com',
      registry_url: 'https://weddingregistry.com',
    };
  }
}

export async function saveWeddingDetails(details: any): Promise<void> {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(details, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving wedding config:', e);
  }
}

