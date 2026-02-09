// Agent Registry - Server-only module
// This file can only be imported in server-side code (API routes)

import { execSync } from 'child_process';

// OpenClaw agent config interface
export interface OpenClawAgentConfig {
  id: string;
  name: string;
  role: string;
  description?: string;
  model?: string;
  capabilities?: string[];
  groupChat?: {
    mentionPatterns?: string[];
    historyLimit?: number;
  };
}

// Fetch agents from OpenClaw CLI
export function loadAgentsFromConfig(): OpenClawAgentConfig[] {
  try {
    const output = execSync('openclaw agents list --json 2>/dev/null || echo "[]"', {
      encoding: 'utf-8',
      timeout: 10000,
    });
    
    // Extract JSON from output (handles doctor warnings)
    const jsonMatch = output.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return getDefaultAgents();
    }
    
    const agents = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(agents)) {
      return getDefaultAgents();
    }
    
    return agents.map((a: any) => ({
      id: a.agentId || a.id || a.name,
      name: a.name || a.identityName || a.agentId || a.id,
      role: a.role || a.agentId || a.id || a.name,
      description: a.description || `${a.name || a.agentId || a.id} agent`,
      model: a.model,
      capabilities: [],
    }));
  } catch (error) {
    console.error('[AgentRegistry] Failed to fetch agents from CLI:', error);
    return getDefaultAgents();
  }
}

// Default agents if CLI fails
function getDefaultAgents(): OpenClawAgentConfig[] {
  return [
    {
      id: 'radiant',
      name: 'Radiant',
      role: 'commander',
      description: 'Main AI Assistant',
      model: 'opencode/kimi-k2.5-free',
      capabilities: ['all-purpose'],
    },
    {
      id: 'research',
      name: 'Research',
      role: 'research',
      description: 'Research specialist',
      model: 'opencode/kimi-k2.5-free',
      capabilities: ['research', 'analysis'],
    },
  ];
}
