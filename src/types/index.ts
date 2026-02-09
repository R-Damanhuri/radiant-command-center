export type AgentStatus = 'active' | 'idle' | 'error' | 'offline';

export interface AgentRole {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  systemPrompt?: string;
  color?: string;
  icon?: string;
}

export interface Agent extends AgentRole {
  id: string;
  name: string;
  status: AgentStatus;
  description: string;
  capabilities: string[];
  lastActive: string;
  model?: string;
  // OpenClaw specific fields
  tokens?: number;
  sessionId?: string;
  // Role-specific
  role?: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedAgent?: string;
  assignedRole?: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  // Intent analysis
  intent?: {
    primaryRole: string;
    subTasks: {
      role: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      dependencies?: string[];
    }[];
    estimatedComplexity: 'simple' | 'moderate' | 'complex';
    suggestedApproach: string;
  };
  // Execution tracking
  startedAt?: string;
  completedAt?: string;
  result?: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}
