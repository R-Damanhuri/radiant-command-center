import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SESSIONS_FILE = process.env.OPENCLAW_SESSIONS_PATH || '/home/ubuntu/.openclaw/agents/main/sessions/sessions.json';

export async function GET() {
  try {
    if (!fs.existsSync(SESSIONS_FILE)) {
      return NextResponse.json({ sessions: [], error: 'Sessions file not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Transform object format to array format
    const sessions = Object.entries(data)
      .filter(([key]) => key !== 'sessions_history') // Skip internal keys
      .map(([key, value]) => ({
        key,
        ...(value as object)
      }));
    
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Failed to read sessions:', error);
    return NextResponse.json({ sessions: [], error: 'Failed to read sessions' }, { status: 500 });
  }
}
