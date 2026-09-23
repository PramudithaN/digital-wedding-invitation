import { NextResponse } from 'next/server';
import { getCategories, addCategory } from '@/lib/db';
import { checkIsAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
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
    if (!body.name || !body.colour || typeof body.name !== 'string' || typeof body.colour !== 'string') {
      return NextResponse.json({ error: 'Name and colour are required' }, { status: 400 });
    }
    const category = await addCategory({
      name: body.name.trim().slice(0, 100),
      colour: body.colour.trim().slice(0, 50)
    });
    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
