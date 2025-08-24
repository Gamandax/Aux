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
        
        // Complete list of ALL executors and game clients
        const executorPatterns = [
            // Popular Executors
            'synapse', 'krnl', 'fluxus', 'delta', 'script-ware', 'scriptware',
            'oxygen', 'sentinel', 'sirhurt', 'protosmasher', 'exploitx',
            'jjsploit', 'wrd api', 'electron', 'calamari', 'proxo',
            'nihon', 'shadow', 'dansploit', 'sk8r', 'ro-exec',
            'coco z', 'topk3k', 'lumber tycoon', 'ice bear', 'furk ultra',
            'mystik', 'aspire', 'heaven', 'trigon', 'vega x', 'vegax',
            'hydrogen', 'evon', 'zorara', 'celery', 'comet',
            'krampus', 'serpent', 'novaline', 'temple', 'nezur',
            'runservice', 'unnamed', 'wave', 'arceus x', 'arceuszx',
            
            // Mobile Executors
            'codex', 'fluxus android', 'delta android', 'scriptware mobile',
            'hydrogen mobile', 'arceus x neo', 'delta x', 'kitten milk',
            
            // Roblox Related
            'roblox', 'rbx', 'rbxl', 'studio', 'player',
            
            // Generic Terms
            'executor', 'exploit', 'injector', 'script', 'cheat', 'hack',
            'lua', 'loadstring', 'game', 'workspace', 'httprequest',
            
            // HTTP Libraries used by executors
            'httprequest', 'http_request', 'syn request', 'request',
            'httpservice', 'http-request', 'syn.request'
        ];
        
        // Check if it's an executor/game client
        const isExecutor = executorPatterns.some(pattern => 
            userAgent.toLowerCase().includes(pattern.toLowerCase())
        );
        
        // Additional check: if no common browser patterns
        const browserPatterns = ['mozilla', 'chrome', 'safari', 'firefox', 'edge', 'opera'];
        const hasBrowserPattern = browserPatterns.some(pattern => 
            userAgent.toLowerCase().includes(pattern.toLowerCase())
        );
        
        // If it has executor patterns OR doesn't look like a browser, treat as executor
        const isBrowser = hasBrowserPattern && !isExecutor;
        
        if (isBrowser) {
            // Show password form for browsers
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
            max-width: 500px;
            width: 90%;
        }
        input { 
            background: #0f0f0f; 
            border: 1px solid #333; 
            color: #fff; 
            padding: 10px; 
            border-radius: 4px; 
            margin: 10px 0; 
            width: 100%;
            box-sizing: border-box;
        }
        button { 
            background: #00ff88; 
            border: none; 
            color: #000; 
            padding: 10px 20px; 
            border-radius: 4px; 
            cursor: pointer; 
            width: 100%;
            font-weight: bold;
        }
        .script-content { 
            background: #0f0f0f; 
            padding: 1rem; 
            border-radius: 4px; 
            margin-top: 1rem; 
            white-space: pre-wrap; 
            font-family: monospace; 
            display: none; 
            max-height: 300px;
            overflow-y: auto;
            font-size: 12px;
        }
        button:hover { background: #00cc6a; }
        .warning { 
            background: #2a1f1f; 
            border: 1px solid #ff6b6b; 
            padding: 10px; 
            border-radius: 4px; 
            margin-bottom: 20px; 
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="form">
        <h2>🔐 Aux Hub - Protected Script</h2>
        
        <div class="warning">
            <strong>⚠️ Browser Access Detected</strong><br>
            This script is password protected when accessed via web browser.
        </div>
        
        <p>Enter password to view script:</p>
        <input type="password" id="passwordInput" placeholder="Enter password..." autocomplete="off">
        <br>
        <button onclick="checkPassword()">🔓 Unlock Script</button>
        <div class="script-content" id="scriptContent">${scriptData.script.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #666;">
            <p>💡 <strong>For Roblox Users:</strong> Use loadstring in your executor</p>
            <p> Protected by Aux Hub </p>
            <p>🔧 Script ID: ${id}</p>
        </div>
    </div>
    
    <script>
        function checkPassword() {
            const input = document.getElementById('passwordInput').value;
            const correctPassword = '${scriptData.password}';
            
            if (input === correctPassword) {
                document.getElementById('scriptContent').style.display = 'block';
                document.querySelector('button').innerHTML = '✅ Script Unlocked!';
                document.querySelector('button').style.background = '#00ff88';
                document.getElementById('passwordInput').style.display = 'none';
            } else {
                alert('❌ Incorrect password! Please try again.');
                input.value = '';
                input.focus();
            }
        }
        
        document.getElementById('passwordInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
        
        // Auto-focus password input
        document.getElementById('passwordInput').focus();
    </script>
</body>
</html>`;
            
            res.setHeader('Content-Type', 'text/html');
            res.send(passwordForm);
            
        } else {
            // Direct script return for ALL executors and game clients
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.status(200).send(scriptData.script);
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
}
