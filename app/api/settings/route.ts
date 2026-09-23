import { NextResponse } from 'next/server';
import { getWeddingDetails, saveWeddingDetails } from '@/lib/db';
import { checkIsAuthenticated } from '@/lib/auth';

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
    const isAuthenticated = await checkIsAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Quick validation
    const requiredFields = ['bride_name', 'groom_name', 'date', 'time', 'iso_date', 'venue', 'city', 'address'];
    for (const field of requiredFields) {
      if (!body[field] || typeof body[field] !== 'string') {
        return NextResponse.json({ error: `${field.replace('_', ' ')} is required` }, { status: 400 });
      }
    }

    await saveWeddingDetails({
      bride_name: String(body.bride_name).trim().slice(0, 100),
      groom_name: String(body.groom_name).trim().slice(0, 100),
      date: String(body.date).trim().slice(0, 100),
      time: String(body.time).trim().slice(0, 50),
      iso_date: String(body.iso_date).trim().slice(0, 50),
      venue: String(body.venue).trim().slice(0, 200),
      city: String(body.city).trim().slice(0, 100),
      address: String(body.address).trim().slice(0, 300),
      google_maps_url: typeof body.google_maps_url === 'string' ? body.google_maps_url.trim().slice(0, 500) : '',
      registry_url: typeof body.registry_url === 'string' ? body.registry_url.trim().slice(0, 500) : '',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred while saving settings' }, { status: 500 });
  }
}
