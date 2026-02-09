import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

const TASKS_DB = '/home/ubuntu/.openclaw/workspace/tasks/tasks.json';

// Map backend status to frontend status
function mapStatus(status: string): 'todo' | 'in-progress' | 'done' {
  const statusMap: Record<string, 'todo' | 'in-progress' | 'done'> = {
    'pending': 'todo',
    'assigned': 'todo',
    'in_progress': 'in-progress',
    'in-progress': 'in-progress',
    'completed': 'done',
    'done': 'done',
    'failed': 'todo',
  };
  return statusMap[status] || 'todo';
}

// Transform task to frontend format
function transformTask(task: any) {
  return {
    id: task.id,
    title: task.name,
    description: task.description || '',
    status: mapStatus(task.status),
    assignedAgent: task.assigned_agent,
    assignedRole: task.assigned_agent,
    createdAt: task.created_at,
    priority: task.priority || 'medium',
    startedAt: task.startedAt,
    completedAt: task.completedAt,
    result: task.result,
  };
}

export async function GET() {
  try {
    if (!fs.existsSync(TASKS_DB)) {
      return NextResponse.json({ tasks: [] });
    }
    
    const data = fs.readFileSync(TASKS_DB, 'utf-8');
    const tasks = JSON.parse(data);
    
    // Convert to array format and transform
    const taskArray = Object.values(tasks) as any[];
    const transformedTasks = taskArray.map(transformTask);
    
    return NextResponse.json({ tasks: transformedTasks });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, taskId, status, result } = body;
    
    if (!fs.existsSync(TASKS_DB)) {
      return NextResponse.json({ error: 'Tasks DB not found' }, { status: 404 });
    }
    
    const data = fs.readFileSync(TASKS_DB, 'utf-8');
    const tasks = JSON.parse(data);
    
    if (action === 'updateStatus') {
      // Find task by ID
      const taskKey = Object.keys(tasks).find(
        key => tasks[key].id === taskId || 
               tasks[key].name?.toLowerCase() === taskId?.toLowerCase()
      );
      
      if (!taskKey) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      
      tasks[taskKey].status = status;
      if (result) {
        tasks[taskKey].result = result;
      }
      
      fs.writeFileSync(TASKS_DB, JSON.stringify(tasks, null, 2));
      return NextResponse.json({ success: true, task: tasks[taskKey] });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
