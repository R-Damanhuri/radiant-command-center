// Debug API responses
const testAPICalls = async () => {
  console.log('=== Debugging API Calls ===\n');
  
  // Test 1: Create a task
  console.log('1. Testing POST create...');
  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        title: 'Debug Task',
        description: 'Testing API response',
        assignedAgent: 'radiant',
        priority: 'medium',
        labels: ['debug']
      })
    });
    
    console.log('   Status:', response.status, response.statusText);
    if (!response.ok) {
      const errorText = await response.text();
      console.log('   Error:', errorText);
    } else {
      const data = await response.json();
      console.log('   Success:', data.success);
      console.log('   Message:', data.message);
    }
  } catch (error) {
    console.error('   Fetch error:', error);
  }
  
  console.log('');
  
  // Test 2: Update status
  console.log('2. Testing POST updateStatus...');
  try {
    const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStatus',
          taskId: 'task-001',
          status: 'in-progress',
          result: 'Testing API update'
        }),
    });
    
    console.log('   Status:', response.status, response.statusText);
    if (!response.ok) {
      const errorText = await response.text();
      console.log('   Error:', errorText);
    } else {
      const data = await response.json();
      console.log('   Success:', data.success);
    }
  } catch (error) {
    console.error('   Fetch error:', error);
  }
  
  console.log('');
  
  // Test 3: Delete task
  console.log('3. Testing DELETE...');
  try {
    const response = await fetch('/api/tasks?id=task-001', {
        method: 'DELETE'
    });
    
    console.log('   Status:', response.status, response.statusText);
    if (!response.ok) {
      const errorText = await response.text();
      console.log('   Error:', errorText);
    } else {
      const data = await response.json();
      console.log('   Success:', data.success);
      console.log('   Message:', data.message);
    }
  } catch (error) {
    console.error('   Fetch error:', error);
  }
  
  console.log('\n=== Debug Complete ===');
};

// Run test
testAPICalls();