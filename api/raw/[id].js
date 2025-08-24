import { createClient } from 'redis';

const client = createClient({
    url: process.env.REDIS_URL
});

export default async function handler(req, res) {
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).send('Missing script ID');
    }

    try {
        await client.connect();
        const scriptDataString = await client.get(`script:${id}`);
        await client.disconnect();
        
        if (!scriptDataString) {
            return res.status(404).send('Script not found');
        }

        const scriptData = JSON.parse(scriptDataString);

        const userAgent = req.headers['user-agent'] || '';
        const isBrowser = /mozilla|chrome|safari|firefox|edge/i.test(userAgent);
        
        if (isBrowser) {
            const passwordForm = `
<!DOCTYPE html>
<html>
<head>
    <title>Protected Script</title>
    <style>
        body { 
            background: #0a0a0a; 
            color: #fff; 
            font-family: Arial, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
        }
        .form { 
            background: #1a1a1a; 
            padding: 2rem; 
            border-radius: 8px; 
            border: 1px solid #333; 
        }
        input { 
            background: #0f0f0f; 
            border: 1px solid #333; 
            color: #fff; 
            padding: 10px; 
            border-radius: 4px; 
            margin: 10px 0; 
            width: 200px; 
        }
        button { 
            background: #00ff88; 
            border: none; 
            color: #000; 
            padding: 10px 20px; 
            border-radius: 4px; 
            cursor: pointer; 
        }
        .script-content { 
            background: #0f0f0f; 
            padding: 1rem; 
            border-radius: 4px; 
            margin-top: 1rem; 
            white-space: pre-wrap; 
            font-family: monospace; 
            display: none; 
        }
    </style>
</head>
<body>
    <div class="form">
        <h2>Aux Hub</h2>
        <p>Enter password to view:</p>
        <input type="password" id="passwordInput" placeholder="Password">
        <br>
        <button onclick="checkPassword()">Unlock</button>
        <div class="script-content" id="scriptContent">${scriptData.script}</div>
    </div>
    
    <script>
        function checkPassword() {
            const input = document.getElementById('passwordInput').value;
            const correctPassword = '${scriptData.password}';
            
            if (input === correctPassword) {
                document.getElementById('scriptContent').style.display = 'block';
            } else {
                alert('Wrong password!');
            }
        }
    </script>
</body>
</html>`;
            
            res.setHeader('Content-Type', 'text/html');
            res.send(passwordForm);
            
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.send(scriptData.script);
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
}
