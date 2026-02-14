const { execSync } = require('child_process');

try {
  console.log('Testing openclaw agents list --json output...\n');
  
  // Run command
  const output = execSync('openclaw agents list --json 2>&1', {
    encoding: 'utf-8',
    timeout: 10000,
  });
  
  console.log('Raw output (first 500 chars):');
  console.log('='.repeat(50));
  console.log(output.substring(0, 500));
  console.log('='.repeat(50));
  
  // Find JSON array
  const lines = output.split('\n');
  console.log('\nTotal lines:', lines.length);
  
  // Look for JSON array
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('[')) {
      console.log(`\nFound JSON array at line ${i}:`);
      console.log('Line content:', line.substring(0, 100));
      
      // Try to parse from this line
      const jsonString = lines.slice(i).join('\n');
      const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        console.log('\nJSON match found, length:', jsonMatch[0].length);
        console.log('First 200 chars of JSON:', jsonMatch[0].substring(0, 200));
        
        try {
          const agents = JSON.parse(jsonMatch[0]);
          console.log('\n✅ Successfully parsed JSON!');
          console.log('Number of agents:', agents.length);
          console.log('Agent IDs:', agents.map(a => a.id || a.agentId || a.name));
        } catch (parseError) {
          console.error('\n❌ JSON parse error:', parseError.message);
        }
      } else {
        console.log('\n❌ No JSON array match found');
      }
      break;
    }
  }
  
} catch (error) {
  console.error('Error:', error.message);
}