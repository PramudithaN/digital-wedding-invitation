import { NextResponse } from 'next/server';
import { 
  getGalleryImages, 
  addGalleryImage, 
  deleteGalleryImage, 
  isSupabaseConfigured,
  supabase 
} from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const images = await getGalleryImages();
    return NextResponse.json(images);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

    let imageUrl = '';

    if (isSupabaseConfigured) {
      // 1. Upload to Supabase Storage
      const { data, error } = await supabase!.storage
        .from('gallery')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true
        });

      if (error) {
        throw new Error(`Supabase Storage error: ${error.message}`);
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase!.storage
        .from('gallery')
        .getPublicUrl(fileName);

      imageUrl = publicUrl;
    } else {
      // Local fallback: Save to public/uploads
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);
      imageUrl = `/uploads/${fileName}`;
    }

    // Save image to database/mock-db
    const newImage = await addGalleryImage(imageUrl);

    return NextResponse.json(newImage);
  } catch (error: any) {
    console.error('Error uploading gallery image:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const url = searchParams.get('url');

    if (!id || !url) {
      return NextResponse.json({ error: 'Image ID and URL are required' }, { status: 400 });
    }

    // 1. Delete record from DB/mock-db first
    await deleteGalleryImage(id);

    // 2. Clean up storage file
    try {
      if (isSupabaseConfigured) {
        // Extract filename from Supabase URL (the last path segment)
        const fileName = url.substring(url.lastIndexOf('/') + 1);
        if (fileName) {
          const { error } = await supabase!.storage
            .from('gallery')
            .remove([fileName]);
          if (error) {
            console.error(`Failed to delete file from Supabase Storage: ${error.message}`);
          }
        }
      } else {
        // Local fallback removal
        if (url.startsWith('/uploads/')) {
          const fileName = path.basename(url);
          const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
    } catch (storageErr) {
      // Log storage cleanup errors but don't fail the request since database record is already gone
      console.error('Storage cleanup failed:', storageErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting gallery image:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
