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
  Circle,
  Trash2,
  Edit,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  onAssign?: (taskId: string, agentId: string) => void;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (taskId: string, updates: Partial<Task>) => void;
  agents?: { id: string; name: string }[];
}

const priorityConfig = {
  high: { color: 'error', label: 'High' },
  medium: { color: 'warning', label: 'Medium' },
  low: { color: 'secondary', label: 'Low' },
};

export function TaskCard({ 
  task, 
  onAssign, 
  onStatusChange, 
  onDelete,
  onEdit,
  agents = [] 
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const priority = priorityConfig[task.priority];

  const handleAssign = (agentId: string) => {
    onAssign?.(task.id, agentId);
    setShowMenu(false);
  };

  const handleStatusChange = (newStatus: Task['status']) => {
    onStatusChange?.(task.id, newStatus);
  };

  const handleDelete = () => {
    if (confirm(`Delete task: ${task.title}?`)) {
      onDelete?.(task.id);
    }
    setShowMenu(false);
  };

  const handleEdit = () => {
    const newTitle = prompt('Edit task title:', task.title);
    if (newTitle === null) return;
    
    const newDescription = prompt('Edit task description:', task.description);
    if (newDescription === null) return;
    
    const newPriority = prompt('Edit priority (low/medium/high):', task.priority);
    if (newPriority === null) return;
    
    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    const priority = validPriorities.includes(newPriority.toLowerCase()) 
      ? newPriority.toLowerCase() as 'low' | 'medium' | 'high'
      : task.priority;
    
    onEdit?.(task.id, {
      title: newTitle,
      description: newDescription,
      priority: priority
    });
    setShowMenu(false);
  };

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
        
        {/* Action Menu */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10 min-w-32">
              <button 
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-t-lg"
                onClick={handleEdit}
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
              
              {!task.assignedAgent && agents.length > 0 && (
                <div className="border-t border-slate-700">
                  <div className="px-3 py-2 text-xs text-slate-500">Assign to:</div>
                  {agents.map(agent => (
                    <button 
                      key={agent.id}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
                      onClick={() => handleAssign(agent.id)}
                    >
                      <User className="w-3 h-3" />
                      {agent.name}
                    </button>
                  ))}
                </div>
              )}
              
              <button 
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-700 rounded-b-lg border-t border-slate-700"
                onClick={handleDelete}
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          )}
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

      {/* Quick Status Actions */}
      {task.status !== 'done' && (
        <div className="flex gap-1 mt-2">
          {task.status === 'in-progress' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs flex-1"
              onClick={() => handleStatusChange('todo')}
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
              onClick={() => handleStatusChange('in-progress')}
            >
              <Clock className="w-3 h-3 mr-1" />
              DOING
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs flex-1 text-emerald-400 hover:text-emerald-300"
            onClick={() => handleStatusChange('done')}
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            DONE
          </Button>
        </div>
      )}
    </div>
  );
}
