import { NextResponse } from 'next/server';
import { getGuest, updateGuest, deleteGuest } from '@/lib/db';
import { normalizePhoneNumber } from '@/lib/whatsapp';

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const guest = await getGuest(id);
    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }
    return NextResponse.json(guest);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const guest = await updateGuest(id, {
      ...body,
      phone: body.phone ? normalizePhoneNumber(String(body.phone)) : '',
      side: normalizeSide(body.side),
    });
    return NextResponse.json(guest);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteGuest(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
