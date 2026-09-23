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
      attending_count,
      general_guest_name,
      general_guest_side
    } = body;
    
    if (!guest_id || typeof guest_id !== 'string' || !status || typeof status !== 'string') {
      return NextResponse.json({ error: 'Guest ID and status are required' }, { status: 400 });
    }
    
    const sanitizedGuestId = guest_id.trim().slice(0, 100);
    const sanitizedStatus = status.trim().toLowerCase();

    if (!['attending', 'declined', 'pending'].includes(sanitizedStatus)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }
    
    let targetGuestId = sanitizedGuestId;
    if (sanitizedGuestId === 'general') {
      const sanitizedGeneralName = (typeof general_guest_name === 'string' ? general_guest_name.trim().slice(0, 100) : '') || 'General Guest';
      const side = (general_guest_side === 'groom' || general_guest_side === 'bride') ? general_guest_side : 'bride';
      const newGuest = await addGuest({
        name: sanitizedGeneralName,
        phone: '',
        email: '',
        side,
        notes: 'RSVP via general invite link'
      });
      targetGuestId = newGuest.id;
    }
    
    const parsedPlusOne = typeof plus_one === 'number' 
      ? Math.max(1, Math.min(20, Math.floor(plus_one))) 
      : (plus_one ? 2 : 1);

    const parsedAttendingCount = typeof attending_count === 'number' 
      ? Math.max(0, Math.min(20, Math.floor(attending_count))) 
      : (sanitizedStatus === 'attending' ? parsedPlusOne : 0);

    const sanitizedPlusOneName = typeof plus_one_name === 'string' ? plus_one_name.trim().slice(0, 100) : '';
    const sanitizedMealChoice = typeof meal_choice === 'string' ? meal_choice.trim().slice(0, 200) : '';
    const sanitizedDietaryNotes = typeof dietary_notes === 'string' ? dietary_notes.trim().slice(0, 500) : '';
    const sanitizedMessage = typeof message === 'string' ? message.trim().slice(0, 1000) : '';
    const sanitizedAlcoholChoice = typeof alcohol_choice === 'string' ? alcohol_choice.trim().slice(0, 200) : 'none';

    const rsvp = await saveRSVP(targetGuestId, {
      status: sanitizedStatus as 'attending' | 'declined' | 'pending',
      plus_one: parsedPlusOne,
      plus_one_name: sanitizedPlusOneName,
      meal_choice: sanitizedMealChoice,
      dietary_notes: sanitizedDietaryNotes,
      message: sanitizedMessage,
      alcohol_choice: sanitizedAlcoholChoice,
      attending_count: parsedAttendingCount
    });
    
    return NextResponse.json(rsvp);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred while saving RSVP' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { guest_id, status } = body;
    
    if (!guest_id || typeof guest_id !== 'string' || !status || typeof status !== 'string') {
      return NextResponse.json({ error: 'Guest ID and status are required' }, { status: 400 });
    }
    
    const sanitizedGuestId = guest_id.trim().slice(0, 100);
    const sanitizedStatus = status.trim().toLowerCase();

    if (!['attending', 'declined', 'pending'].includes(sanitizedStatus)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }
    
    await updateRSVPStatus(sanitizedGuestId, sanitizedStatus as 'attending' | 'declined' | 'pending');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred while updating RSVP' }, { status: 500 });
  }
}
