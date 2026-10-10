// Servicio de medios: procesa imágenes con sharp y las registra en la BD.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { db, transaction } from '../lib/db.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { slugify } from '../utils/slugify.js';

// Tamaños responsive: celular, tablet/laptop y pantallas grandes
export const SIZES = { sm: 480, md: 1024, lg: 1920 };
const ALLOWED_FORMATS = ['jpeg', 'png', 'webp', 'avif', 'gif'];

// ---------- Formato de salida ----------
function toPublic(row, variants) {
  const byKey = Object.fromEntries(variants.map((v) => [v.size, v]));
  return {
    id: row.id,
    originalName: row.original_name,
    alt: row.alt_text ?? '',
    createdAt: row.created_at,
    // url principal (md) + todas las variantes para usar en <img srcset>
    url: (byKey.md ?? byKey.lg ?? byKey.sm)?.path ?? null,
    variants: variants.map((v) => ({ size: v.size, width: v.width, height: v.height, url: v.path, bytes: v.size_bytes })),
  };
}

const variantsOf = (mediaIds) => {
  if (mediaIds.length === 0) return [];
  const marks = mediaIds.map(() => '?').join(',');
  return db.prepare(`SELECT * FROM media_variants WHERE media_id IN (${marks}) ORDER BY width`).all(...mediaIds);
};

// ---------- Lecturas ----------
export function list() {
  const rows = db.prepare('SELECT * FROM media ORDER BY id DESC').all();
  const variants = variantsOf(rows.map((r) => r.id));
  return rows.map((r) => toPublic(r, variants.filter((v) => v.media_id === r.id)));
}

export function getById(id) {
  const row = db.prepare('SELECT * FROM media WHERE id = ?').get(id);
  if (!row) throw new AppError(404, 'Imagen no encontrada');
  return toPublic(row, variantsOf([id]));
}

/** Devuelve un Map id -> imagen para resolver muchas referencias de una vez (ignora ids inexistentes). */
export function resolveMany(ids) {
  const unique = [...new Set(ids.filter((n) => Number.isInteger(n)))];
  if (unique.length === 0) return new Map();
  const marks = unique.map(() => '?').join(',');
  const rows = db.prepare(`SELECT * FROM media WHERE id IN (${marks})`).all(...unique);
  const variants = variantsOf(rows.map((r) => r.id));
  return new Map(rows.map((r) => [r.id, toPublic(r, variants.filter((v) => v.media_id === r.id))]));
}

// ---------- Escrituras ----------
/**
 * Procesa una imagen subida: corrige la orientación, la redimensiona a 3 anchos
 * y la convierte a WebP (pesa mucho menos que JPG/PNG con la misma calidad).
 */
export async function create(file, { alt, userId }) {
  if (!file) throw new AppError(400, 'Debes enviar una imagen en el campo "file"');

  let meta;
  try {
    meta = await sharp(file.buffer).metadata();
  } catch {
    throw new AppError(400, 'El archivo no es una imagen válida');
  }
  if (!ALLOWED_FORMATS.includes(meta.format)) {
    throw new AppError(400, `Formato no permitido (${meta.format}). Usa JPG, PNG, WebP, AVIF o GIF`);
  }

  await fs.mkdir(env.uploadsDir, { recursive: true });
  const base = `${Date.now()}-${slugify(path.parse(file.originalname).name) || 'imagen'}`;
  const written = [];

  try {
    for (const [size, width] of Object.entries(SIZES)) {
      // Si la imagen original es más chica que este tamaño, la versión saldría idéntica a la anterior: se omite
      if (written.length && written.at(-1).width >= Math.min(width, meta.width)) continue;
      const fileName = `${base}-${size}.webp`;
      const info = await sharp(file.buffer)
        .rotate() // respeta la orientación EXIF de fotos de celular
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(env.uploadsDir, fileName));
      // ojo: info.size es el peso en bytes; el nombre del tamaño va en "key"
      written.push({ key: size, fileName, width: info.width, height: info.height, bytes: info.size });
    }
  } catch (err) {
    await Promise.all(written.map((w) => fs.rm(path.join(env.uploadsDir, w.fileName), { force: true })));
    throw err;
  }

  const id = transaction(() => {
    const mediaId = db
      .prepare('INSERT INTO media (original_name, alt_text, uploaded_by_id) VALUES (?, ?, ?)')
      .run(file.originalname, alt ?? null, userId ?? null).lastInsertRowid;
    const insert = db.prepare(
      'INSERT INTO media_variants (media_id, size, width, height, path, size_bytes) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const w of written) insert.run(mediaId, w.key, w.width, w.height, `/uploads/${w.fileName}`, w.bytes);
    return Number(mediaId);
  });

  return { ...getById(id), originalBytes: file.size };
}

export function updateAlt(id, alt) {
  const r = db.prepare('UPDATE media SET alt_text = ? WHERE id = ?').run(alt, id);
  if (r.changes === 0) throw new AppError(404, 'Imagen no encontrada');
  return getById(id);
}

export async function remove(id) {
  const variants = variantsOf([id]);
  const r = db.prepare('DELETE FROM media WHERE id = ?').run(id); // variantes se borran en cascada
  if (r.changes === 0) throw new AppError(404, 'Imagen no encontrada');
  await Promise.all(
    variants.map((v) => fs.rm(path.join(env.uploadsDir, path.basename(v.path)), { force: true }))
  );
}
