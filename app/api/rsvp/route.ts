import { NextResponse } from 'next/server';
import { saveRSVP, updateRSVPStatus } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guest_id, status, plus_one, plus_one_name, meal_choice, dietary_notes, message, alcohol_choice } = body;
    
    if (!guest_id || !status) {
      return NextResponse.json({ error: 'Guest ID and status are required' }, { status: 400 });
    }
    
    if (!['attending', 'declined', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }
    
    const rsvp = await saveRSVP(guest_id, {
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
