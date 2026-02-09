'use client';

import { Task } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GripVertical, 
  User, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onAssign?: (taskId: string, agentId: string) => void;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  agents?: { id: string; name: string }[];
}

const priorityConfig = {
  high: { color: 'error', label: 'High' },
  medium: { color: 'warning', label: 'Medium' },
  low: { color: 'secondary', label: 'Low' },
};

export function TaskCard({ task, onAssign, onStatusChange, agents = [] }: TaskCardProps) {
  const priority = priorityConfig[task.priority];

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors cursor-grab active:cursor-grabbing">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <GripVertical className="w-4 h-4 text-slate-500 mt-1" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-slate-200 truncate">
              {task.title}
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              {task.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <Badge variant={priority.color as any} className="text-xs">
          {priority.label}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {task.status.replace('-', ' ')}
        </Badge>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          {new Date(task.createdAt).toLocaleDateString()}
        </div>
        
        {task.assignedAgent ? (
          <div className="flex items-center gap-1 text-xs text-emerald-400">
            <User className="w-3 h-3" />
            {agents.find(a => a.id === task.assignedAgent)?.name || task.assignedAgent.replace('agent-', '')}
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs text-slate-400 hover:text-slate-200"
            onClick={() => {
              const agentId = agents[0]?.id;
              if (agentId) onAssign?.(task.id, agentId);
            }}
          >
            Assign
          </Button>
        )}
      </div>

      {task.status !== 'done' && (
        <div className="flex gap-1 mt-2">
          {task.status === 'in-progress' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs flex-1"
              onClick={() => onStatusChange?.(task.id, 'todo')}
            >
              <Circle className="w-3 h-3 mr-1" />
              TODO
            </Button>
          )}
          {task.status === 'todo' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs flex-1"
              onClick={() => onStatusChange?.(task.id, 'in-progress')}
            >
              <Clock className="w-3 h-3 mr-1" />
              DOING
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs flex-1 text-emerald-400 hover:text-emerald-300"
            onClick={() => onStatusChange?.(task.id, 'done')}
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            DONE
          </Button>
        </div>
      )}
    </div>
  );
}
