const assert = require('assert');
const { spawn } = require('child_process');
const http = require('http');
const querystring = require('querystring');
const path = require('path');

// Minimal, file-local test runner so this spec can be executed with `node tests/auth.spec.js`.
let __suites = [];
let __currentSuite = null;
let __autoRun = false;
if (typeof describe === 'undefined') {
    __autoRun = true;
    global.describe = function (name, fn) {
        const suite = { name, tests: [] };
        const prev = __currentSuite;
        __currentSuite = suite;
        try { fn(); } catch (e) { console.error('Error in describe:', e); }
        __currentSuite = prev;
        __suites.push(suite);
    };

    global.it = function (name, fn) {
        if (!__currentSuite) throw new Error('it() must be called inside describe()');
        __currentSuite.tests.push({ name, fn });
    };
}

const CWD = path.join(__dirname, '..');
const SERVER_CMD = 'node';
const SERVER_ARGS = ['server.js'];
const HOST = '127.0.0.1';
const PORT = process.env.PORT || 3000;

function waitForServer(child, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Server did not start in time')), timeout);
        child.stdout.on('data', (d) => {
            const s = d.toString();
            if (s.toLowerCase().includes('server started')) {
                clearTimeout(timer);
                resolve();
            }
        });
        child.on('error', (err) => { clearTimeout(timer); reject(err); });
    });
}

function httpGet(pathname) {
    return new Promise((resolve, reject) => {
        const req = http.request({ hostname: HOST, port: PORT, path: pathname, method: 'GET' }, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (c) => (body += c));
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', reject);
        req.end();
    });
}

function httpPost(pathname, data) {
    return new Promise((resolve, reject) => {
        const postData = querystring.stringify(data || {});
        const req = http.request({ hostname: HOST, port: PORT, path: pathname, method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData) } }, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (c) => (body += c));
            res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

describe('Auth routes', () => {
    it('should serve GET /login', async () => {
        const res = await httpGet('/login');
        assert.strictEqual(res.status, 200);
        assert.ok(/Se connecter/.test(res.body) || /Connexion/.test(res.body));
    });

    it('should show invalid credentials on POST /login with wrong creds', async () => {
        const res = await httpPost('/login', { email: 'noone@example.com', password: 'bad' });
        assert.strictEqual(res.status, 200);
        assert.ok(/Email ou mot de passe invalide/.test(res.body) || /mot de passe invalide/.test(res.body));
    });

    it('should show valid credentials on POST /login', async () => {
        const res = await httpPost('/login', { email: 'a@a.fr', password: 'a' });
        assert.strictEqual(res.status, 302);
        assert.strictEqual(res.headers.location || res.headers.Location, '/');
    });
});

// If we injected the globals, run the suites now
if (__autoRun) {
    (async () => {
        let passed = 0, failed = 0;
        for (const s of __suites) {
            console.log('\n' + s.name);
            for (const t of s.tests) {
                try {
                    const res = t.fn();
                    if (res && typeof res.then === 'function') await res;
                    passed++;
                    console.log('  ✓', t.name);
                } catch (err) {
                    failed++;
                    console.log('  ✗', t.name);
                    console.error('    ', err && err.stack ? err.stack.split('\n').slice(0, 3).join('\n    ') : err);
                }
            }
        }
        console.log(`\nTests complete: ${passed} passed, ${failed} failed`);
        process.exit(failed > 0 ? 1 : 0);
    })();
}
