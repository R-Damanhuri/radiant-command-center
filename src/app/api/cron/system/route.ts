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
      // Parse crontab line: "0 2 * * * command"
      const match = line.match(/^(\S+\s+\S+\s+\S+\s+\S+\s+\S+)\s+(.+)$/);
      if (match) {
        const [_, schedule, command] = match;
        
        // Identify backup name from command
        let name = 'Infrastructure';
        if (command.includes('workspace-quest')) {
          name = 'Quest Workspace Backup';
        } else if (command.includes('workspace-forge')) {
          name = 'Forge Workspace Backup';
        } else if (command.includes('command-center')) {
          name = 'Command Center Backup';
        } else if (command.includes('radiant-projects')) {
          name = 'Radiant Projects Backup';
        } else if (command.includes('workspace')) {
          name = 'Radiant Workspace Backup';
        }

        return {
          id: `sys-${index}`,
          name: name,
          schedule: schedule.trim(),
          command: command.trim(),
          type: 'infrastructure',
        };
      }
      return null;
    }).filter(Boolean);
    
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Failed to fetch system cron:', error);
    return NextResponse.json({ jobs: [] });
  }
}
