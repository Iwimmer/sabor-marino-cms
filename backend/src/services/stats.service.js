// Números para el dashboard del panel.
import { db } from '../lib/db.js';

const count = (sql) => db.prepare(sql).get().n;

export function summary() {
  return {
    pages: count('SELECT COUNT(*) AS n FROM pages'),
    publishedPages: count('SELECT COUNT(*) AS n FROM pages WHERE is_published = 1'),
    blocks: count('SELECT COUNT(*) AS n FROM page_components'),
    dishes: count('SELECT COUNT(*) AS n FROM dishes'),
    availableDishes: count('SELECT COUNT(*) AS n FROM dishes WHERE is_available = 1'),
    categories: count('SELECT COUNT(*) AS n FROM categories'),
    media: count('SELECT COUNT(*) AS n FROM media'),
    users: count('SELECT COUNT(*) AS n FROM users'),
    dishesByCategory: db.prepare(`
      SELECT c.name AS category, COUNT(d.id) AS total
      FROM categories c LEFT JOIN dishes d ON d.category_id = c.id
      GROUP BY c.id ORDER BY c.sort_order
    `).all(),
    blocksByType: db.prepare('SELECT type, COUNT(*) AS total FROM page_components GROUP BY type ORDER BY total DESC').all(),
    recentPages: db.prepare('SELECT id, title, updated_at AS updatedAt FROM pages ORDER BY updated_at DESC LIMIT 5').all(),
  };
}
