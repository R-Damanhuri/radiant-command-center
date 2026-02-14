// Test frontend API calls
const testAPI = async () => {
  console.log('Testing Frontend API Calls...\n');
  
  // Test 1: GET all tasks
  console.log('1. Testing GET /api/tasks...');
  try {
    const response = await fetch('/api/tasks');
    const data = await response.json();
    console.log(`✅ GET successful: ${data.tasks.length} tasks`);
    console.log(`   Sample task: ${data.tasks[0]?.title}`);
  } catch (error) {
    console.error(`❌ GET failed: ${error.message}`);
  }
  
  console.log('');
  
  // Test 2: POST create task
  console.log('2. Testing POST /api/tasks (create)...');
  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        title: 'Test from frontend',
        description: 'Testing frontend API call',
        assignedAgent: 'radiant',
        priority: 'medium',
        labels: ['test']
      })
    });
    const data = await response.json();
    console.log(`✅ POST create successful: ${data.success ? 'YES' : 'NO'}`);
    console.log(`   New task ID: ${data.task?.id}`);
  } catch (error) {
    console.error(`❌ POST create failed: ${error.message}`);
  }
  
  console.log('');
  
  // Test 3: POST update status
  console.log('3. Testing POST /api/tasks (updateStatus)...');
  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateStatus',
        taskId: 'task-001',
        status: 'completed',
        result: 'Test completed'
      })
    });
    const data = await response.json();
    console.log(`✅ POST update status successful: ${data.success ? 'YES' : 'NO'}`);
  } catch (error) {
    console.error(`❌ POST update status failed: ${error.message}`);
  }
  
  console.log('');
  
  console.log('All API tests completed.');
};

// Run test
testAPI();