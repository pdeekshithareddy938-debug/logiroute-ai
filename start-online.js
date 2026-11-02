/**
 * LogiRoute AI - Persistent Online Startup Automation with Public Tunnel
 * Boots backend (5000), frontend (5173), and establishes a public HTTPS tunnel.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const os = require('os');
const https = require('https');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

function freePort(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`).toString();
      const lines = output.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid) && pid !== '0' && pid != process.pid) {
          try { execSync(`taskkill /F /PID ${pid} 2>nul`); } catch (e) {}
        }
      }
    } else {
      execSync(`lsof -ti :${port} | xargs kill -9 2>/dev/null || true`);
    }
  } catch (err) {}
}

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

function fetchPublicIp() {
  return new Promise((resolve) => {
    https.get('https://api.ipify.org', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data.trim()));
    }).on('error', () => {
      https.get('https://loca.lt/mytunnelpassword', (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => resolve(data2.trim()));
      }).on('error', () => resolve('Run curl https://loca.lt/mytunnelpassword'));
    });
  });
}

const localIp = getLocalIp();
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

console.clear ? console.clear() : null;
console.log('================================================================');
console.log('  🌐 LogiRoute Fast Delivery Platform - Public Online Startup');
console.log('================================================================');
console.log(`  Local IP Detected: ${localIp}`);
console.log('  1/3. Starting Backend on 0.0.0.0:5000...');
console.log('  2/3. Starting Frontend on 0.0.0.0:5173...');
console.log('  3/3. Launching HTTPS Public Tunnel on Port 5173...');
console.log('================================================================\n');

// Free ports 5000 and 5173 from any stale processes
freePort(5000);
freePort(5173);

// 1. Backend Server
const backendProcess = spawn('node', ['server.js'], {
  cwd: backendDir,
  env: { ...process.env, PORT: '5000', HOST: '0.0.0.0' },
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: isWindows
});

backendProcess.stdout.on('data', (data) => {
  const str = data.toString().trim();
  if (str) {
    str.split('\n').forEach(line => console.log(`\x1b[36m[BACKEND]\x1b[0m ${line}`));
  }
});

// 2. Frontend Server
const frontendProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: frontendDir,
  env: { ...process.env },
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: isWindows
});

frontendProcess.stdout.on('data', (data) => {
  const str = data.toString().trim();
  if (str) {
    str.split('\n').forEach(line => console.log(`\x1b[32m[FRONTEND]\x1b[0m ${line}`));
  }
});

// 3. Public Tunnel (localtunnel)
let tunnelUrl = '';
let tunnelPassword = '';

fetchPublicIp().then(ip => {
  tunnelPassword = ip;
});

// Try preferred subdomain first; falls back if unavailable
const tunnelProcess = spawn(npxCmd, ['localtunnel', '--port', '5173', '--subdomain', 'logiroute-preview'], {
  cwd: rootDir,
  env: { ...process.env },
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: isWindows
});

function displayBanner() {
  console.log('\n================================================================');
  console.log('  🎉 LOGIROUTE AI PLATFORM IS PUBLICLY ACCESSIBLE ONLINE');
  console.log('================================================================');
  console.log('  💻 LOCAL ACCESS (This Machine):');
  console.log('     • Local Admin:    http://localhost:5173/admin/login');
  console.log('     • Local Rider:    http://localhost:5173/rider/login');
  console.log('     • Local Customer: http://localhost:5173/customer/login');
  console.log('');
  console.log('  📱 LOCAL NETWORK (Wi-Fi Devices):');
  console.log(`     • Network Access: http://${localIp}:5173/login`);
  console.log('');
  console.log('  🌍 PUBLIC SHAREABLE HTTPS URL (Worldwide on any browser/phone):');
  console.log(`     • Public Gateway: ${tunnelUrl || 'Establishing tunnel...'}`);
  console.log(`     • Public Admin:   ${tunnelUrl ? `${tunnelUrl}/admin/login` : '...'}`);
  console.log(`     • Public Rider:   ${tunnelUrl ? `${tunnelUrl}/rider/login` : '...'}`);
  console.log(`     • Public Customer:${tunnelUrl ? `${tunnelUrl}/customer/login` : '...'}`);
  if (tunnelPassword) {
    console.log('');
    console.log(`  🔑 Localtunnel Password (if prompted by loca.lt security):`);
    console.log(`     ${tunnelPassword}`);
  }
  console.log('================================================================\n');
}

tunnelProcess.stdout.on('data', (data) => {
  const str = data.toString();
  const match = str.match(/your url is: (https?:\/\/[^\s]+)/i);
  if (match) {
    tunnelUrl = match[1];
    displayBanner();
  } else {
    const trimmed = str.trim();
    if (trimmed) {
      trimmed.split('\n').forEach(line => console.log(`\x1b[35m[TUNNEL]\x1b[0m ${line}`));
    }
  }
});

tunnelProcess.stderr.on('data', (data) => {
  const str = data.toString().trim();
  if (str) {
    str.split('\n').forEach(line => console.log(`\x1b[33m[TUNNEL-INFO]\x1b[0m ${line}`));
  }
});

// Fallback banner trigger in case tunnel output format varies
setTimeout(() => {
  if (!tunnelUrl) {
    tunnelUrl = 'https://logiroute-preview.loca.lt';
    displayBanner();
  }
}, 5000);

// Graceful exit handlers
function shutdown() {
  console.log('\n[LogiRoute] Shutting down all services and closing tunnel...');
  try { backendProcess.kill(); } catch (e) {}
  try { frontendProcess.kill(); } catch (e) {}
  try { tunnelProcess.kill(); } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
