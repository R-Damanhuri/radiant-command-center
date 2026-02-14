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
    // Run command with full path
    const openclawPath = '/home/ubuntu/.npm-global/bin/openclaw';
    const output = execSync(`${openclawPath} agents list --json 2>&1`, {
      encoding: 'utf-8',
      timeout: 10000,
    });
    
    // Find JSON array in output (skip doctor warnings)
    const lines = output.split('\n');
    let jsonString = '';
    
    // Look for JSON array starting with '['
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('[')) {
        // Found start of JSON array, collect from here
        jsonString = lines.slice(i).join('\n');
        break;
      }
    }
    
    // If no JSON found, try to parse entire output
    if (!jsonString) {
      jsonString = output;
    }
    
    // Clean up: remove doctor warnings and other non-JSON text
    // Use more robust JSON extraction
    let jsonStart = jsonString.indexOf('[');
    if (jsonStart === -1) {
      console.warn('[AgentRegistry] No JSON array found in output:', output.substring(0, 200));
      return getDefaultAgents();
    }
    
    // Extract from '[' to the end, then find matching ']'
    let jsonExtract = jsonString.substring(jsonStart);
    let bracketCount = 0;
    let endIndex = -1;
    
    for (let i = 0; i < jsonExtract.length; i++) {
      if (jsonExtract[i] === '[') bracketCount++;
      if (jsonExtract[i] === ']') bracketCount--;
      if (bracketCount === 0) {
        endIndex = i + 1;
        break;
      }
    }
    
    if (endIndex === -1) {
      console.warn('[AgentRegistry] Could not find matching brackets');
      return getDefaultAgents();
    }
    
    const jsonContent = jsonExtract.substring(0, endIndex);
    
    let agents;
    try {
      agents = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('[AgentRegistry] JSON parse error:', parseError.message);
      console.error('JSON content (first 300 chars):', jsonContent.substring(0, 300));
      return getDefaultAgents();
    }
    
    if (!Array.isArray(agents)) {
      console.warn('[AgentRegistry] Parsed data is not an array:', agents);
      return getDefaultAgents();
    }
    
    console.log('[AgentRegistry] Loaded', agents.length, 'agents from CLI');
    
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
