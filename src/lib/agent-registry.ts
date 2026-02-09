// Agent Registry - Client-safe module
// Dynamically fetches from OpenClaw agents

// Color mapping
const ROLE_COLORS: Record<string, string> = {
  'radiant': 'emerald',
  'research': 'blue',
  'analyst': 'blue',
  'coder': 'purple',
  'writer': 'amber',
  'scraper': 'orange',
  'outreach': 'pink',
};

export interface AgentDefinition {
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

// Dynamic agent registry - fetches from OpenClaw CLI
let cachedAgents: AgentDefinition[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 30000; // 30 seconds

export async function getAllAgents(): Promise<AgentDefinition[]> {
  const now = Date.now();
  
  // Return cached if fresh
  if (cachedAgents && (now - lastFetch) < CACHE_TTL) {
    return cachedAgents;
  }
  
  try {
    const response = await fetch('/api/agents');
    if (response.ok) {
      const data = await response.json();
      cachedAgents = data.agents || [];
      lastFetch = now;
      return cachedAgents;
    }
  } catch (e) {
    console.error('Failed to fetch agents:', e);
  }
  
  // Fallback to static
  return cachedAgents || [];
}

export async function getAgentById(id: string): Promise<AgentDefinition | undefined> {
  const agents = await getAllAgents();
  return agents.find(a => a.id === id);
}

// Fallback static agents (for demo)
const STATIC_AGENTS: AgentDefinition[] = [
  {
    id: 'radiant',
    name: 'Radiant',
    role: 'commander',
    description: 'Main AI Assistant - Intent understanding, planning, coordination',
    capabilities: ['all-purpose', 'intent-analysis', 'task-planning', 'communication'],
    systemPrompt: 'You are Radiant, an AI Commander.',
    color: 'emerald',
    icon: 'Sparkles',
    status: 'active',
    model: 'opencode/kimi-k2.5-free',
  },
  {
    id: 'research',
    name: 'Research',
    role: 'research',
    description: 'Research specialist - Data analysis, insights, trends',
    capabilities: ['research', 'data-analysis', 'insights', 'trend-analysis'],
    systemPrompt: 'You are Research agent.',
    color: 'blue',
    icon: 'Search',
    status: 'active',
    model: 'opencode/kimi-k2.5-free',
  },
];

// For backwards compatibility
export const AGENT_ROLES: Record<string, AgentDefinition> = {};

export { ROLE_COLORS };
