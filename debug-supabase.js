
const SB_URL = 'https://vjdlndntsmzoxggtruot.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZGxuZG50c216b3hnZ3RydW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNTU2MTQsImV4cCI6MjA3OTcxNTYxNH0.yMW0p9yFHLSeh9txZHxHzPcWA6jC1vvfTk-FsROBN7U';

async function testFetch() {
    console.log('--- TEST FETCH ---');
    try {
        const response = await fetch(`${SB_URL}/rest/v1/corretaje_properties?select=id`, {
            headers: { 
                'apikey': SB_KEY,
                'Authorization': `Bearer ${SB_KEY}`,
                'Prefer': 'count=exact'
            }
        });
        
        console.log('Status:', response.status);
        console.log('Headers:', JSON.stringify([...response.headers.entries()], null, 2));
        
        const data = await response.json();
        console.log('Body Length:', Array.isArray(data) ? data.length : 'Not an array');
        console.log('Body Sample:', JSON.stringify(data).substring(0, 200));
        
    } catch (e) {
        console.error('Error:', e.message);
    }
}

testFetch();
