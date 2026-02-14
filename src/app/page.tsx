'use client';

import { useState, useEffect } from 'react';
import { getMockTasks, sendTaskToAgent } from '@/lib/api';
import { AgentCard } from '@/components/AgentCard';
import { KanbanBoard } from '@/components/KanbanBoard';
import { CommanderPanel } from '@/components/CommanderPanel';
import { CronJobsCard } from '@/components/CronJobsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Command, 
  Plus, 
  RefreshCw, 
  Settings,
  Sparkles,
  Users,
  Layers,
  Crown,
  Trash2
} from 'lucide-react';
import { AgentDefinition, getAllAgents } from '@/lib/agent-registry';
import { Task, Agent } from '@/types';

export default function CommandCenter() {
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agents' | 'tasks'>('dashboard');

  // Load tasks from API on mount
  useEffect(() => {
    loadTasks();
    loadData();
  }, []);

  // Refresh when tab changes
  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'agents' || activeTab === 'tasks') {
      loadTasks();
      loadData();
    }
  }, [activeTab]);

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data.tasks || []);
      // Also save to localStorage as backup
      localStorage.setItem('command-center-tasks', JSON.stringify(data.tasks || []));
    } catch (error) {
      console.error('Failed to load tasks:', error);
      // Fallback to localStorage
      const savedTasks = localStorage.getItem('command-center-tasks');
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks));
        } catch (e) {
          setTasks(getMockTasks());
        }
      } else {
        setTasks(getMockTasks());
      }
    }
  };

  // Save tasks to localStorage and API on change
  useEffect(() => {
    if (!loading && tasks.length > 0) {
      localStorage.setItem('command-center-tasks', JSON.stringify(tasks));
    }
  }, [tasks, loading]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch from agent registry API
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Failed to load agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskMove = async (taskId: string, newStatus: Task['status']) => {
    // Update local state
    const updatedTasks = tasks.map((t) => 
      t.id === taskId ? { 
        ...t, 
        status: newStatus,
        startedAt: newStatus === 'in-progress' ? new Date().toISOString() : t.startedAt,
        completedAt: newStatus === 'done' ? new Date().toISOString() : t.completedAt,
      } : t
    );
    setTasks(updatedTasks);
    
    // Sync with API
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'updateStatus', 
          taskId, 
          status: newStatus,
          result: `Status changed to ${newStatus}`
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to sync task status:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          taskId,
          newStatus
        });
      } else {
        const result = await response.json();
        console.log('Task status updated successfully:', result);
      }
    } catch (error) {
      console.error('Failed to sync task status:', error);
    }
  };

  const handleTaskAssign = async (taskId: string, agentId: string) => {
    // Update local state
    const updatedTasks = tasks.map((t) => 
      t.id === taskId ? { ...t, assignedAgent: agentId } : t
    );
    setTasks(updatedTasks);
    
    // Sync with API
    try {
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (taskToUpdate) {
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: taskId,
            assignedAgent: agentId,
            title: taskToUpdate.title,
            description: taskToUpdate.description,
            priority: taskToUpdate.priority
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to assign task');
        }
      }
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
  };

  const handleCreateTask = async (task: Task) => {
    try {
      // Send to API
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'create',
          title: task.title,
          description: task.description,
          assignedAgent: task.assignedAgent || 'radiant',
          priority: task.priority || 'medium',
          labels: task.labels || []
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Add new task to local state
        setTasks(prev => [data.task, ...prev]);
        return true;
      } else {
        console.error('Failed to create task');
        return false;
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      return false;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from local state
        setTasks(prev => prev.filter(t => t.id !== taskId));
        console.log('Task deleted successfully:', taskId);
        return true;
      } else {
        const errorText = await response.text();
        console.error('Failed to delete task:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          taskId
        });
        return false;
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      return false;
    }
  };

  const handleEditTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: taskId,
          ...updates
        }),
      });
      
      if (response.ok) {
        // Update local state
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, ...updates } : t
        ));
        return true;
      } else {
        console.error('Failed to edit task');
        return false;
      }
    } catch (error) {
      console.error('Failed to edit task:', error);
      return false;
    }
  };

  const handleAddTask = (status: TaskStatus) => {
    const title = prompt('Task title:');
    if (!title) return;
    
    const description = prompt('Task description:');
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description: description || '',
      status,
      priority: 'medium',
      createdAt: new Date().toISOString(),
    };
    
    handleCreateTask(newTask);
  };

  const handleExecuteAgent = async (agent: Agent) => {
    const taskDescription = prompt(`Send task to ${agent.name}:`);
    if (!taskDescription) return;
    
    try {
      // First, create task in backend
      const createResponse = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          title: taskDescription.slice(0, 40) + (taskDescription.length > 40 ? '...' : ''),
          description: taskDescription,
          assignedAgent: agent.id,
          status: 'in-progress', // Start in in-progress since it's being assigned
          priority: 'medium',
        }),
      });
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('Failed to create task:', errorText);
        alert(`❌ Failed to create task: ${errorText}`);
        return;
      }
      
      const createData = await createResponse.json();
      const newTask = createData.task;
      
      // Then send to agent via OpenClaw
      const sendSuccess = await sendTaskToAgent(agent.role || 'commander', taskDescription);
      
      if (sendSuccess) {
        // Update task status to reflect it's been sent
        const updateResponse = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'updateStatus',
            taskId: newTask.id,
            status: 'in-progress',
            result: `Task sent to ${agent.name}`,
          }),
        });
        
        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          // Add/update in local state
          setTasks(prev => {
            const filtered = prev.filter(t => t.id !== newTask.id);
            return [updateData.task, ...filtered];
          });
        } else {
          // Still add to local state even if update fails
          setTasks(prev => [newTask, ...prev]);
        }
        
        alert(`✅ Task sent to ${agent.name}!\n\nTask added to kanban for tracking.`);
      } else {
        // If send fails, mark task as todo
        const failResponse = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'updateStatus',
            taskId: newTask.id,
            status: 'todo',
            result: `Failed to send to agent`,
          }),
        });
        
        if (failResponse.ok) {
          const failData = await failResponse.json();
          setTasks(prev => [failData.task, ...prev]);
        } else {
          setTasks(prev => [newTask, ...prev]);
        }
        
        alert(`✅ Task created but failed to send to ${agent.name}.\n\nTask added to kanban for tracking.`);
      }
    } catch (error) {
      console.error('Error in handleExecuteAgent:', error);
      alert('❌ Error processing task');
    }
  };

  const activeAgents = agents.filter((a) => a.status === 'active').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'done').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading Command Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <Command className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Command Center</h1>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  Radiant Commander • Role-Based Agent Network
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">{activeAgents}</span>
                  <span className="text-slate-500">active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300">{pendingTasks}</span>
                  <span className="text-slate-500">pending</span>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-700" />

              {/* Tabs */}
              <div className="flex items-center bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-slate-700 text-slate-100'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('agents')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    activeTab === 'agents'
                      ? 'bg-slate-700 text-slate-100'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Agents
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    activeTab === 'tasks'
                      ? 'bg-slate-700 text-slate-100'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tasks
                </button>
              </div>

              <Button variant="ghost" size="icon" onClick={loadData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => {
                if (confirm('Clear all tasks?')) {
                  const defaultTasks = getMockTasks();
                  setTasks(defaultTasks);
                  localStorage.setItem('command-center-tasks', JSON.stringify(defaultTasks));
                }
              }} title="Clear Tasks">
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Commander Panel */}
            <section>
              <CommanderPanel onCreateTask={handleCreateTask} />
            </section>

            {/* Agents Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-400" />
                  Agent Network
                </h2>
                <div className="flex gap-2">
                  {Object.values(getAllAgents()).map(role => (
                    <Badge key={role.id} variant="outline" className="text-xs">
                      {role.role}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onExecute={handleExecuteAgent}
                  />
                ))}
              </div>
            </section>

            {/* Tasks Kanban Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <Layers className="w-5 h-5 text-slate-400" />
                  Task Board
                </h2>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                {/* Scheduled Jobs - Left Column */}
                <div className="xl:col-span-1">
                  <CronJobsCard 
                    onRun={(jobId, type) => {
                      console.log('Run job:', jobId, type);
                    }}
                    onDelete={(jobId, type) => {
                      console.log('Delete job:', jobId, type);
                    }}
                  />
                </div>
                
                {/* Kanban Board - Right Columns */}
                <div className="xl:col-span-3">
                  <KanbanBoard
                    tasks={tasks}
                    onTaskMove={handleTaskMove}
                    onTaskAssign={handleTaskAssign}
                    onDeleteTask={handleDeleteTask}
                    onEditTask={handleEditTask}
                    onAddTask={handleAddTask}
                    agents={agents.map((a) => ({ id: a.id, name: a.name }))}
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Agents View */}
        {activeTab === 'agents' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">All Agents</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onExecute={handleExecuteAgent}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tasks View */}
        {activeTab === 'tasks' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Task Management</h2>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
              {/* Scheduled Jobs */}
              <div className="xl:col-span-1">
                <CronJobsCard 
                  onRun={(jobId, type) => {
                    console.log('Run job:', jobId, type);
                  }}
                  onDelete={(jobId, type) => {
                    console.log('Delete job:', jobId, type);
                  }}
                />
              </div>
              
              {/* Kanban Board */}
              <div className="xl:col-span-3">
                <KanbanBoard
                  tasks={tasks}
                  onTaskMove={handleTaskMove}
                  onTaskAssign={handleTaskAssign}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={handleEditTask}
                  onAddTask={handleAddTask}
                  agents={agents.map((a) => ({ id: a.id, name: a.name }))}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
