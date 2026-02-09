import { Task, IntentAnalysis } from '@/types';
import { AGENT_ROLES } from '@/lib/agent-registry';

// Intent analysis
export function analyzeIntent(userRequest: string): IntentAnalysis {
  const request = userRequest.toLowerCase();
  
  if (request.includes('analisis') || request.includes('analysis') || request.includes('research')) {
    return {
      primaryRole: 'analyst',
      subTasks: [
        { role: 'analyst', description: 'Research and analyze data', priority: 'high' },
        { role: 'scraper', description: 'Extract supporting data', priority: 'medium' },
        { role: 'writer', description: 'Compile findings', priority: 'medium' },
      ],
      estimatedComplexity: 'moderate',
      suggestedApproach: 'Research-focused workflow',
    };
  }
  
  if (request.includes('code') || request.includes('bug') || request.includes('file')) {
    return {
      primaryRole: 'coder',
      subTasks: [
        { role: 'coder', description: 'Implement functionality', priority: 'high' },
        { role: 'coder', description: 'Test and debug', priority: 'medium' },
      ],
      estimatedComplexity: 'moderate',
      suggestedApproach: 'Development-focused',
    };
  }
  
  if (request.includes('tulis') || request.includes('write') || request.includes('content')) {
    return {
      primaryRole: 'writer',
      subTasks: [
        { role: 'writer', description: 'Create content', priority: 'high' },
      ],
      estimatedComplexity: 'simple',
      suggestedApproach: 'Direct content creation',
    };
  }
  
  if (request.includes('scrape') || request.includes('extract') || request.includes('ambil data')) {
    return {
      primaryRole: 'scraper',
      subTasks: [
        { role: 'scraper', description: 'Extract required data', priority: 'high' },
        { role: 'writer', description: 'Format results', priority: 'medium' },
      ],
      estimatedComplexity: 'moderate',
      suggestedApproach: 'Extraction-focused',
    };
  }
  
  return {
    primaryRole: 'commander',
    subTasks: [
      { role: 'analyst', description: 'Initial research', priority: 'high' },
    ],
    estimatedComplexity: 'complex',
    suggestedApproach: 'Full coordination workflow',
  };
}

// Send task to agent via OpenClaw CLI
export async function sendTaskToAgent(agentRole: string, taskDescription: string): Promise<boolean> {
  try {
    // Get the session key for the agent role
    // For now, we'll send to main session since we don't have direct session access
    const message = `[CMD] ${agentRole}: ${taskDescription.slice(0, 500)}`;

    const response = await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command: 'sessions send',
        args: ['main:main', message],
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`[Commander] Task sent to ${agentRole}:`, message);
      return true;
    } else {
      console.error('Failed to send task:', result.error || result.stderr);
      return false;
    }
  } catch (error) {
    console.error('Error sending task:', error);
    return false;
  }
}

// Create task from intent
export function createTaskFromIntent(intent: IntentAnalysis, userRequest: string): Task {
  return {
    id: `task-${Date.now()}`,
    title: userRequest.slice(0, 50) + (userRequest.length > 50 ? '...' : ''),
    description: userRequest,
    status: 'todo',
    priority: intent.estimatedComplexity === 'complex' ? 'high' : 'medium',
    createdAt: new Date().toISOString(),
    intent,
  };
}

// Export AGENT_ROLES for backwards compatibility
export { AGENT_ROLES };

export function getMockTasks(): Task[] {
  return [
    {
      id: 'task-demo',
      title: 'Demo: Analisis kompetitor',
      description: 'Buat analisis kompetitor Shopee',
      status: 'todo',
      priority: 'high',
      createdAt: new Date().toISOString(),
      intent: {
        primaryRole: 'analyst',
        subTasks: [
          { role: 'analyst', description: 'Research competitor data', priority: 'high' },
          { role: 'scraper', description: 'Extract product data', priority: 'medium' },
        ],
        estimatedComplexity: 'moderate',
        suggestedApproach: 'Research-focused workflow',
      },
    },
  ];
}
