import { NextResponse } from 'next/server';
import { loadAgentsFromConfig, type OpenClawAgentConfig } from '@/lib/agent-config';

// Role to icon mapping
const ROLE_ICONS: Record<string, string> = {
  'radiant': 'Sparkles',
  'research': 'Search',
  'analyst': 'BarChart',
  'coder': 'Code',
  'writer': 'Pen',
  'scraper': 'Globe',
  'outreach': 'MessageCircle',
};

// Role to color mapping
const ROLE_COLORS: Record<string, string> = {
  'radiant': 'emerald',
  'research': 'blue',
  'analyst': 'blue',
  'coder': 'purple',
  'writer': 'amber',
  'scraper': 'orange',
  'outreach': 'pink',
};

// System prompts for each role
const ROLE_PROMPTS: Record<string, string> = {
  'radiant': 'You are Radiant, an AI Commander. Your job is to understand user intent, break down complex goals into tasks, assign them to specialist agents, coordinate execution, and synthesize results.',
  'research': 'You are Research agent. Focus on research, data analysis, insights generation, and trend analysis.',
  'analyst': 'You are Analyst, a specialist AI agent focused on research and data analysis.',
  'coder': 'You are Coder, a specialist AI agent focused on software development.',
  'writer': 'You are Writer, a specialist AI agent focused on content creation.',
  'scraper': 'You are Scraper, a specialist AI agent focused on browser automation.',
  'outreach': 'You are Outreach, a specialist AI agent focused on communications.',
};

interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  systemPrompt: string;
  color: string;
  icon: string;
  status: 'active' | 'idle' | 'offline';
  model?: string;
  sessionId?: string;
  lastActive?: string;
}

function transformAgent(config: OpenClawAgentConfig): AgentDefinition {
  const role = config.role || config.id;
  const displayName = config.name || config.id;
  
  return {
    id: config.id,
    name: displayName,
    role: role,
    description: config.description || `${displayName} agent`,
    capabilities: config.capabilities || [],
    systemPrompt: ROLE_PROMPTS[role] || ROLE_PROMPTS[config.id] || `You are ${displayName}.`,
    color: ROLE_COLORS[role] || ROLE_COLORS[config.id] || 'slate',
    icon: ROLE_ICONS[role] || ROLE_ICONS[config.id] || 'Bot',
    status: config.id === 'radiant' || config.id === 'research' ? 'active' : 'idle',
    model: config.model,
  };
}

export async function GET() {
  try {
    const configAgents = loadAgentsFromConfig();
    const agents = configAgents.map(transformAgent);
    
    return NextResponse.json({ 
      agents,
      count: agents.length,
      source: 'openclaw-cli'
    });
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}
