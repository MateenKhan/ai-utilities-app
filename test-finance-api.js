// Test Finance API endpoints
const testFinanceAPI = async () => {
    const baseURL = 'http://localhost:9005';
    
    console.log('🧪 Testing Finance API...\n');
    
    // First, login to get a session cookie
    console.log('1️⃣ Logging in...');
    const loginRes = await fetch(`${baseURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'test@test.com',
            password: 'test'
        })
    });
    
    if (!loginRes.ok) {
        console.error('❌ Login failed:', loginRes.status);
        return;
    }
    
    const cookies = loginRes.headers.get('set-cookie');
    console.log('✅ Login successful\n');
    
    // Test 1: Create a finance entry
    console.log('2️⃣ Creating finance entry...');
    const createRes = await fetch(`${baseURL}/api/finances`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': cookies || ''
        },
        body: JSON.stringify({
            name: 'Groceries',
            amount: 1500.50,
            description: 'Weekly grocery shopping',
            category: 'Food'
        })
    });
    
    if (createRes.ok) {
        const data = await createRes.json();
        console.log('✅ Finance entry created:', data.finance.id);
        console.log(`   Name: ${data.finance.name}, Amount: ₹${data.finance.amount}\n`);
    } else {
        console.error('❌ Create failed:', createRes.status, await createRes.text());
    }
    
    // Test 2: Fetch finances
    console.log('3️⃣ Fetching finances...');
    const fetchRes = await fetch(`${baseURL}/api/finances?page=1&limit=10`, {
        headers: { 'Cookie': cookies || '' }
    });
    
    if (fetchRes.ok) {
        const data = await fetchRes.json();
        console.log(`✅ Found ${data.finances.length} finance entries`);
        console.log(`   Total records: ${data.pagination.total}\n`);
        
        if (data.finances.length > 0) {
            console.log('📊 Finance Entries:');
            data.finances.forEach((f, i) => {
                console.log(`   ${i + 1}. ${f.name} - ₹${f.amount} (${f.category})`);
                console.log(`      Description: ${f.description || 'N/A'}`);
            });
        }
    } else {
        console.error('❌ Fetch failed:', fetchRes.status);
    }
    
    console.log('\n✅ API test completed!');
    console.log('\n🌐 Access the Finance page at: http://localhost:9005/finances');
};

testFinanceAPI();
