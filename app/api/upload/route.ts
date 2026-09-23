import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Maximum upload size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

const ALLOWED_FOLDERS = ['posts', 'videos', 'avatars', 'events', 'general', 'banners', 'qrs'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const base64Data = formData.get('base64') as string | null;
    let folder = (formData.get('folder') as string) || 'general';

    // Sanitize folder
    if (!ALLOWED_FOLDERS.includes(folder)) {
      folder = 'general';
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Case 1: Standard File/Blob upload
    if (file && typeof file === 'object' && 'arrayBuffer' in file) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File size exceeds 100MB limit' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Safe extension extraction
      const originalName = file.name || 'upload.bin';
      const ext = path.extname(originalName).toLowerCase() || '.bin';
      const randomId = crypto.randomBytes(8).toString('hex');
      const fileName = `${Date.now()}-${randomId}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.promises.writeFile(filePath, buffer);

      const publicUrl = `/uploads/${folder}/${fileName}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName,
        size: file.size,
        contentType: file.type,
      });
    }

    // Case 2: Base64 string upload (e.g. cropped avatar)
    if (base64Data && typeof base64Data === 'string') {
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      let ext = '.jpg';

      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        if (mimeType.includes('png')) ext = '.png';
        else if (mimeType.includes('webp')) ext = '.webp';
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(base64Data, 'base64');
      }

      const randomId = crypto.randomBytes(8).toString('hex');
      const fileName = `${Date.now()}-${randomId}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.promises.writeFile(filePath, buffer);

      const publicUrl = `/uploads/${folder}/${fileName}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName,
        size: buffer.length,
      });
    }

    return NextResponse.json({ error: 'No file or base64 provided' }, { status: 400 });
  } catch (err: any) {
    console.error('Upload API error:', err);
    return NextResponse.json({ error: err?.message || 'Upload failed' }, { status: 500 });
  }
}
