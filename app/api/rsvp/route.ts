import { NextResponse } from 'next/server';
import { saveRSVP, updateRSVPStatus, addGuest } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      guest_id, 
      status, 
      plus_one, 
      plus_one_name, 
      meal_choice, 
      dietary_notes, 
      message, 
      alcohol_choice,
      general_guest_name,
      general_guest_side
    } = body;
    
    if (!guest_id || !status) {
      return NextResponse.json({ error: 'Guest ID and status are required' }, { status: 400 });
    }
    
    if (!['attending', 'declined', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }
    
    let targetGuestId = guest_id;
    if (guest_id === 'general') {
      const newGuest = await addGuest({
        name: general_guest_name || 'General Guest',
        phone: '',
        email: '',
        side: (general_guest_side === 'groom' || general_guest_side === 'bride') ? general_guest_side : 'bride',
        notes: 'RSVP via general invite link'
      });
      targetGuestId = newGuest.id;
    }
    
    const rsvp = await saveRSVP(targetGuestId, {
      status,
      plus_one: !!plus_one,
      plus_one_name: plus_one_name || '',
      meal_choice: meal_choice || '',
      dietary_notes: dietary_notes || '',
      message: message || '',
      alcohol_choice: alcohol_choice || 'none'
    });
    
    return NextResponse.json(rsvp);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { guest_id, status } = body;
    
    if (!guest_id || !status) {
      return NextResponse.json({ error: 'Guest ID and status are required' }, { status: 400 });
    }
    
    if (!['attending', 'declined', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }
    
    await updateRSVPStatus(guest_id, status);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
