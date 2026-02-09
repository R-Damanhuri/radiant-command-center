'use client';

import { AgentDefinition, ROLE_COLORS } from '@/lib/agent-registry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Activity, 
  Power, 
  PowerOff, 
  AlertCircle,
  Send,
  Hash,
  Users,
  Crown,
  BarChart,
  Code,
  Pen,
  Globe,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Role icon mapping
const ROLE_ICONS: Record<string, any> = {
  'Crown': Crown,
  'BarChart': BarChart,
  'Code': Code,
  'Pen': Pen,
  'Globe': Globe,
  'MessageCircle': MessageCircle,
};

// Format token count
function formatTokens(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
  return tokens.toString();
}

const statusConfig = {
  active: { color: 'success', icon: Activity, label: 'Active' },
  idle: { color: 'secondary', icon: Bot, label: 'Idle' },
  error: { color: 'error', icon: AlertCircle, label: 'Error' },
  offline: { color: 'outline', icon: PowerOff, label: 'Offline' },
};

interface AgentCardProps {
  agent: AgentDefinition;
  onExecute?: (agent: AgentDefinition) => void;
  onTogglePower?: (agentId: string) => void;
}

export function AgentCard({ agent, onExecute, onTogglePower }: AgentCardProps) {
  const status = statusConfig[agent.status];
  const roleColor = ROLE_COLORS[agent.role || ''] || 'from-slate-500/20 to-slate-600/10 border-slate-500/50';
  const RoleIcon = ROLE_ICONS[agent.icon || 'Bot'] || Bot;

  return (
    <Card className={cn(
      'transition-all duration-200 hover:border-slate-600 bg-gradient-to-br',
      roleColor
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              agent.status === 'active' && 'bg-emerald-500/20',
              agent.status === 'idle' && 'bg-slate-700',
              agent.status === 'error' && 'bg-red-500/20',
              agent.status === 'offline' && 'bg-slate-800'
            )}>
              <RoleIcon className={cn(
                'w-5 h-5',
                agent.status === 'active' && 'text-emerald-400',
                agent.status === 'idle' && 'text-slate-400',
                agent.status === 'error' && 'text-red-400',
                agent.status === 'offline' && 'text-slate-500'
              )} />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {agent.name}
                {agent.role === 'Commander' && (
                  <Crown className="w-4 h-4 text-amber-400" />
                )}
              </CardTitle>
              <span className="text-xs text-slate-500">{agent.role}</span>
            </div>
          </div>
          <Badge variant={status.color as any}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-400 line-clamp-2">{agent.description}</p>
        
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.slice(0, 4).map((cap) => (
            <Badge key={cap} variant="outline" className="text-xs">
              {cap.replace('-', ' ')}
            </Badge>
          ))}
          {agent.capabilities.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{agent.capabilities.length - 4}
            </Badge>
          )}
        </div>

        {/* OpenClaw Stats */}
        {(agent.tokens || agent.sessionId) && (
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {agent.tokens && (
              <div className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                <span>{formatTokens(agent.tokens)} tokens</span>
              </div>
            )}
            {agent.sessionId && (
              <span className="truncate max-w-[80px]">
                {agent.sessionId.slice(0, 6)}...
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
          <span className="text-xs text-slate-500">
            {new Date(agent.lastActive).toLocaleTimeString()}
          </span>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onTogglePower?.(agent.id)}
              title={agent.status === 'active' ? 'Deactivate' : 'Activate'}
            >
              {agent.status === 'active' ? (
                <PowerOff className="w-4 h-4 text-red-400" />
              ) : (
                <Power className="w-4 h-4 text-emerald-400" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onExecute?.(agent)}
              disabled={agent.status !== 'active'}
              title="Assign Task"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
