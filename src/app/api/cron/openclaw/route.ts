import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET() {
  try {
    const rawOutput = execSync('openclaw cron list --json 2>/dev/null || echo "{}"', {
      encoding: 'utf-8',
      timeout: 10000,
    });
    
    // Extract JSON from output (handles doctor warnings)
    const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ jobs: [] });
    }
    
    const data = JSON.parse(jsonMatch[0]);
    const jobs = (data.jobs || []).map((job: any) => ({
      id: job.id,
      name: job.name,
      schedule: job.schedule?.expr || job.schedule?.kind || '',
      command: `openclaw cron run ${job.id}`,
      type: 'agent',
      agent: job.agentId || null,
      enabled: job.enabled,
    }));
    
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Failed to fetch OpenClaw cron:', error);
    return NextResponse.json({ jobs: [] });
  }
}
