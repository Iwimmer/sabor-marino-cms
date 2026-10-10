// Conexión única a SQLite usando el módulo nativo de Node.js (node:sqlite).
// No requiere instalar ni compilar nada extra: viene con Node 22.13+.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';

fs.mkdirSync(path.dirname(env.databasePath), { recursive: true });

export const db = new DatabaseSync(env.databasePath);

// SQLite NO activa las llaves foráneas por defecto: hay que pedirlo en cada conexión.
db.exec('PRAGMA foreign_keys = ON;');
// WAL permite leer mientras se escribe (mejor rendimiento en la web).
db.exec('PRAGMA journal_mode = WAL;');

/**
 * Ejecuta varias operaciones como una sola transacción.
 * Si algo falla en el medio, se deshace todo (ROLLBACK).
 */
export function transaction(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
