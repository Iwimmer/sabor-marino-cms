// Pruebas del "motor" (Semana 2): configuración, páginas, bloques, menús, carta, medios, usuarios y API pública.
import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { startTestServer } from './helpers.js';

let t, admin, editor, anon;
before(async () => {
  t = await startTestServer();
  admin = t.client((await t.login('admin@sabormarino.pe', 'Admin123*')).cookie);
  editor = t.client((await t.login('editor@sabormarino.pe', 'Editor123*')).cookie);
  anon = t.client(null);
});
after(() => t.close());

describe('Configuración global (colores y contacto)', () => {
  test('Leer configuración', async () => {
    const { status, body } = await admin('GET', '/settings');
    assert.equal(status, 200);
    assert.equal(body.data.siteName, 'Sabor Marino');
    assert.equal(body.data.colors.primary, '#0F4C75');
  });

  test('ADMIN cambia los colores', async () => {
    const { status, body } = await admin('PUT', '/settings', { primaryColor: '#7A1F2B', accentColor: '#E0A100' });
    assert.equal(status, 200);
    assert.equal(body.data.colors.primary, '#7A1F2B');
    assert.equal(body.data.colors.accent, '#E0A100');
  });

  test('Color inválido responde 400 con mensaje claro', async () => {
    const { status, body } = await admin('PUT', '/settings', { primaryColor: 'rojo' });
    assert.equal(status, 400);
    assert.equal(body.error.details[0].field, 'primaryColor');
  });

  test('EDITOR NO puede cambiar la apariencia (403)', async () => {
    const { status } = await editor('PUT', '/settings', { primaryColor: '#000000' });
    assert.equal(status, 403);
  });

  test('El cambio de color se refleja en la API pública', async () => {
    const { body } = await anon('GET', '/public/site');
    assert.equal(body.data.settings.colors.primary, '#7A1F2B');
    assert.ok(body.data.menus.header.length >= 4);
  });

  test('CRUD de redes sociales', async () => {
    const created = await admin('POST', '/social-links', { platform: 'youtube', url: 'https://youtube.com/' });
    assert.equal(created.status, 201);
    const upd = await admin('PUT', `/social-links/${created.body.data.id}`, { isVisible: false });
    assert.equal(upd.body.data.isVisible, false);
    assert.equal((await admin('DELETE', `/social-links/${created.body.data.id}`)).status, 204);
  });
});

describe('Páginas y bloques (constructor modular)', () => {
  let pageId;

  test('Crear página genera el slug automáticamente', async () => {
    const { status, body } = await editor('POST', '/pages', { title: 'Promociones del Mes' });
    assert.equal(status, 201);
    assert.equal(body.data.slug, 'promociones-del-mes');
    pageId = body.data.id;
  });

  test('Slug repetido responde 409', async () => {
    const { status } = await editor('POST', '/pages', { title: 'Otra', slug: 'carta' });
    assert.equal(status, 409);
  });

  test('Catálogo de tipos de bloque', async () => {
    const { body } = await editor('GET', '/components/types');
    assert.deepEqual(body.data.map((b) => b.type), ['hero', 'menu', 'gallery', 'testimonials', 'schedule', 'contact', 'text']);
  });

  let heroId, textId, scheduleId;
  test('Agregar bloques: con contenido y con valores por defecto', async () => {
    const hero = await editor('POST', `/pages/${pageId}/components`, {
      type: 'hero', content: { title: '2x1 en ceviches', subtitle: 'Solo los martes', buttonText: 'Ver carta', buttonLink: '/carta' },
    });
    assert.equal(hero.status, 201);
    assert.equal(hero.body.data.content.imageId, null); // valor por defecto agregado por Zod
    heroId = hero.body.data.id;

    const text = await editor('POST', `/pages/${pageId}/components`, { type: 'text' });
    assert.equal(text.status, 201);
    assert.equal(text.body.data.content.body, 'Escribe aquí tu texto.');
    textId = text.body.data.id;

    const schedule = await editor('POST', `/pages/${pageId}/components`, { type: 'schedule' });
    scheduleId = schedule.body.data.id;
    assert.deepEqual([hero, text, schedule].map((r) => r.body.data.sortOrder), [1, 2, 3]);
  });

  test('Contenido inválido para el tipo responde 400 indicando el campo', async () => {
    const { status, body } = await editor('POST', `/pages/${pageId}/components`, {
      type: 'testimonials', content: { title: 'X', items: [{ name: '', text: 'ok', rating: 9 }] },
    });
    assert.equal(status, 400);
    const fields = body.error.details.map((d) => d.field);
    assert.ok(fields.includes('content.items.0.name'));
    assert.ok(fields.includes('content.items.0.rating'));
  });

  test('Tipo de bloque inexistente responde 400', async () => {
    const { status } = await editor('POST', `/pages/${pageId}/components`, { type: 'carrusel3d' });
    assert.equal(status, 400);
  });

  test('Editar bloque y ocultarlo', async () => {
    const { status, body } = await editor('PUT', `/components/${textId}`, {
      content: { title: 'Promo', body: 'Válido hasta fin de mes', imagePosition: 'left' }, isVisible: false,
    });
    assert.equal(status, 200);
    assert.equal(body.data.content.imagePosition, 'left');
    assert.equal(body.data.isVisible, false);
  });

  test('Reordenar bloques', async () => {
    const { status, body } = await editor('PUT', `/pages/${pageId}/components/reorder`, { ids: [scheduleId, heroId, textId] });
    assert.equal(status, 200);
    assert.deepEqual(body.data.map((c) => c.id), [scheduleId, heroId, textId]);
  });

  test('Reordenar con ids incompletos o repetidos responde 400', async () => {
    assert.equal((await editor('PUT', `/pages/${pageId}/components/reorder`, { ids: [heroId, heroId, textId] })).status, 400);
    assert.equal((await editor('PUT', `/pages/${pageId}/components/reorder`, { ids: [heroId] })).status, 400);
  });

  test('Duplicar bloque lo inserta justo debajo', async () => {
    const { status, body } = await editor('POST', `/components/${heroId}/duplicate`);
    assert.equal(status, 201);
    const page = await editor('GET', `/pages/${pageId}`);
    const order = page.body.data.components.map((c) => c.id);
    assert.equal(order.indexOf(body.data.id), order.indexOf(heroId) + 1);
  });

  test('La página publicada se ve en la API pública sin los bloques ocultos', async () => {
    const { status, body } = await anon('GET', '/public/pages/promociones-del-mes');
    assert.equal(status, 200);
    assert.ok(!body.data.blocks.some((b) => b.id === textId));
  });

  test('Página despublicada responde 404 en la API pública', async () => {
    await editor('PUT', `/pages/${pageId}`, { isPublished: false });
    assert.equal((await anon('GET', '/public/pages/promociones-del-mes')).status, 404);
  });

  test('No se puede eliminar la página de inicio', async () => {
    const pages = await editor('GET', '/pages');
    const home = pages.body.data.find((p) => p.isHome);
    assert.equal((await editor('DELETE', `/pages/${home.id}`)).status, 400);
  });

  test('Cambiar la página de inicio deja una sola marcada', async () => {
    await editor('PUT', `/pages/${pageId}`, { isPublished: true, isHome: true });
    const pages = await editor('GET', '/pages');
    assert.equal(pages.body.data.filter((p) => p.isHome).length, 1);
    assert.equal((await anon('GET', '/public/home')).body.data.slug, 'promociones-del-mes');
    // se restaura la original
    const inicio = pages.body.data.find((p) => p.slug === 'inicio');
    await editor('PUT', `/pages/${inicio.id}`, { isHome: true });
  });

  test('Eliminar página borra sus bloques en cascada', async () => {
    assert.equal((await editor('DELETE', `/pages/${pageId}`)).status, 204);
    assert.equal((await editor('PUT', `/components/${heroId}`, { isVisible: true })).status, 404);
  });
});

describe('Menús de navegación', () => {
  let header;
  test('Listar menús con sus ítems en forma de árbol', async () => {
    const { body } = await editor('GET', '/menus');
    header = body.data.find((m) => m.location === 'header');
    assert.equal(header.items.length, 4);
    assert.equal(header.items[0].href, '/');
    assert.equal(header.items[1].href, '/carta');
  });

  let promoId;
  test('Agregar enlace externo y submenú', async () => {
    const promo = await editor('POST', `/menus/${header.id}/items`, { label: 'Delivery', url: 'https://wa.me/51999888777' });
    assert.equal(promo.status, 201);
    assert.equal(promo.body.data.isExternal, true);
    promoId = promo.body.data.id;
    const sub = await editor('POST', `/menus/${header.id}/items`, { label: 'Pedidos grandes', url: 'https://wa.me/51999888777', parentId: header.items[1].id });
    assert.equal(sub.status, 201);
    const menu = await editor('GET', `/menus/${header.id}`);
    assert.equal(menu.body.data.items.find((i) => i.id === header.items[1].id).children.length, 1);
  });

  test('Ítem sin página ni URL responde 400', async () => {
    assert.equal((await editor('POST', `/menus/${header.id}/items`, { label: 'Vacío' })).status, 400);
  });

  test('Reordenar el menú (arrastrar y soltar)', async () => {
    const menu = (await editor('GET', `/menus/${header.id}`)).body.data;
    const flat = menu.items.flatMap((i) => [{ id: i.id, parentId: null }, ...i.children.map((c) => ({ id: c.id, parentId: i.id }))]);
    const reversedRoots = [...flat].reverse().map((i) => ({ ...i, parentId: null }));
    const { status, body } = await editor('PUT', `/menus/${header.id}/items/reorder`, { items: reversedRoots });
    assert.equal(status, 200);
    assert.equal(body.data.items[0].id, reversedRoots[0].id);
    assert.equal(body.data.items.length, flat.length);
  });

  test('Ocultar un ítem lo saca del menú público', async () => {
    await editor('PUT', `/menus/items/${promoId}`, { isVisible: false });
    const { body } = await anon('GET', '/public/site');
    assert.ok(!body.data.menus.header.some((i) => i.id === promoId));
  });
});

describe('Carta: categorías y platos', () => {
  let catId, dishId;
  test('Crear categoría', async () => {
    const { status, body } = await editor('POST', '/categories', { name: 'Promociones Únicas' });
    assert.equal(status, 201);
    assert.equal(body.data.slug, 'promociones-unicas');
    catId = body.data.id;
  });

  test('Crear plato: el precio se guarda en céntimos y se devuelve en soles', async () => {
    const { status, body } = await editor('POST', '/dishes', { categoryId: catId, name: 'Combo marino', price: 59.9, isFeatured: true });
    assert.equal(status, 201);
    assert.equal(body.data.price, 59.9);
    assert.equal(body.data.priceCents, 5990);
    dishId = body.data.id;
  });

  test('Precio negativo responde 400', async () => {
    assert.equal((await editor('POST', '/dishes', { categoryId: catId, name: 'X', price: -1 })).status, 400);
  });

  test('Buscar platos por texto y por categoría', async () => {
    const q = await editor('GET', '/dishes?q=ceviche');
    assert.ok(q.body.data.length >= 2 && q.body.data.every((d) => /ceviche/i.test(d.name + d.description)));
    const byCat = await editor('GET', `/dishes?categoryId=${catId}`);
    assert.equal(byCat.body.data.length, 1);
  });

  test('No se puede borrar una categoría con platos (409)', async () => {
    const { status, body } = await editor('DELETE', `/categories/${catId}`);
    assert.equal(status, 409);
    assert.match(body.error.message, /tiene 1 plato/);
  });

  test('Plato no disponible desaparece de la carta pública', async () => {
    await editor('PUT', `/dishes/${dishId}`, { isAvailable: false });
    const { body } = await anon('GET', '/public/carta');
    assert.ok(!body.data.some((c) => c.dishes.some((d) => d.id === dishId)));
  });

  test('Reordenar categorías', async () => {
    const ids = (await editor('GET', '/categories')).body.data.map((c) => c.id).reverse();
    const { body } = await editor('PUT', '/categories/reorder', { ids });
    assert.deepEqual(body.data.map((c) => c.id), ids);
  });

  test('Eliminar plato y luego la categoría vacía', async () => {
    assert.equal((await editor('DELETE', `/dishes/${dishId}`)).status, 204);
    assert.equal((await editor('DELETE', `/categories/${catId}`)).status, 204);
  });
});

describe('Medios: subida y procesamiento con sharp', () => {
  let mediaId, bigBytes;
  test('Subir una imagen genera 3 tamaños WebP más livianos', async () => {
    // Imagen de prueba de 2400x1600 px en JPG
    const jpg = await sharp({ create: { width: 2400, height: 1600, channels: 3, background: '#3282B8' } })
      .composite([{ input: Buffer.from('<svg width="2400" height="1600"><circle cx="1200" cy="800" r="600" fill="#F28C6B"/></svg>') }])
      .jpeg({ quality: 95 }).toBuffer();
    bigBytes = jpg.length;
    const form = new FormData();
    form.append('file', new Blob([jpg], { type: 'image/jpeg' }), 'Ceviche Clásico.jpg');
    form.append('alt', 'Ceviche clásico servido en plato hondo');
    const { status, body } = await editor('POST', '/media', form);
    assert.equal(status, 201);
    mediaId = body.data.id;
    const widths = body.data.variants.map((v) => v.width);
    assert.deepEqual(widths, [480, 1024, 1920]);
    assert.ok(body.data.variants.every((v) => v.url.endsWith('.webp')));
    assert.ok(body.data.variants.every((v) => v.bytes < bigBytes));
    // los archivos existen y se sirven por HTTP
    const lg = body.data.variants.find((v) => v.size === 'lg');
    assert.ok(fs.existsSync(path.join(t.uploadsDir, path.basename(lg.url))));
    assert.equal((await fetch(`${t.origin}${lg.url}`)).status, 200);
  });

  test('Una imagen pequeña no se agranda', async () => {
    const small = await sharp({ create: { width: 300, height: 200, channels: 3, background: '#ffffff' } }).png().toBuffer();
    const form = new FormData();
    form.append('file', new Blob([small], { type: 'image/png' }), 'logo.png');
    const { body } = await editor('POST', '/media', form);
    assert.ok(body.data.variants.every((v) => v.width === 300));
  });

  test('Un archivo que no es imagen responde 400', async () => {
    const form = new FormData();
    form.append('file', new Blob(['hola'], { type: 'image/png' }), 'falso.png');
    assert.equal((await editor('POST', '/media', form)).status, 400);
  });

  test('Asignar la imagen a un plato y al logo', async () => {
    const dish = await editor('PUT', '/dishes/1', { imageId: mediaId });
    assert.equal(dish.body.data.image.id, mediaId);
    const settings = await admin('PUT', '/settings', { logoId: mediaId });
    assert.equal(settings.body.data.logo.id, mediaId);
  });

  test('El bloque galería resuelve las imágenes en la API pública', async () => {
    const pages = (await editor('GET', '/pages')).body.data;
    const home = (await editor('GET', `/pages/${pages.find((p) => p.isHome).id}`)).body.data;
    const gallery = home.components.find((c) => c.type === 'gallery');
    await editor('PUT', `/components/${gallery.id}`, { content: { title: 'Nuestra cocina', imageIds: [mediaId, 9999] } });
    const pub = await anon('GET', '/public/home');
    const block = pub.body.data.blocks.find((b) => b.type === 'gallery');
    assert.equal(block.data.images.length, 1); // el id 9999 no existe y se ignora
    assert.ok(block.data.images[0].variants.length === 3);
    const menuBlock = pub.body.data.blocks.find((b) => b.type === 'menu');
    assert.ok(menuBlock.data.categories.every((c) => c.dishes.every((d) => d.isFeatured)));
  });

  test('Eliminar la imagen borra los archivos y deja el plato sin foto', async () => {
    const before = (await editor('GET', `/media/${mediaId}`)).body.data.variants;
    assert.equal((await editor('DELETE', `/media/${mediaId}`)).status, 204);
    assert.ok(before.every((v) => !fs.existsSync(path.join(t.uploadsDir, path.basename(v.url)))));
    assert.equal((await editor('GET', '/dishes/1')).body.data.image, null);
  });
});

describe('Usuarios (solo ADMIN)', () => {
  let userId;
  test('Crear usuario con contraseña segura', async () => {
    const weak = await admin('POST', '/users', { name: 'Ana', email: 'ana@sabormarino.pe', password: '123', role: 'EDITOR' });
    assert.equal(weak.status, 400);
    const ok = await admin('POST', '/users', { name: 'Ana', email: 'ana@sabormarino.pe', password: 'Segura2026', role: 'EDITOR' });
    assert.equal(ok.status, 201);
    userId = ok.body.data.id;
    assert.equal((await t.login('ana@sabormarino.pe', 'Segura2026')).res.status, 200);
  });

  test('Correo repetido responde 409', async () => {
    assert.equal((await admin('POST', '/users', { name: 'X', email: 'ana@sabormarino.pe', password: 'Segura2026', role: 'EDITOR' })).status, 409);
  });

  test('Desactivar usuario impide su login', async () => {
    await admin('PUT', `/users/${userId}`, { isActive: false });
    assert.equal((await t.login('ana@sabormarino.pe', 'Segura2026')).res.status, 403);
  });

  test('No se puede quitar el último ADMIN', async () => {
    const me = (await admin('GET', '/auth/me')).body.data.user;
    assert.equal((await admin('PUT', `/users/${me.id}`, { role: 'EDITOR' })).status, 400);
    assert.equal((await admin('DELETE', `/users/${me.id}`)).status, 400);
  });

  test('EDITOR no puede crear usuarios', async () => {
    assert.equal((await editor('POST', '/users', { name: 'X', email: 'x@x.pe', password: 'Segura2026', role: 'ADMIN' })).status, 403);
  });

  test('Eliminar usuario', async () => {
    assert.equal((await admin('DELETE', `/users/${userId}`)).status, 204);
  });
});

describe('Seguridad general', () => {
  test('Sin sesión, todas las rutas del panel responden 401', async () => {
    for (const url of ['/settings', '/pages', '/menus', '/categories', '/dishes', '/media', '/users', '/stats', '/components/types']) {
      assert.equal((await anon('GET', url)).status, 401, url);
    }
  });

  test('Dashboard: estadísticas', async () => {
    const { status, body } = await editor('GET', '/stats');
    assert.equal(status, 200);
    assert.ok(body.data.dishes >= 15);
    assert.ok(Array.isArray(body.data.dishesByCategory));
  });
});

describe('Correcciones de la revisión final', () => {
  test('Eliminar una página enlazada en el menú también quita su enlace', async () => {
    const page = (await editor('POST', '/pages', { title: 'Temporal' })).body.data;
    const header = (await editor('GET', '/menus')).body.data.find((m) => m.location === 'header');
    await editor('POST', `/menus/${header.id}/items`, { label: 'Temporal', pageId: page.id });
    assert.equal((await editor('DELETE', `/pages/${page.id}`)).status, 204);
    const after = (await editor('GET', `/menus/${header.id}`)).body.data.items;
    assert.ok(!after.some((i) => i.label === 'Temporal'));
  });

  test('Una página en borrador no puede convertirse en inicio', async () => {
    const draft = (await editor('POST', '/pages', { title: 'Borrador', isPublished: false })).body.data;
    assert.equal((await editor('PUT', `/pages/${draft.id}`, { isHome: true })).status, 400);
    assert.equal((await editor('POST', '/pages', { title: 'X', isHome: true, isPublished: false })).status, 400);
  });

  test('Las URLs con protocolos peligrosos se rechazan', async () => {
    assert.equal((await admin('POST', '/social-links', { platform: 'otro', url: 'javascript:alert(1)' })).status, 400);
    assert.equal((await admin('PUT', '/settings', { mapEmbedUrl: 'data:text/html,hola' })).status, 400);
  });

  test('El correo con espacios al inicio se acepta en el login', async () => {
    assert.equal((await t.login('  ADMIN@sabormarino.pe ', 'Admin123*')).res.status, 200);
  });

  test('Un enlace de menú con sub-enlaces no puede volverse submenú', async () => {
    const header = (await editor('GET', '/menus')).body.data.find((m) => m.location === 'header');
    const [a, b] = header.items;
    const child = (await editor('POST', `/menus/${header.id}/items`, { label: 'Hijo', url: '/x', parentId: b.id })).body.data;
    assert.equal((await editor('PUT', `/menus/items/${b.id}`, { parentId: a.id })).status, 400);
    assert.equal(child.isExternal, false); // "/x" es una ruta interna
    await editor('DELETE', `/menus/items/${child.id}`);
  });
});
