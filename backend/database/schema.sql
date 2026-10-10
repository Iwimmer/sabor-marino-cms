-- ============================================================
--  CMS "Sabor Marino" — Esquema de base de datos (SQLite)
--  Autor: Wimmer Román Quispe
--
--  El modelo está en Tercera Forma Normal (3FN):
--   1FN: cada columna guarda un solo valor atómico. La única excepción
--        intencional es page_components.content (JSON), que exige la guía
--        para que cada bloque tenga campos flexibles.
--   2FN: todas las tablas usan una clave primaria simple (id), por lo que
--        ninguna columna depende de "parte" de la clave.
--   3FN: ninguna columna depende de otra columna que no sea la clave.
--        Ej.: el nombre del rol vive en "roles" y "users" solo guarda role_id.
--
--  Convenciones:
--   - Booleanos como INTEGER 0/1 con CHECK.
--   - Fechas como TEXT ISO-8601 (datetime('now')).
--   - Precios en céntimos (INTEGER) para evitar errores de redondeo.
-- ============================================================

PRAGMA foreign_keys = ON;

-- ---------- SEGURIDAD ----------

CREATE TABLE IF NOT EXISTS roles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL UNIQUE,          -- ADMIN | EDITOR
  description TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT    NOT NULL,
  is_active     INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  last_login_at TEXT,
  role_id       INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ---------- MEDIOS ----------

-- Imagen original subida desde el panel
CREATE TABLE IF NOT EXISTS media (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  original_name  TEXT    NOT NULL,
  alt_text       TEXT,
  uploaded_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Cada versión redimensionada por sharp: sm = 480px, md = 1024px, lg = 1920px
CREATE TABLE IF NOT EXISTS media_variants (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  media_id   INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  size       TEXT    NOT NULL CHECK (size IN ('sm', 'md', 'lg')),
  width      INTEGER NOT NULL,
  height     INTEGER NOT NULL,
  path       TEXT    NOT NULL,                 -- ej: /uploads/1700-ceviche-md.webp
  size_bytes INTEGER NOT NULL,
  UNIQUE (media_id, size)
);

-- ---------- IDENTIDAD VISUAL (configuración global) ----------

-- Una sola fila (id = 1). El frontend lee estos HEX y los inyecta como variables CSS.
CREATE TABLE IF NOT EXISTS site_settings (
  id               INTEGER PRIMARY KEY CHECK (id = 1),
  site_name        TEXT NOT NULL,
  slogan           TEXT,
  logo_id          INTEGER REFERENCES media(id) ON DELETE SET NULL,
  primary_color    TEXT NOT NULL DEFAULT '#0F4C75' CHECK (primary_color    GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]'),
  secondary_color  TEXT NOT NULL DEFAULT '#3282B8' CHECK (secondary_color  GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]'),
  accent_color     TEXT NOT NULL DEFAULT '#F28C6B' CHECK (accent_color     GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]'),
  background_color TEXT NOT NULL DEFAULT '#FFFFFF' CHECK (background_color GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]'),
  text_color       TEXT NOT NULL DEFAULT '#1E293B' CHECK (text_color       GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]'),
  phone            TEXT,
  whatsapp         TEXT,
  email            TEXT,
  address          TEXT,
  map_embed_url    TEXT,
  footer_text      TEXT,
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Redes sociales en su propia tabla (evita columnas facebook, instagram, tiktok...)
CREATE TABLE IF NOT EXISTS social_links (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  platform   TEXT    NOT NULL,                 -- facebook | instagram | tiktok | ...
  url        TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1))
);

-- ---------- PÁGINAS Y CONSTRUCTOR POR BLOQUES ----------

CREATE TABLE IF NOT EXISTS pages (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  title            TEXT    NOT NULL,
  slug             TEXT    NOT NULL UNIQUE,    -- parte de la URL: /carta, /nosotros
  meta_description TEXT,
  is_home          INTEGER NOT NULL DEFAULT 0 CHECK (is_home IN (0, 1)),
  is_published     INTEGER NOT NULL DEFAULT 1 CHECK (is_published IN (0, 1)),
  author_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Bloque de una página: "type" dice QUÉ bloque es y "content" (JSON) guarda
-- SUS datos, que cambian según el tipo. Una misma tabla sirve para un Hero,
-- una Galería o unos Testimonios. SQLite valida que el JSON sea correcto.
CREATE TABLE IF NOT EXISTS page_components (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id    INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type       TEXT    NOT NULL CHECK (type IN ('hero', 'menu', 'gallery', 'testimonials', 'schedule', 'contact', 'text')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
  content    TEXT    NOT NULL DEFAULT '{}' CHECK (json_valid(content)),
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_components_page ON page_components (page_id, sort_order);

-- ---------- MENÚS DE NAVEGACIÓN ----------

CREATE TABLE IF NOT EXISTS menus (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name     TEXT NOT NULL,
  location TEXT NOT NULL UNIQUE                -- header | footer
);

-- Un ítem apunta a una página interna (page_id) O a un enlace externo (url)
CREATE TABLE IF NOT EXISTS menu_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_id    INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  parent_id  INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,  -- submenús
  label      TEXT    NOT NULL,
  page_id    INTEGER REFERENCES pages(id) ON DELETE CASCADE, -- si se borra la página, su enlace también
  url        TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
  CHECK (page_id IS NOT NULL OR url IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu ON menu_items (menu_id, sort_order);

-- ---------- CARTA DEL RESTAURANTE ----------

CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  slug        TEXT    NOT NULL UNIQUE,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS dishes (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name         TEXT    NOT NULL,
  description  TEXT,
  price_cents  INTEGER NOT NULL CHECK (price_cents >= 0),   -- S/ 38.50 => 3850
  image_id     INTEGER REFERENCES media(id) ON DELETE SET NULL,
  is_available INTEGER NOT NULL DEFAULT 1 CHECK (is_available IN (0, 1)),
  is_featured  INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0, 1)),
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes (category_id, sort_order);
