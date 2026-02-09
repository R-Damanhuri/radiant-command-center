import { NextRequest, NextResponse } from 'next/server';

// Allowlist of safe commands
const ALLOWED_COMMANDS = [
  'sessions list',
  'sessions send',
  'sessions spawn',
];

export async function POST(request: NextRequest) {
  try {
    const { command, args, message } = await request.json();
    
    if (!command) {
      return NextResponse.json({ error: 'No command provided' }, { status: 400 });
    }

    // Build the command safely
    let fullCommand = command;
    
    if (args && args.length > 0) {
      // Escape each argument properly
      const escapedArgs = args.map(arg => {
        // Escape special shell characters but keep newlines for message
        return `"${arg.replace(/"/g, '\\"')}"`;
      });
      fullCommand += ' ' + escapedArgs.join(' ');
    }

    // Validate command is in allowlist
    const baseCommand = command.split(' ')[0];
    const isAllowed = ALLOWED_COMMANDS.some(allowed => 
      baseCommand === allowed.split(' ')[0]
    );

    if (!isAllowed) {
      return NextResponse.json({ error: 'Command not allowed' }, { status: 403 });
    }

    // Execute command via openclaw CLI
    const { execSync } = require('child_process');
    
    try {
      const output = execSync(`openclaw ${fullCommand}`, {
        encoding: 'utf-8',
        timeout: 30000,
        maxBuffer: 10 * 1024 * 1024, // 10MB
        env: { ...process.env, HOME: process.env.HOME },
      });
      
      return NextResponse.json({ 
        success: true, 
        output: output,
        command: fullCommand,
      });
    } catch (execError: any) {
      return NextResponse.json({ 
        success: false,
        error: execError.message || 'Command failed',
        stderr: execError.stderr,
        command: fullCommand,
      });
    }
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
