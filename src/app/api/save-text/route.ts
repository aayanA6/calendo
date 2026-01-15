import { writeFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    // Remove all whitespace, newlines, tabs, and indentation
    const cleanedText = text.replace(/\s+/g, '');
    
    const filePath = join(process.cwd(), 'src', 'app', 'apis', 'userInput.txt');
    await writeFile(filePath, cleanedText, 'utf-8');
    
    return NextResponse.json({ success: true, path: filePath });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }
}