import { NextRequest, NextResponse } from 'next/server';
import { getGuests, addGuest, clearAllGuests } from '@/lib/db';
import { normalizePhoneNumber } from '@/lib/whatsapp';
import { checkIsAuthenticated } from '@/lib/auth';

/** Maps extended UI side values down to those the DB constraint allows. */
function normalizeSide(side: string | undefined | null): string | null {
  const valid = ['bride', 'groom', 'bride_mother', 'bride_father', 'groom_mother', 'groom_father'];
  if (!side) return null;
  if (valid.includes(side)) return side;
  // Fallback: collapse unknowns to bride/groom prefix match
  if (side.startsWith('bride')) return 'bride';
  if (side.startsWith('groom')) return 'groom';
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q');
    
    if (searchQuery !== null) {
      const q = searchQuery.toLowerCase().trim();
      if (!q) {
        return NextResponse.json([]);
      }
      
      const guests = await getGuests();
      const filtered = guests
        .filter(g => g.name.toLowerCase().includes(q) && g.rsvp?.status === 'attending')
        .map(g => {
          const confirmed = g.rsvp?.plus_one || 1;
          const attendingCount = g.rsvp?.attending_count && g.rsvp.attending_count > 0 
            ? g.rsvp.attending_count 
            : confirmed;
          return {
            id: g.id,
            name: g.name,
            side: g.side,
            relationship: g.relationship,
            table_no: g.table_no || '',
            rsvp_status: g.rsvp?.status || 'pending',
            seats_count: attendingCount
          };
        });
      return NextResponse.json(filtered);
    }
    
    // Verify admin authentication for fetching all guests
    const isAuthenticated = await checkIsAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const guests = await getGuests();
    return NextResponse.json(guests);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (Array.isArray(body)) {
      const results = [];
      for (const item of body) {
        if (!item.name) continue;
        const normalizedPhone = item.phone ? normalizePhoneNumber(String(item.phone)) : '';
        const guest = await addGuest({
          name: item.name,
          phone: normalizedPhone,
          email: item.email || '',
          side: normalizeSide(item.side),
          category_id: item.category_id || null,
          relationship: item.relationship || 'friend',
          notes: item.notes || '',
          table_no: item.table_no || '',
          plus_one: item.plus_one
        });
        results.push(guest);
      }
      return NextResponse.json(results);
    } else {
      if (!body.name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }
      const normalizedPhone = body.phone ? normalizePhoneNumber(String(body.phone)) : '';
      const guest = await addGuest({
        name: body.name,
        phone: normalizedPhone,
        email: body.email || '',
        side: normalizeSide(body.side),
        category_id: body.category_id || null,
        relationship: body.relationship || 'friend',
        notes: body.notes || '',
        table_no: body.table_no || '',
        plus_one: body.plus_one
      });
      return NextResponse.json(guest);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearAllGuests();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
