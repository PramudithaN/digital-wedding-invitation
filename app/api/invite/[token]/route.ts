import { NextResponse } from 'next/server';
import { getGuestByToken, markInviteOpened } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const guest = await getGuestByToken(token);
    
    if (!guest) {
      return NextResponse.json({ error: 'Invalid invite token' }, { status: 404 });
    }
    
    // Mark the invitation as opened
    await markInviteOpened(guest.id);
    
    // Return updated guest info (which now includes the invite_link.opened_at field)
    const updatedGuest = await getGuestByToken(token);
    return NextResponse.json(updatedGuest);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
