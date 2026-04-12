import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
export const runtime = 'nodejs';

function resolveImagesDirectory(): string {
  const directPath = path.join(process.cwd(), 'public', 'images');
  const monorepoPath = path.join(process.cwd(), 'apps', 'web', 'public', 'images');
  return directPath.includes(`${path.sep}apps${path.sep}web${path.sep}`) ? directPath : monorepoPath;
}

export async function GET() {
  const imagesDir = resolveImagesDirectory();

  try {
    const entries = await fs.readdir(imagesDir, { withFileTypes: true });
    const images = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((fileName) => ALLOWED_IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
      .map((fileName) => `/images/${fileName}`);

    return NextResponse.json({ images }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ images: [] }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
