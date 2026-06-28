import { NextResponse } from 'next/server';
import { getGuest, updateGuest, deleteGuest } from '@/lib/db';
import { normalizePhoneNumber } from '@/lib/whatsapp';

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
      phone: body.phone ? normalizePhoneNumber(String(body.phone)) : ''
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
