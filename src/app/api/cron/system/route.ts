import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET() {
  try {
    const output = execSync('crontab -l 2>/dev/null || echo ""', {
      encoding: 'utf-8',
      timeout: 5000,
    });
    
    const lines = output.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    const jobs = lines.map((line, index) => {
      // Parse crontab line: "0 2 * * * cd /path && git add . && commit..."
      const match = line.match(/^(\S+\s+\S+\s+\S+\s+\S+)\s+(.+)$/);
      if (match) {
        const [_, schedule, command] = match;
        return {
          id: `sys-${index}`,
          schedule: schedule.trim(),
          command: command.trim(),
          type: 'infrastructure',
        };
      }
      return null;
    }).filter(Boolean);
    
    return NextResponse.json({ jobs });
  } catch (error) {
    return NextResponse.json({ jobs: [] });
  }
}
