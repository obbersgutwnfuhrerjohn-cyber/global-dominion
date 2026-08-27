const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.SMOKE_PORT || 3010);
const dataDir = path.join(__dirname, '..', '.smoke-data');
fs.rmSync(dataDir, { recursive: true, force: true });
fs.mkdirSync(dataDir, { recursive: true });

function request(method, pathname, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body == null ? null : JSON.stringify(body);
    const req = http.request({
      hostname: '127.0.0.1', port, path: pathname, method,
      headers: {
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        let json;
        try { json = JSON.parse(raw); } catch { return reject(new Error(`Invalid JSON from ${pathname}: ${raw}`)); }
        resolve({ status: res.statusCode, json });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  const server = spawn(process.execPath, [path.join(__dirname, '..', 'src', 'index.js')], {
    env: { ...process.env, PORT: String(port), DATA_DIR: dataDir },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  server.stdout.on('data', (d) => { output += d; });
  server.stderr.on('data', (d) => { output += d; });
  try {
    for (let i = 0; i < 30; i++) {
      try { const h = await request('GET', '/health'); if (h.status === 200 && h.json.success) break; } catch {}
      await new Promise(r => setTimeout(r, 100));
      if (i === 29) throw new Error(`Server did not become ready. ${output}`);
    }

    const health = await request('GET', '/health');
    if (health.status !== 200 || !health.json.success) throw new Error('Health check failed');

    const register = await request('POST', '/api/auth/register', {
      email: 'smoke@example.com', password: 'TestPass123!', displayName: 'Smoke Player', username: 'smokeplayer', countryId: 'country_gnr',
    });
    if (register.status !== 201 || !register.json.success) throw new Error(`Registration failed: ${JSON.stringify(register.json)}`);
    const token = register.json.data.session.accessToken;

    const me = await request('GET', '/api/auth/me', null, token);
    if (me.status !== 200 || !me.json.success || me.json.data.email !== 'smoke@example.com') throw new Error('Authenticated /me check failed');

    const world = await request('GET', '/api/world/state');
    if (world.status !== 200 || !world.json.success || !world.json.data) throw new Error('World state check failed');

    const map = await request('GET', '/api/map/countries');
    if (map.status !== 200 || !map.json.success || map.json.data.type !== 'FeatureCollection') throw new Error('Map check failed');

    const login = await request('POST', '/api/auth/login', { email: 'smoke@example.com', password: 'TestPass123!' });
    if (login.status !== 200 || !login.json.success || !login.json.data.session.accessToken) throw new Error('Login check failed');

    console.log('SMOKE TEST PASSED');
    console.log('health: OK');
    console.log('register: OK');
    console.log('auth/me: OK');
    console.log('world/state: OK');
    console.log('map/countries: OK');
    console.log('login: OK');
  } finally {
    server.kill('SIGTERM');
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
})().catch((err) => { console.error(`SMOKE TEST FAILED: ${err.message}`); process.exitCode = 1; });
