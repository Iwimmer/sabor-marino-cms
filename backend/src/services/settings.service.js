// Configuración global del sitio (una sola fila con id = 1) y redes sociales.
import { db } from '../lib/db.js';
import { AppError } from '../utils/AppError.js';
import { buildUpdate } from '../utils/updateBuilder.js';
import * as mediaService from './media.service.js';

const COLUMNS = {
  siteName: 'site_name', slogan: 'slogan', logoId: 'logo_id',
  primaryColor: 'primary_color', secondaryColor: 'secondary_color', accentColor: 'accent_color',
  backgroundColor: 'background_color', textColor: 'text_color',
  phone: 'phone', whatsapp: 'whatsapp', email: 'email', address: 'address',
  mapEmbedUrl: 'map_embed_url', footerText: 'footer_text',
};

function toPublic(row) {
  const logo = row.logo_id ? mediaService.resolveMany([row.logo_id]).get(row.logo_id) ?? null : null;
  return {
    siteName: row.site_name,
    slogan: row.slogan,
    logoId: row.logo_id,
    logo,
    colors: {
      primary: row.primary_color,
      secondary: row.secondary_color,
      accent: row.accent_color,
      background: row.background_color,
      text: row.text_color,
    },
    contact: {
      phone: row.phone, whatsapp: row.whatsapp, email: row.email,
      address: row.address, mapEmbedUrl: row.map_embed_url,
    },
    footerText: row.footer_text,
    updatedAt: row.updated_at,
  };
}

export function get() {
  const row = db.prepare('SELECT * FROM site_settings WHERE id = 1').get();
  if (!row) throw new AppError(500, 'La configuración del sitio no existe. Ejecuta npm run db:setup');
  return toPublic(row);
}

export function update(data) {
  if (data.logoId) mediaService.getById(data.logoId); // 404 si la imagen no existe
  const { sql, values, isEmpty } = buildUpdate(data, COLUMNS);
  if (isEmpty) throw new AppError(400, 'No enviaste ningún campo para actualizar');
  db.prepare(`UPDATE site_settings SET ${sql}, updated_at = datetime('now') WHERE id = 1`).run(...values);
  return get();
}

// ---------- Redes sociales ----------
const socialToPublic = (r) => ({ id: r.id, platform: r.platform, url: r.url, sortOrder: r.sort_order, isVisible: r.is_visible === 1 });

export const listSocial = ({ onlyVisible = false } = {}) =>
  db.prepare(`SELECT * FROM social_links ${onlyVisible ? 'WHERE is_visible = 1' : ''} ORDER BY sort_order, id`)
    .all().map(socialToPublic);

export function createSocial({ platform, url, isVisible = true }) {
  const { next } = db.prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM social_links').get();
  const id = db.prepare('INSERT INTO social_links (platform, url, sort_order, is_visible) VALUES (?, ?, ?, ?)')
    .run(platform, url, next, isVisible ? 1 : 0).lastInsertRowid;
  return socialToPublic(db.prepare('SELECT * FROM social_links WHERE id = ?').get(id));
}

export function updateSocial(id, data) {
  const { sql, values, isEmpty } = buildUpdate(data, { platform: 'platform', url: 'url', isVisible: 'is_visible' });
  if (isEmpty) throw new AppError(400, 'No enviaste ningún campo para actualizar');
  const r = db.prepare(`UPDATE social_links SET ${sql} WHERE id = ?`).run(...values, id);
  if (r.changes === 0) throw new AppError(404, 'Red social no encontrada');
  return socialToPublic(db.prepare('SELECT * FROM social_links WHERE id = ?').get(id));
}

export function removeSocial(id) {
  const r = db.prepare('DELETE FROM social_links WHERE id = ?').run(id);
  if (r.changes === 0) throw new AppError(404, 'Red social no encontrada');
}
