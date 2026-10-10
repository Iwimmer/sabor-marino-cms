// Utilidades compartidas por las pruebas: BD temporal + servidor en un puerto libre.
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

export async function startTestServer() {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const tmpDb = path.join(os.tmpdir(), `sm-test-${id}.db`);
  const tmpUploads = fs.mkdtempSync(path.join(os.tmpdir(), 'sm-uploads-'));
  process.env.DATABASE_PATH = tmpDb;
  process.env.UPLOADS_DIR = tmpUploads;
  process.env.JWT_SECRET ??= 'clave-solo-para-pruebas';
  process.env.NODE_ENV = 'test';

  execFileSync(process.execPath, ['--disable-warning=ExperimentalWarning', 'database/setup.js'], { env: process.env, stdio: 'ignore' });

  const { default: app } = await import('../src/app.js');
  const server = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
  const base = `http://localhost:${server.address().port}/api`;

  const close = () => {
    server.close();
    for (const s of ['', '-wal', '-shm']) fs.rmSync(tmpDb + s, { force: true });
    fs.rmSync(tmpUploads, { recursive: true, force: true });
  };

  async function login(email, password) {
    const res = await fetch(`${base}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
    });
    return { res, cookie: res.headers.get('set-cookie')?.split(';')[0] };
  }

  /** Cliente con sesión: api('GET', '/pages') -> { status, body } */
  function client(cookie) {
    return async (method, url, body, extraHeaders = {}) => {
      const isForm = body instanceof FormData;
      const res = await fetch(`${base}${url}`, {
        method,
        headers: { ...(cookie && { cookie }), ...(!isForm && body !== undefined && { 'Content-Type': 'application/json' }), ...extraHeaders },
        body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      });
      const text = await res.text();
      return { status: res.status, body: text ? JSON.parse(text) : null, headers: res.headers };
    };
  }

  return { base, close, login, client, uploadsDir: tmpUploads, origin: base.replace(/\/api$/, '') };
}
