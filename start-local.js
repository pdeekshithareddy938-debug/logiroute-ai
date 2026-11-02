/**
 * LogiRoute AI - Persistent Local Startup Automation
 * Boots backend (Express/Prisma) on port 5000 and frontend (Vite) on port 5173 bound to 0.0.0.0
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const os = require('os');

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

const localIp = getLocalIp();
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

console.clear ? console.clear() : null;
console.log('================================================================');
console.log('  🚀 LogiRoute Fast Delivery Platform - Local Startup');
console.log('================================================================');
console.log(`  Local IP Detected: ${localIp}`);
console.log('  Starting backend on port 5000 (0.0.0.0)...');
console.log('  Starting frontend on port 5173 (0.0.0.0)...');
console.log('================================================================\n');

// Clean up any stale processes occupying ports 5000 and 5173
freePort(5000);
freePort(5173);

// 1. Spawn Backend Server
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

backendProcess.stderr.on('data', (data) => {
  const str = data.toString().trim();
  if (str) {
    str.split('\n').forEach(line => console.error(`\x1b[31m[BACKEND-ERR]\x1b[0m ${line}`));
  }
});

// 2. Spawn Frontend Vite Server
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

frontendProcess.stderr.on('data', (data) => {
  const str = data.toString().trim();
  if (str) {
    str.split('\n').forEach(line => console.error(`\x1b[33m[FRONTEND-LOG]\x1b[0m ${line}`));
  }
});

// Print clear access banner after 2.5 seconds
setTimeout(() => {
  console.log('\n================================================================');
  console.log('  🎉 LOGIROUTE AI PLATFORM IS LIVE & READY');
  console.log('================================================================');
  console.log('  💻 LOCAL ACCESS (This Laptop):');
  console.log('     • Portal Gateway: http://localhost:5173/login');
  console.log('     • Local Admin:    http://localhost:5173/admin/login');
  console.log('     • Local Rider:    http://localhost:5173/rider/login');
  console.log('     • Local Customer: http://localhost:5173/customer/login');
  console.log('');
  console.log('  📱 LOCAL NETWORK ACCESS (Any phone/tablet on same Wi-Fi):');
  console.log(`     • Gateway:        http://${localIp}:5173/login`);
  console.log(`     • Admin:          http://${localIp}:5173/admin/login`);
  console.log(`     • Rider:          http://${localIp}:5173/rider/login`);
  console.log(`     • Customer:       http://${localIp}:5173/customer/login`);
  console.log('================================================================\n');
}, 2500);

// Graceful exit handlers
function shutdown() {
  console.log('\n[LogiRoute] Shutting down servers gracefully...');
  try { backendProcess.kill(); } catch (e) {}
  try { frontendProcess.kill(); } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
