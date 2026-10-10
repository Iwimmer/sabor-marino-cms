// Genera la colección de Postman / Thunder Client (formato Postman v2.1) con TODOS los endpoints.
// Uso: node docs/api/generar-coleccion.js   ->  docs/api/SaborMarino.postman_collection.json
// Importar: Thunder Client > Collections > menú ≡ > Import  |  Postman > Import
const fs = require('fs');
const path = require('path');

// Las variables numéricas ({{categoryId}}) van sin comillas para que el JSON final tenga un número
const json = (obj) => ({ mode: 'raw', raw: JSON.stringify(obj, null, 2).replace(/"(\{\{\w+\}\})"/g, '$1'), options: { raw: { language: 'json' } } });
const expect = (code, extra = '') => [{
  listen: 'test',
  script: { type: 'text/javascript', exec: [`pm.test('Responde ${code}', () => pm.response.to.have.status(${code}));`, ...(extra ? extra.split('\n') : [])] },
}];
const saveId = (variable) => `pm.collectionVariables.set('${variable}', pm.response.json().data.id);`;

function req(name, method, url, { body, desc, status = 200, test = '', form } = {}) {
  const parts = url.split('?');
  return {
    name,
    event: expect(status, test),
    request: {
      method,
      header: body ? [{ key: 'Content-Type', value: 'application/json' }] : [],
      ...(body && { body: json(body) }),
      ...(form && { body: { mode: 'formdata', formdata: form } }),
      url: {
        raw: `{{baseUrl}}${url}`,
        host: ['{{baseUrl}}'],
        path: parts[0].split('/').filter(Boolean),
        ...(parts[1] && { query: parts[1].split('&').map((q) => { const [key, value] = q.split('='); return { key, value }; }) }),
      },
      description: desc,
    },
  };
}
const folder = (name, description, item) => ({ name, description, item });

const collection = {
  info: {
    name: 'CMS Sabor Marino — API REST',
    description: [
      'API del Sistema Web Autónomo (Full-CMS) del restaurante Sabor Marino.',
      '',
      '**Autenticación:** el login guarda un JWT en la cookie httpOnly `sm_token`. Postman y Thunder Client la reenvían solos en las siguientes peticiones.',
      '**Orden sugerido:** ejecuta las carpetas de arriba hacia abajo (la carpeta 1 inicia sesión como ADMIN).',
      '**Formato de respuesta:** éxito `{ data: ... }` · error `{ error: { message, details? } }`.',
      '',
      'Roles: ADMIN (todo) · EDITOR (contenido: páginas, bloques, menús, carta y medios).',
    ].join('\n'),
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:4000/api' },
    { key: 'pageId', value: '1' },
    { key: 'componentId', value: '1' },
    { key: 'menuId', value: '1' },
    { key: 'menuItemId', value: '1' },
    { key: 'categoryId', value: '1' },
    { key: 'dishId', value: '1' },
    { key: 'mediaId', value: '1' },
    { key: 'userId', value: '2' },
    { key: 'socialId', value: '1' },
  ],
  item: [
    folder('1. Autenticación', 'Inicio y cierre de sesión. El JWT viaja en una cookie httpOnly.', [
      req('Health check', 'GET', '/health', { desc: 'Verifica que la API esté encendida.' }),
      req('Login con datos inválidos (400)', 'POST', '/auth/login', { body: { email: 'no-es-correo', password: '' }, status: 400, desc: 'Zod devuelve el detalle por campo.' }),
      req('Login con clave incorrecta (401)', 'POST', '/auth/login', { body: { email: 'admin@sabormarino.pe', password: 'incorrecta' }, status: 401 }),
      req('Login ADMIN', 'POST', '/auth/login', {
        body: { email: 'admin@sabormarino.pe', password: 'Admin123*' },
        desc: 'Guarda la cookie `sm_token` (HttpOnly, SameSite=Lax). El token NO aparece en el JSON. Máx. 10 intentos cada 15 min.',
        test: "pm.test('La cookie de sesión existe', () => pm.expect(pm.cookies.has('sm_token')).to.be.true);",
      }),
      req('Usuario actual', 'GET', '/auth/me', { desc: 'Requiere sesión.' }),
    ]),
    folder('2. Configuración global (Look & Feel)', 'Colores HEX, logo y datos de contacto. Lectura: ADMIN/EDITOR. Escritura: solo ADMIN.', [
      req('Ver configuración', 'GET', '/settings'),
      req('Cambiar colores', 'PUT', '/settings', {
        body: { primaryColor: '#0F4C75', secondaryColor: '#3282B8', accentColor: '#F28C6B', backgroundColor: '#FFFFFF', textColor: '#1E293B' },
        desc: 'Todos los campos son opcionales: se actualiza solo lo que se envía. Los colores deben ser HEX de 6 dígitos.',
      }),
      req('Cambiar datos de contacto', 'PUT', '/settings', { body: { siteName: 'Sabor Marino', slogan: 'Cebichería y cocina marina desde 1998', whatsapp: '51999888777', phone: '(01) 254-7788' } }),
      req('Color inválido (400)', 'PUT', '/settings', { body: { primaryColor: 'rojo' }, status: 400 }),
      req('Listar redes sociales', 'GET', '/social-links'),
      req('Crear red social', 'POST', '/social-links', { body: { platform: 'youtube', url: 'https://youtube.com/' }, status: 201, test: saveId('socialId') }),
      req('Editar red social', 'PUT', '/social-links/{{socialId}}', { body: { isVisible: false } }),
      req('Eliminar red social', 'DELETE', '/social-links/{{socialId}}', { status: 204 }),
    ]),
    folder('3. Páginas', 'CRUD de páginas. Solo una página puede ser la de inicio.', [
      req('Listar páginas', 'GET', '/pages'),
      req('Crear página', 'POST', '/pages', { body: { title: 'Promociones', metaDescription: 'Ofertas de la semana' }, status: 201, test: saveId('pageId'), desc: 'Si no se envía slug, se genera desde el título.' }),
      req('Ver página con sus bloques', 'GET', '/pages/{{pageId}}'),
      req('Editar página', 'PUT', '/pages/{{pageId}}', { body: { title: 'Promociones de la semana', isPublished: true } }),
    ]),
    folder('4. Bloques (constructor de páginas)', 'Cada bloque tiene un tipo y su contenido JSON se valida según ese tipo.', [
      req('Catálogo de tipos de bloque', 'GET', '/components/types', { desc: 'hero, menu, gallery, testimonials, schedule, contact, text — con sus valores por defecto.' }),
      req('Agregar bloque Hero', 'POST', '/pages/{{pageId}}/components', {
        status: 201, test: saveId('componentId'),
        body: { type: 'hero', content: { title: '2x1 en ceviches', subtitle: 'Todos los martes', imageId: null, buttonText: 'Ver carta', buttonLink: '/carta' } },
      }),
      req('Agregar bloque Testimonios', 'POST', '/pages/{{pageId}}/components', {
        status: 201,
        body: { type: 'testimonials', content: { title: 'Opiniones', items: [{ name: 'Lucía', text: '¡Delicioso!', rating: 5 }] } },
      }),
      req('Agregar bloque con valores por defecto', 'POST', '/pages/{{pageId}}/components', { status: 201, body: { type: 'schedule' } }),
      req('Contenido inválido (400)', 'POST', '/pages/{{pageId}}/components', {
        status: 400, body: { type: 'testimonials', content: { title: 'X', items: [{ name: '', text: 'ok', rating: 9 }] } },
        desc: 'Devuelve los campos exactos con error: content.items.0.name y content.items.0.rating.',
      }),
      req('Editar bloque', 'PUT', '/components/{{componentId}}', { body: { content: { title: '3x2 en ceviches', subtitle: 'Solo hoy', imageId: null, buttonText: 'Pedir', buttonLink: 'https://wa.me/51999888777' } } }),
      req('Ocultar bloque', 'PUT', '/components/{{componentId}}', { body: { isVisible: false } }),
      req('Duplicar bloque', 'POST', '/components/{{componentId}}/duplicate', { status: 201 }),
      req('Reordenar bloques de la página 1 (Inicio)', 'PUT', '/pages/1/components/reorder', {
        body: { ids: [1, 2, 3, 4, 5] }, desc: 'Se envían TODOS los ids de bloques de la página en el nuevo orden.',
      }),
      req('Eliminar bloque', 'DELETE', '/components/{{componentId}}', { status: 204 }),
      req('Eliminar página (y sus bloques)', 'DELETE', '/pages/{{pageId}}', { status: 204 }),
    ]),
    folder('5. Menús de navegación', 'Menús por ubicación (header/footer). Un ítem apunta a una página (pageId) o a una URL.', [
      req('Listar menús (árbol)', 'GET', '/menus'),
      req('Ver menú principal', 'GET', '/menus/{{menuId}}'),
      req('Reordenar menú (arrastrar y soltar)', 'PUT', '/menus/{{menuId}}/items/reorder', {
        body: { items: [{ id: 1, parentId: null }, { id: 2, parentId: null }, { id: 4, parentId: null }, { id: 3, parentId: null }] },
        desc: 'Se envían TODOS los ítems del menú, en el nuevo orden y con su padre (null = primer nivel). Si falta alguno responde 400.',
      }),
      req('Agregar enlace a página', 'POST', '/menus/{{menuId}}/items', { body: { label: 'Nosotros', pageId: 3 }, status: 201, test: saveId('menuItemId') }),
      req('Agregar enlace externo', 'POST', '/menus/{{menuId}}/items', { body: { label: 'Delivery', url: 'https://wa.me/51999888777' }, status: 201 }),
      req('Editar ítem', 'PUT', '/menus/items/{{menuItemId}}', { body: { label: 'Nuestra historia' } }),
      req('Eliminar ítem', 'DELETE', '/menus/items/{{menuItemId}}', { status: 204 }),
    ]),
    folder('6. Carta: categorías', '', [
      req('Listar categorías', 'GET', '/categories'),
      req('Crear categoría', 'POST', '/categories', { body: { name: 'Promociones', description: 'Solo por temporada' }, status: 201, test: saveId('categoryId') }),
      req('Editar categoría', 'PUT', '/categories/{{categoryId}}', { body: { isActive: true } }),
      req('Reordenar platos de la categoría 1', 'PUT', '/categories/1/dishes/reorder', { body: { ids: [3, 2, 1] } }),
    ]),
    folder('7. Carta: platos', 'El precio se envía en soles (38.5) y se guarda en céntimos.', [
      req('Listar platos', 'GET', '/dishes'),
      req('Buscar platos', 'GET', '/dishes?q=ceviche&available=true'),
      req('Crear plato', 'POST', '/dishes', { body: { categoryId: '{{categoryId}}', name: 'Combo marino', description: 'Ceviche + chicharrón + chicha', price: 59.9, isFeatured: true }, status: 201, test: saveId('dishId') }),
      req('Ver plato', 'GET', '/dishes/{{dishId}}'),
      req('Editar plato', 'PUT', '/dishes/{{dishId}}', { body: { price: 54.9, isAvailable: true } }),
      req('Precio negativo (400)', 'POST', '/dishes', { body: { categoryId: 1, name: 'X', price: -1 }, status: 400 }),
      req('Borrar categoría con platos (409)', 'DELETE', '/categories/{{categoryId}}', { status: 409 }),
      req('Eliminar plato', 'DELETE', '/dishes/{{dishId}}', { status: 204 }),
      req('Eliminar categoría vacía', 'DELETE', '/categories/{{categoryId}}', { status: 204 }),
    ]),
    folder('8. Medios (imágenes)', 'La imagen se procesa con sharp: 480, 1024 y 1920 px en WebP.', [
      req('Subir imagen', 'POST', '/media', {
        status: 201, test: saveId('mediaId'),
        form: [
          { key: 'file', type: 'file', src: 'imagen-prueba.jpg', description: 'Selecciona una imagen JPG o PNG (máx. 8 MB)' },
          { key: 'alt', value: 'Ceviche clásico', type: 'text' },
        ],
        desc: 'multipart/form-data. En Thunder Client: Body > Form > marca "Files" y elige la imagen.',
      }),
      req('Listar imágenes', 'GET', '/media'),
      req('Ver imagen', 'GET', '/media/{{mediaId}}'),
      req('Editar texto alternativo', 'PUT', '/media/{{mediaId}}', { body: { alt: 'Ceviche clásico con camote' } }),
      req('Usar la imagen en un plato', 'PUT', '/dishes/1', { body: { imageId: '{{mediaId}}' } }),
      req('Eliminar imagen', 'DELETE', '/media/{{mediaId}}', { status: 204 }),
    ]),
    folder('9. Usuarios (solo ADMIN)', '', [
      req('Listar usuarios', 'GET', '/users'),
      req('Listar roles', 'GET', '/users/roles'),
      req('Crear usuario', 'POST', '/users', { body: { name: 'Ana Torres', email: 'ana@sabormarino.pe', password: 'Segura2026', role: 'EDITOR' }, status: 201, test: saveId('userId') }),
      req('Contraseña débil (400)', 'POST', '/users', { body: { name: 'X', email: 'x@sabormarino.pe', password: '123', role: 'EDITOR' }, status: 400 }),
      req('Desactivar usuario', 'PUT', '/users/{{userId}}', { body: { isActive: false } }),
      req('Eliminar usuario', 'DELETE', '/users/{{userId}}', { status: 204 }),
    ]),
    folder('10. Dashboard', '', [req('Estadísticas', 'GET', '/stats')]),
    folder('11. API pública (sin login)', 'La consume la web del restaurante. No requiere cookie.', [
      req('Datos del sitio (layout)', 'GET', '/public/site', { desc: 'Configuración, colores, redes y menús listos para pintar.' }),
      req('Página de inicio', 'GET', '/public/home', { desc: 'Bloques visibles con sus imágenes y platos ya resueltos.' }),
      req('Página por slug', 'GET', '/public/pages/carta'),
      req('Lista de páginas publicadas', 'GET', '/public/pages'),
      req('Carta completa', 'GET', '/public/carta'),
      req('Página inexistente (404)', 'GET', '/public/pages/no-existe', { status: 404 }),
    ]),
    folder('12. Seguridad', 'Pruebas de control de acceso.', [
      req('Cerrar sesión', 'POST', '/auth/logout'),
      req('Panel sin sesión (401)', 'GET', '/pages', { status: 401 }),
      req('Login EDITOR', 'POST', '/auth/login', { body: { email: 'editor@sabormarino.pe', password: 'Editor123*' } }),
      req('EDITOR cambia colores (403)', 'PUT', '/settings', { body: { primaryColor: '#000000' }, status: 403 }),
      req('EDITOR lista usuarios (403)', 'GET', '/users', { status: 403 }),
      req('EDITOR sí puede editar la carta', 'PUT', '/dishes/2', { body: { isFeatured: true } }),
      req('Cerrar sesión EDITOR', 'POST', '/auth/logout'),
    ]),
  ],
};

const out = path.join(__dirname, 'SaborMarino.postman_collection.json');
fs.writeFileSync(out, JSON.stringify(collection, null, 2));
const total = collection.item.reduce((n, f) => n + f.item.length, 0);
console.log(`Colección generada: ${out} (${total} peticiones en ${collection.item.length} carpetas)`);
