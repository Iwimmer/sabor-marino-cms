# 📡 API REST — CMS Sabor Marino

## Importar la colección

El archivo **`SaborMarino.postman_collection.json`** (formato Postman v2.1) contiene 74 peticiones de ejemplo en 12 carpetas, cada una con su prueba automática.

- **Thunder Client (VS Code):** pestaña Thunder Client → *Collections* → menú `≡` → **Import** → elige el archivo.
- **Postman:** botón **Import** → arrastra el archivo.

Ejecuta las carpetas en orden: la carpeta 1 inicia sesión como ADMIN y la cookie `sm_token` se reenvía sola en las demás peticiones. Para la petición *Subir imagen* usa `imagen-prueba.jpg` (está en esta carpeta).

También se puede ejecutar completa desde la terminal con Newman:

```bash
npx newman run docs/api/SaborMarino.postman_collection.json --working-dir docs/api
```

## Formato de respuestas

```json
// Éxito
{ "data": { ... } }

// Error
{ "error": { "message": "Datos inválidos", "details": [{ "field": "primaryColor", "message": "Usa un color HEX de 6 dígitos" }] } }
```

| Código | Significado |
|---|---|
| 200 / 201 / 204 | Correcto / creado / eliminado |
| 400 | Datos inválidos (con detalle por campo) |
| 401 | No hay sesión o expiró |
| 403 | La sesión no tiene el rol necesario |
| 404 | No existe |
| 409 | Conflicto (duplicado o tiene datos relacionados) |
| 413 | Imagen mayor a 8 MB |

## Endpoints (56)

| Módulo | Método | Ruta | Acceso | Descripción |
|---|---|---|---|---|
| Sistema | `GET` | `/api/health` | Pública | Estado de la API |
| Autenticación | `POST` | `/api/auth/login` | Pública (10 intentos/15 min) | Inicia sesión; guarda el JWT en cookie httpOnly |
| Autenticación | `POST` | `/api/auth/logout` | Pública | Cierra sesión |
| Autenticación | `GET` | `/api/auth/me` | Sesión | Usuario actual |
| Configuración | `GET` | `/api/settings` | ADMIN, EDITOR | Colores, logo y contacto |
| Configuración | `PUT` | `/api/settings` | ADMIN | Actualiza colores, logo y contacto (parcial) |
| Redes sociales | `GET` | `/api/social-links` | ADMIN, EDITOR | Lista redes |
| Redes sociales | `POST` | `/api/social-links` | ADMIN | Crea red |
| Redes sociales | `PUT` | `/api/social-links/:id` | ADMIN | Edita red |
| Redes sociales | `DELETE` | `/api/social-links/:id` | ADMIN | Elimina red |
| Páginas | `GET` | `/api/pages` | ADMIN, EDITOR | Lista páginas |
| Páginas | `POST` | `/api/pages` | ADMIN, EDITOR | Crea página (slug automático) |
| Páginas | `GET` | `/api/pages/:id` | ADMIN, EDITOR | Página con sus bloques |
| Páginas | `PUT` | `/api/pages/:id` | ADMIN, EDITOR | Edita, publica o marca como inicio |
| Páginas | `DELETE` | `/api/pages/:id` | ADMIN, EDITOR | Elimina (no la de inicio) |
| Bloques | `GET` | `/api/components/types` | ADMIN, EDITOR | Catálogo de tipos de bloque |
| Bloques | `POST` | `/api/pages/:id/components` | ADMIN, EDITOR | Agrega bloque (contenido validado por tipo) |
| Bloques | `PUT` | `/api/pages/:id/components/reorder` | ADMIN, EDITOR | Reordena bloques |
| Bloques | `PUT` | `/api/components/:id` | ADMIN, EDITOR | Edita contenido / visibilidad |
| Bloques | `POST` | `/api/components/:id/duplicate` | ADMIN, EDITOR | Duplica bloque |
| Bloques | `DELETE` | `/api/components/:id` | ADMIN, EDITOR | Elimina bloque |
| Menús | `GET` | `/api/menus` | ADMIN, EDITOR | Menús con ítems en árbol |
| Menús | `GET` | `/api/menus/:id` | ADMIN, EDITOR | Un menú |
| Menús | `POST` | `/api/menus/:id/items` | ADMIN, EDITOR | Agrega enlace (página o URL) |
| Menús | `PUT` | `/api/menus/:id/items/reorder` | ADMIN, EDITOR | Reordena (arrastrar y soltar) |
| Menús | `PUT` | `/api/menus/items/:itemId` | ADMIN, EDITOR | Edita enlace |
| Menús | `DELETE` | `/api/menus/items/:itemId` | ADMIN, EDITOR | Elimina enlace |
| Categorías | `GET` | `/api/categories` | ADMIN, EDITOR | Lista con cantidad de platos |
| Categorías | `POST` | `/api/categories` | ADMIN, EDITOR | Crea categoría |
| Categorías | `PUT` | `/api/categories/reorder` | ADMIN, EDITOR | Reordena categorías |
| Categorías | `GET` | `/api/categories/:id` | ADMIN, EDITOR | Una categoría |
| Categorías | `PUT` | `/api/categories/:id` | ADMIN, EDITOR | Edita categoría |
| Categorías | `DELETE` | `/api/categories/:id` | ADMIN, EDITOR | Elimina (409 si tiene platos) |
| Categorías | `PUT` | `/api/categories/:id/dishes/reorder` | ADMIN, EDITOR | Reordena platos |
| Platos | `GET` | `/api/dishes?categoryId=&q=&featured=&available=` | ADMIN, EDITOR | Lista y busca platos |
| Platos | `POST` | `/api/dishes` | ADMIN, EDITOR | Crea plato (precio en soles) |
| Platos | `GET` | `/api/dishes/:id` | ADMIN, EDITOR | Un plato |
| Platos | `PUT` | `/api/dishes/:id` | ADMIN, EDITOR | Edita plato |
| Platos | `DELETE` | `/api/dishes/:id` | ADMIN, EDITOR | Elimina plato |
| Medios | `GET` | `/api/media` | ADMIN, EDITOR | Lista imágenes con variantes |
| Medios | `POST` | `/api/media` | ADMIN, EDITOR | Sube imagen (multipart: file, alt) → 3 WebP |
| Medios | `GET` | `/api/media/:id` | ADMIN, EDITOR | Una imagen |
| Medios | `PUT` | `/api/media/:id` | ADMIN, EDITOR | Edita texto alternativo |
| Medios | `DELETE` | `/api/media/:id` | ADMIN, EDITOR | Elimina imagen y archivos |
| Usuarios | `GET` | `/api/users` | ADMIN | Lista usuarios |
| Usuarios | `GET` | `/api/users/roles` | ADMIN | Lista roles |
| Usuarios | `POST` | `/api/users` | ADMIN | Crea usuario |
| Usuarios | `GET` | `/api/users/:id` | ADMIN | Un usuario |
| Usuarios | `PUT` | `/api/users/:id` | ADMIN | Edita, cambia rol o desactiva |
| Usuarios | `DELETE` | `/api/users/:id` | ADMIN | Elimina (no a sí mismo ni al último ADMIN) |
| Dashboard | `GET` | `/api/stats` | ADMIN, EDITOR | Estadísticas |
| Pública | `GET` | `/api/public/site` | Pública | Configuración, redes y menús visibles |
| Pública | `GET` | `/api/public/home` | Pública | Página de inicio con bloques resueltos |
| Pública | `GET` | `/api/public/pages` | Pública | Páginas publicadas |
| Pública | `GET` | `/api/public/pages/:slug` | Pública | Página por slug |
| Pública | `GET` | `/api/public/carta` | Pública | Carta completa disponible |

## Tipos de bloque (`page_components.type`)

| Tipo | Contenido JSON |
|---|---|
| `hero` | `title`, `subtitle`, `imageId`, `buttonText`, `buttonLink` |
| `menu` | `title`, `subtitle`, `categoryIds[]` (vacío = todas), `onlyFeatured` |
| `gallery` | `title`, `imageIds[]` (máx. 24) |
| `testimonials` | `title`, `items[]` → `{ name, text, rating 1-5 }` |
| `schedule` | `title`, `items[]` → `{ days, hours }`, `note` |
| `contact` | `title`, `subtitle`, `showMap`, `showWhatsapp` |
| `text` | `title`, `body`, `imageId`, `imagePosition` (`left`/`right`) |
