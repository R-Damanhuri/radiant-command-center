'use client';

import { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Kanban as KanbanIcon, 
  Circle, 
  Clock, 
  CheckCircle2,
  Plus
} from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove?: (taskId: string, newStatus: TaskStatus) => void;
  onTaskAssign?: (taskId: string, agentId: string) => void;
  onAddTask?: (status: TaskStatus) => void;
  agents?: { id: string; name: string }[];
}

const columns: { id: TaskStatus; title: string; icon: any; color: string }[] = [
  { id: 'todo', title: 'To Do', icon: Circle, color: 'text-slate-400' },
  { id: 'in-progress', title: 'In Progress', icon: Clock, color: 'text-amber-400' },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: 'text-emerald-400' },
];

export function KanbanBoard({ tasks, onTaskMove, onTaskAssign, onAddTask, agents = [] }: KanbanBoardProps) {
  const getTasksByStatus = (status: TaskStatus) => 
    tasks.filter((t) => t.status === status);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const columnTasks = getTasksByStatus(col.id);
        const Icon = col.icon;

        return (
          <div
            key={col.id}
            className="flex-shrink-0 w-80"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className={cn('w-4 h-4', col.color)} />
                <h3 className="font-medium text-sm text-slate-200">
                  {col.title}
                </h3>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onAddTask?.(col.id)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-slate-800/30 rounded-xl p-3 min-h-[200px] border border-slate-800">
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={onTaskMove}
                    onAssign={onTaskAssign}
                    agents={agents}
                  />
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
