// Servicio de usuarios: SOLO lógica y acceso a datos (no sabe nada de req/res).
import bcrypt from 'bcryptjs';
import { db } from '../lib/db.js';
import { AppError } from '../utils/AppError.js';
import { buildUpdate } from '../utils/updateBuilder.js';

// Convierte una fila de SQLite (snake_case, 0/1) al formato de la API (camelCase, true/false)
export const toPublicUser = (row) =>
  row && {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    isActive: row.is_active === 1,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
  };

const SELECT_USER = `
  SELECT u.id, u.name, u.email, u.password_hash, u.is_active, u.last_login_at, u.created_at,
         r.name AS role
  FROM users u
  JOIN roles r ON r.id = u.role_id
`;

export const findByEmail = (email) =>
  db.prepare(`${SELECT_USER} WHERE u.email = ?`).get(email);

export const findById = (id) =>
  db.prepare(`${SELECT_USER} WHERE u.id = ?`).get(id);

export const listUsers = () =>
  db.prepare(`${SELECT_USER} ORDER BY u.id`).all().map(toPublicUser);

export const listRoles = () => db.prepare('SELECT id, name, description FROM roles ORDER BY id').all();

export const touchLastLogin = (id) =>
  db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(id);

export function getUser(id) {
  const row = findById(id);
  if (!row) throw new AppError(404, 'Usuario no encontrado');
  return toPublicUser(row);
}

const roleId = (name) => db.prepare('SELECT id FROM roles WHERE name = ?').get(name)?.id;
const activeAdmins = () =>
  db.prepare("SELECT COUNT(*) AS n FROM users u JOIN roles r ON r.id = u.role_id WHERE r.name = 'ADMIN' AND u.is_active = 1").get().n;

export async function createUser({ name, email, password, role, isActive = true }) {
  if (findByEmail(email)) throw new AppError(409, 'Ya existe un usuario con ese correo');
  const hash = await bcrypt.hash(password, 10);
  const id = db.prepare('INSERT INTO users (name, email, password_hash, role_id, is_active) VALUES (?, ?, ?, ?, ?)')
    .run(name, email, hash, roleId(role), isActive ? 1 : 0).lastInsertRowid;
  return getUser(Number(id));
}

export async function updateUser(id, data, currentUserId) {
  const user = getUser(id);
  if (data.email && data.email !== user.email && findByEmail(data.email)) throw new AppError(409, 'Ya existe un usuario con ese correo');

  // Reglas para no quedarse sin acceso al sistema
  const losesAdmin = user.role === 'ADMIN' && user.isActive && ((data.role && data.role !== 'ADMIN') || data.isActive === false);
  if (losesAdmin && activeAdmins() <= 1) throw new AppError(400, 'Debe quedar al menos un ADMIN activo');
  if (id === currentUserId && data.isActive === false) throw new AppError(400, 'No puedes desactivar tu propio usuario');

  const payload = { ...data };
  if (payload.role) payload.roleId = roleId(payload.role);
  if (payload.password) payload.passwordHash = await bcrypt.hash(payload.password, 10);
  const { sql, values, isEmpty } = buildUpdate(payload, {
    name: 'name', email: 'email', roleId: 'role_id', isActive: 'is_active', passwordHash: 'password_hash',
  });
  if (isEmpty) throw new AppError(400, 'No enviaste ningún campo para actualizar');
  db.prepare(`UPDATE users SET ${sql}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);
  return getUser(id);
}

export function removeUser(id, currentUserId) {
  const user = getUser(id);
  if (id === currentUserId) throw new AppError(400, 'No puedes eliminar tu propio usuario');
  if (user.role === 'ADMIN' && user.isActive && activeAdmins() <= 1) throw new AppError(400, 'Debe quedar al menos un ADMIN activo');
  db.prepare('DELETE FROM users WHERE id = ?').run(id); // sus páginas y medios quedan con autor NULL
}
