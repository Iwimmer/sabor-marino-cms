# 🐟 CMS Sabor Marino

Sistema Web Autónomo (Full-CMS) para el restaurante **Sabor Marino**: un sitio web público y un panel de administración desde donde una persona sin conocimientos de programación puede cambiar los colores, el logo, el menú de navegación, la carta y el contenido por bloques de cada página.

> Proyecto final · Curso **Desarrollo de Aplicaciones Web** · SENATI
> Estudiante: **Wimmer Román Quispe** · Instructor: **David Arturo Malpartida Calixto**

## 🌍 Demo en vivo

| | Enlace |
|---|---|
| 🍽️ Web pública | **https://sabor-marino.vercel.app** |
| 🔐 Panel de administración | https://sabor-marino.vercel.app/admin |
| ⚙️ API REST (Render) | https://sabor-marino-api.onrender.com/api/health |
| 💻 Código | https://github.com/Iwimmer/sabor-marino-cms |

Usuarios de prueba: **admin@sabormarino.pe / Admin123\*** (ADMIN) · **editor@sabormarino.pe / Editor123\*** (EDITOR)

> ⏱️ La API usa el plan gratuito de Render: si nadie la visitó en 15 minutos, **la primera carga tarda ~50 segundos** mientras despierta. Los cambios hechos en el panel se reinician a los datos de demostración cuando el servicio se reinicia. Para una copia propia y permanente, usa el instalador (abajo).

---

## 📦 Estado del proyecto

| Semana | Hito | Estado |
|---|---|---|
| 1 | Cimientos: base de datos, DER, servidor y autenticación | ✅ Completo |
| 2 | Motor: CRUD de páginas, bloques, carta, menús, colores e imágenes | ✅ Completo |
| 3 | Panel de administración responsive | ✅ Completo |
| 4 | Web pública, colores dinámicos, instalador final y QA | ✅ Completo |
| 5 | Repositorio en GitHub y despliegue en producción (Vercel + Render) | ✅ Completo |

## 🧱 Tecnologías

| Capa | Tecnología | Por qué |
|---|---|---|
| Base de datos | **SQLite** (módulo nativo `node:sqlite`) | Un solo archivo, sin servidor ni instalación extra |
| Backend | **Node.js + Express 5** | API REST con patrón controlador-servicio |
| Seguridad | **JWT en cookie httpOnly**, bcrypt, Helmet, rate limit | Sesión segura y rutas protegidas por rol |
| Validación | **Zod** | Mensajes de error claros por campo |
| Imágenes | **multer + sharp** | Redimensiona a 480/1024/1920 px y convierte a WebP |
| Frontend | **Next.js 16 (App Router) + Tailwind CSS 4** | Componentes de servidor y cliente; colores dinámicos con variables CSS |
| Panel | **dnd-kit, react-colorful, Recharts, sonner, lucide** | Arrastrar y soltar, selector de color, gráficos, notificaciones e íconos |

## ✅ Requisitos

- **Node.js 22.13 o superior** (recomendado: la versión LTS de [nodejs.org](https://nodejs.org))
- Windows, macOS o Linux

No se necesita instalar ninguna base de datos.

## 🚀 Instalación rápida (Windows)

1. Descomprime el proyecto.
2. Doble clic en **`instalar.bat`**: instala dependencias, crea el `.env`, la base de datos con datos demo y compila la web (la primera vez tarda unos minutos).
3. Doble clic en **`iniciar.bat`**: abre la API y la web, y luego el navegador con el sitio (**http://localhost:3000**) y el panel (**http://localhost:3000/admin**).

> Las imágenes de demostración son ilustraciones propias generadas por código. Para usar fotos reales, colócalas en `backend/database/seed-images/photos/` (ver el `LEEME.md` de esa carpeta) y ejecuta `npm run db:reset` dentro de `backend/`.

## 🛠️ Instalación manual (cualquier sistema)

```bash
cd backend
npm install
npm run setup:env     # crea .env con una clave JWT aleatoria
npm run db:setup      # crea las tablas y carga los datos demo
npm run dev           # inicia la API en http://localhost:4000/api

# en otra terminal
cd frontend
cp .env.example .env.local   # en Windows: copy .env.example .env.local
npm install
npm run dev           # web y panel en http://localhost:3000  (panel: /admin)
```

> En producción: `npm run build` y `npm start` dentro de `frontend/`.

### Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| ADMIN | admin@sabormarino.pe | Admin123* |
| EDITOR | editor@sabormarino.pe | Editor123* |

## 🔐 Variables de entorno (`backend/.env.example`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto de la API | `4000` |
| `NODE_ENV` | `development` o `production` | `development` |
| `CLIENT_URL` | URL del frontend (CORS) | `http://localhost:3000` |
| `DATABASE_PATH` | Ruta del archivo SQLite | `./database/cms.db` |
| `JWT_SECRET` | Clave para firmar los tokens | *(cadena aleatoria larga)* |
| `JWT_EXPIRES_IN` | Duración de la sesión | `8h` |

**Frontend (`frontend/.env.example`)**

| Variable | Descripción | Ejemplo |
|---|---|---|
| `API_URL` | URL de la API. Next.js reenvía `/api/*` y `/uploads/*` a esta dirección | `http://localhost:4000` |

## 📜 Scripts del backend

| Comando | Qué hace |
|---|---|
| `npm run dev` | Inicia la API y se reinicia al guardar cambios |
| `npm start` | Inicia la API (modo normal) |
| `npm test` | Ejecuta las pruebas automáticas |
| `npm run db:setup` | Crea tablas y datos demo (no borra datos existentes) |
| `npm run db:reset` | **Borra** la base de datos y la crea de nuevo |

## 🌐 API REST

56 endpoints organizados en módulos: autenticación, configuración, redes sociales, páginas, bloques, menús, categorías, platos, medios, usuarios, dashboard y API pública.

- Documentación completa: [`docs/api/README.md`](docs/api/README.md)
- Colección para **Thunder Client / Postman**: [`docs/api/SaborMarino.postman_collection.json`](docs/api/SaborMarino.postman_collection.json) (74 peticiones con pruebas)

| Acceso | Módulos |
|---|---|
| Público | `/api/public/*` (web del restaurante), `/api/auth/login` |
| ADMIN y EDITOR | Páginas, bloques, menús, carta, medios, dashboard |
| Solo ADMIN | Apariencia (`PUT /api/settings`), redes sociales, usuarios |

## 📁 Estructura

```
restaurante-cms/
├── backend/
│   ├── database/        schema.sql (tablas), seed.js (datos demo), setup.js
│   │   └── seed-images/ ilustraciones de los platos y carpeta photos/ opcional
│   ├── src/
│   │   ├── config/      variables de entorno
│   │   ├── routes/      URLs y su protección
│   │   ├── controllers/ manejo de req/res
│   │   ├── services/    lógica y consultas SQL
│   │   ├── middlewares/ auth, roles, validación, errores
│   │   ├── validators/  esquemas Zod
│   │   ├── utils/       JWT, cookies, errores
│   │   └── lib/db.js    conexión SQLite
│   ├── tests/           pruebas automáticas (node:test): 58 casos
│   └── uploads/         imágenes procesadas
├── frontend/
│   ├── src/app/
│   │   ├── layout.jsx       Lee los colores de la BD y los inyecta como variables CSS
│   │   ├── globals.css      Tailwind conectado a las variables (bg-primary, text-accent…)
│   │   └── admin/           Panel: login, inicio, páginas, menús, carta, imágenes, apariencia, usuarios
│   ├── src/app/(public)/    Web pública: inicio, [slug] y 404
│   ├── src/components/      ui/, admin/ (editor de bloques…) y site/ (cabecera, pie y los 7 bloques)
│   ├── src/lib/             cliente de la API, utilidades de color
│   └── src/proxy.js         Protege /admin según la sesión y el rol
├── docs/
│   ├── der/             Diagrama Entidad-Relación (PNG, PDF, SVG)
│   ├── api/             Documentación y colección Thunder Client / Postman
│   └── GUIA_SUSTENTACION.md  Preguntas frecuentes y dónde está cada cosa en el código
├── instalar.bat
└── iniciar.bat
```

## 🌐 Sitio web público

| Ruta | Contenido |
|---|---|
| `/` | Página marcada como inicio (portada, favoritos, galería, testimonios, horario) |
| `/carta` | Carta completa por categorías |
| `/nosotros`, `/contacto` | Historia, mapa, WhatsApp y horario |
| `/<slug>` | Cualquier página creada desde el panel |

- **Colores dinámicos:** el layout raíz lee los HEX de la BD y los inyecta como variables CSS (`--brand-primary`…); Tailwind los usa con clases como `bg-primary`.
- **Imágenes responsive:** cada imagen tiene `srcset` con 480, 1024 y 1920 px; el celular descarga la liviana.
- **Mobile-first:** menú ☰, botón flotante de WhatsApp en celular y sin scroll horizontal (verificado en 375, 768 y 1440 px).

## 🖥️ Panel de administración

| Sección | Qué permite | Rol |
|---|---|---|
| Inicio | Resumen y gráficos de la carta y los bloques | ADMIN, EDITOR |
| Páginas | Crear páginas y armarlas con bloques (arrastrar para ordenar) | ADMIN, EDITOR |
| Menú de navegación | Ordenar enlaces arrastrando, submenús, enlaces externos | ADMIN, EDITOR |
| Carta | Categorías y platos, precios, fotos, agotado/destacado | ADMIN, EDITOR |
| Imágenes | Biblioteca de fotos (se optimizan en 3 tamaños) | ADMIN, EDITOR |
| Apariencia | Colores con vista previa, logo, contacto y redes | Solo ADMIN |
| Usuarios | Crear, editar y desactivar usuarios | Solo ADMIN |

El panel es responsive: en celular la barra lateral se convierte en un menú ☰ y los formularios aparecen como hojas desde abajo.

## 🗺️ Base de datos

El DER completo está en [`docs/der/DER_SaborMarino.pdf`](docs/der/DER_SaborMarino.pdf). El modelo tiene 12 tablas en Tercera Forma Normal, y el contenido de cada bloque de página se guarda como JSON validado (`CHECK (json_valid(content))`).

## ✅ Calidad

| Verificación | Resultado |
|---|---|
| Pruebas automáticas de la API (`npm test`) | 58 / 58 |
| Colección Thunder Client / Postman (Newman) | 74 peticiones, 0 fallos |
| Pruebas E2E del panel (Playwright) | 16 / 16 |
| Pruebas E2E de la web y administrabilidad (Playwright) | 15 / 15 |
| Pantallas sin scroll horizontal (1440, 768 y 375 px) | 39 / 39 |

## ☁️ Despliegue en producción

```
Navegador ──► Vercel (Next.js, carpeta frontend/) ──/api/* y /uploads/*──► Render (Express + SQLite, carpeta backend/)
```

El navegador solo habla con Vercel; los *rewrites* de `frontend/next.config.mjs` reenvían `/api` y `/uploads` a Render. Así la cookie de sesión es del mismo dominio y no hace falta CORS.

**Render (Web Service, plan Free)**

| Campo | Valor |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm run db:setup && npm start` |
| Health Check Path | `/api/health` |
| Variables | `NODE_VERSION=22`, `NODE_ENV=production`, `JWT_SECRET` (generado), `JWT_EXPIRES_IN=8h` |

**Vercel (proyecto Next.js)**

| Campo | Valor |
|---|---|
| Root Directory | `frontend` |
| Variables | `API_URL=https://sabor-marino-api.onrender.com`, `SHOW_DEMO_USERS=true` |

Ambos servicios tienen **despliegue continuo**: cada `git push` a `main` vuelve a desplegar automáticamente.

## 🧯 Problemas comunes

| Síntoma | Solución |
|---|---|
| `instalar.bat` dice que falta Node.js | Instala la versión LTS desde nodejs.org y vuelve a ejecutarlo |
| "Se necesita Node.js 22.13 o superior" | Actualiza Node.js (el SQLite integrado llegó en esa versión) |
| La web muestra "Sabor Marino" sin datos o colores por defecto | La API no está encendida: revisa la ventana "API Sabor Marino" |
| `EADDRINUSE` (puerto en uso) | Cierra otras apps que usen los puertos 3000 o 4000 |
| El mapa no carga | Requiere conexión a internet (es un mapa de Google insertado) |
| "Demasiados intentos" al iniciar sesión | Es la protección contra fuerza bruta: espera 15 minutos o reinicia la API |
