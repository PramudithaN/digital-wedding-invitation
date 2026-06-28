import { NextResponse } from 'next/server';
import { getWeddingDetails, saveWeddingDetails } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const details = await getWeddingDetails();
    return NextResponse.json(details);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Quick validation
    const requiredFields = ['bride_name', 'groom_name', 'date', 'time', 'iso_date', 'venue', 'city', 'address'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field.replace('_', ' ')} is required` }, { status: 400 });
      }
    }

    await saveWeddingDetails({
      bride_name: body.bride_name,
      groom_name: body.groom_name,
      date: body.date,
      time: body.time,
      iso_date: body.iso_date,
      venue: body.venue,
      city: body.city,
      address: body.address,
      google_maps_url: body.google_maps_url || '',
      registry_url: body.registry_url || '',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
