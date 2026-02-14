import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const TASKS_DB = '/home/ubuntu/.openclaw/workspace/tasks/tasks.json';

// Map backend status to frontend status
// STANDARD: Use dash format (todo, in-progress, done) everywhere
// Legacy mapping for backward compatibility
function mapStatus(status: string): 'todo' | 'in-progress' | 'done' {
  const statusMap: Record<string, 'todo' | 'in-progress' | 'done'> = {
    // Legacy statuses
    'pending': 'todo',
    'assigned': 'todo',
    'in_progress': 'in-progress',
    'completed': 'done',
    'failed': 'todo',
    // Standard statuses
    'todo': 'todo',
    'in-progress': 'in-progress',
    'done': 'done',
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

// Load tasks from file
function loadTasks() {
  if (!fs.existsSync(TASKS_DB)) {
    return {};
  }
  const data = fs.readFileSync(TASKS_DB, 'utf-8');
  return JSON.parse(data);
}

// Save tasks to file
function saveTasks(tasks: any) {
  // Ensure directory exists
  const dir = '/home/ubuntu/.openclaw/workspace/tasks';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(TASKS_DB, JSON.stringify(tasks, null, 2));
}

// Generate unique task ID
function generateTaskId() {
  return `task-${uuidv4().slice(0, 8)}`;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get('id');
    
    const tasks = loadTasks();
    
    if (idParam) {
      // Get single task
      const taskKey = Object.keys(tasks).find(
        key => tasks[key].id === idParam || 
               tasks[key].name?.toLowerCase() === idParam?.toLowerCase()
      );
      
      if (!taskKey) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      
      return NextResponse.json({ task: transformTask(tasks[taskKey]) });
    } else {
      // Get all tasks
      const taskArray = Object.values(tasks) as any[];
      const transformedTasks = taskArray.map(transformTask);
      
      return NextResponse.json({ tasks: transformedTasks });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read tasks' }, { status: 500 });
  }
}

// Map frontend status to backend status
// STANDARD: Use dash format (todo, in-progress, done) everywhere
// So backend stores with dash too, no more underscore
function mapToBackendStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'todo': 'todo',
    'in-progress': 'in-progress',
    'done': 'done',
  };
  return statusMap[status] || status;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, taskId, status, result, ...taskData } = body;
    
    const tasks = loadTasks();
    
    if (action === 'create') {
      const newTaskId = generateTaskId();
      const newTask = {
        id: newTaskId,
        name: taskData.title || taskData.name || 'Untitled Task',
        description: taskData.description || '',
        status: mapToBackendStatus(taskData.status || 'todo'),
        assigned_agent: taskData.assignedAgent || taskData.assigned_agent || null,
        priority: taskData.priority || 'medium',
        created_at: new Date().toISOString(),
        startedAt: null,
        completedAt: null,
        result: null,
        labels: taskData.labels || [],
      };
      
      tasks[newTaskId] = newTask;
      saveTasks(tasks);
      
      return NextResponse.json({ 
        success: true, 
        task: transformTask(newTask),
        message: 'Task created successfully'
      });
    }
    
    if (action === 'updateStatus') {
      const taskKey = Object.keys(tasks).find(
        key => tasks[key].id === taskId
      );
      
      if (!taskKey) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      
      const backendStatus = mapToBackendStatus(status);
      tasks[taskKey].status = backendStatus;
      if (result) {
        tasks[taskKey].result = result;
      }
      
      if (backendStatus === 'in_progress' && !tasks[taskKey].startedAt) {
        tasks[taskKey].startedAt = new Date().toISOString();
      }
      if (backendStatus === 'completed') {
        tasks[taskKey].completedAt = new Date().toISOString();
      }
      
      saveTasks(tasks);
      return NextResponse.json({ success: true, task: transformTask(tasks[taskKey]) });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }
    
    const tasks = loadTasks();
    
    // Find task by ID
    const taskKey = Object.keys(tasks).find(
      key => tasks[key].id === id
    );
    
    if (!taskKey) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    // Apply updates
    if (updates.title) tasks[taskKey].name = updates.title;
    if (updates.description !== undefined) tasks[taskKey].description = updates.description;
    if (updates.priority) tasks[taskKey].priority = updates.priority;
    if (updates.assignedAgent) tasks[taskKey].assigned_agent = updates.assignedAgent;
    if (updates.labels) tasks[taskKey].labels = updates.labels;
    
    saveTasks(tasks);
    
    return NextResponse.json({ 
      success: true, 
      task: transformTask(tasks[taskKey]),
      message: 'Task updated successfully'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }
    
    const tasks = loadTasks();
    
    // Find task by ID (be extra flexible with ID matching)
    const taskKey = Object.keys(tasks).find(
      key => tasks[key].id === id || key === id
    );
    
    if (!taskKey) {
      console.log('Task not found for deletion:', id);
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    // Delete task
    delete tasks[taskKey];
    saveTasks(tasks);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete API Error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
