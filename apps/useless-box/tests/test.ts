const BASE = 'http://localhost:3000';

async function test() {
  console.log('\n=== TEST 1: GET /state ==='); 

  let state = await fetch(`${BASE}/state`).then(r => r.json()).catch(e => e);
  console.log('State:', state);

  console.log('\n=== TEST 2: POST /toggle ==='); 
  
  let toggled = await fetch(`${BASE}/toggle`, {
    method: 'POST',
  }).then(r => r.json()).catch(e => e);

  console.log('Toggled:', toggled);

  console.log('\n=== TEST 3: GET /state ==='); 
  
  let state2 = await fetch(`${BASE}/state`).then(r => r.json()).catch(e => e);
  console.log('State after toggle:', state2);

  console.log('\n=== DONE ===\n');
}

test();
