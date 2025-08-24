import { createClient } from 'redis';

const client = createClient({
    url: process.env.REDIS_URL
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { script, password } = req.body;

    if (!script || !password) {
        return res.status(400).json({ error: 'Script and password required' });
    }

    const id = Math.random().toString(36).substr(2, 12);
    
    try {
        await client.connect();
        
        await client.set(`script:${id}`, JSON.stringify({
            script: script,
            password: password,
            created: Date.now()
        }));

        await client.disconnect();
        
        res.json({ success: true, id: id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save script' });
    }
}
