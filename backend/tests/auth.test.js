// Pruebas automáticas de autenticación y roles.  Ejecutar con: npm test
// Usan una base de datos temporal, así que NO tocan tus datos reales.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers.js';

let t;
before(async () => { t = await startTestServer(); });
after(() => t.close());

test('GET /health responde 200', async () => {
  const res = await fetch(`${t.base}/health`);
  assert.equal(res.status, 200);
});

test('Login con datos mal formados responde 400 con detalle por campo', async () => {
  const { res } = await t.login('no-es-correo', '');
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.details.length, 2);
});

test('Login con clave incorrecta responde 401', async () => {
  const { res } = await t.login('admin@sabormarino.pe', 'incorrecta');
  assert.equal(res.status, 401);
});

test('Login correcto guarda el JWT en una cookie httpOnly y NO lo devuelve en el JSON', async () => {
  const { res } = await t.login('admin@sabormarino.pe', 'Admin123*');
  assert.equal(res.status, 200);
  const setCookie = res.headers.get('set-cookie');
  assert.match(setCookie, /sm_token=/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Lax/i);
  const body = await res.json();
  assert.equal(body.data.user.role, 'ADMIN');
  assert.equal(body.data.token, undefined);
  assert.equal(body.data.user.password_hash, undefined);
});

test('/auth/me sin cookie responde 401', async () => {
  const res = await fetch(`${t.base}/auth/me`);
  assert.equal(res.status, 401);
});

test('/auth/me con cookie válida devuelve el usuario', async () => {
  const { cookie } = await t.login('admin@sabormarino.pe', 'Admin123*');
  const { status, body } = await t.client(cookie)('GET', '/auth/me');
  assert.equal(status, 200);
  assert.equal(body.data.user.email, 'admin@sabormarino.pe');
});

test('Token alterado responde 401', async () => {
  const res = await fetch(`${t.base}/auth/me`, { headers: { cookie: 'sm_token=abc.def.ghi' } });
  assert.equal(res.status, 401);
});

test('ADMIN puede listar usuarios (200)', async () => {
  const { cookie } = await t.login('admin@sabormarino.pe', 'Admin123*');
  const { status, body } = await t.client(cookie)('GET', '/users');
  assert.equal(status, 200);
  assert.equal(body.data.length, 2);
});

test('EDITOR NO puede listar usuarios (403)', async () => {
  const { cookie } = await t.login('editor@sabormarino.pe', 'Editor123*');
  const { status } = await t.client(cookie)('GET', '/users');
  assert.equal(status, 403);
});

test('Logout borra la cookie', async () => {
  const res = await fetch(`${t.base}/auth/logout`, { method: 'POST' });
  assert.equal(res.status, 200);
  assert.match(res.headers.get('set-cookie'), /sm_token=;/);
});
