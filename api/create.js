const scripts = new Map();

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { script, password } = req.body;

    if (!script || !password) {
        return res.status(400).json({ error: 'Script and password required' });
    }

    const id = Math.random().toString(36).substr(2, 12);
    
    scripts.set(id, {
        script: script,
        password: password,
        created: Date.now()
    });

    res.json({ success: true, id: id });
}

export { scripts };
