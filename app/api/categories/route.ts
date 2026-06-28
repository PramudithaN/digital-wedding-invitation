import { NextResponse } from 'next/server';
import { getCategories, addCategory } from '@/lib/db';

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
    const body = await request.json();
    if (!body.name || !body.colour) {
      return NextResponse.json({ error: 'Name and colour are required' }, { status: 400 });
    }
    const category = await addCategory({
      name: body.name,
      colour: body.colour
    });
    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
