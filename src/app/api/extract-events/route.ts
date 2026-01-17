import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { NextResponse } from 'next/server';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    console.log('Starting event extraction...');
    
    // Correct path to where the file actually is
    const projectRoot = 'C:\\Users\\aayan\\calendo';
    const scriptPath = resolve(projectRoot, 'src', 'app', 'apis', 'extract_dates.py');
    const jsonPath = resolve(projectRoot, 'src', 'app', 'apis', 'calendar_events.json');
    
    console.log('Script path:', scriptPath);
    
    const { stdout, stderr } = await execAsync(`python "${scriptPath}"`);
    console.log('Python stdout:', stdout);
    if (stderr) console.log('Python stderr:', stderr);

    console.log('Reading JSON from:', jsonPath);
    const jsonData = await readFile(jsonPath, 'utf-8');
    const events = JSON.parse(jsonData);

    return NextResponse.json(events);
  } catch (error) {
    console.error('Full error:', error);
    return NextResponse.json(
      { error: 'Failed to extract events', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}