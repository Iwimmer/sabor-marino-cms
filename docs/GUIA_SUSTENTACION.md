# Guía de sustentación — CMS Sabor Marino

Preguntas que probablemente haga el profesor, con una respuesta corta y **el archivo exacto** donde se ve en el código. Léela con el proyecto abierto en VS Code.

---

## 1. Arquitectura general

**¿Cómo está organizado el sistema?**
En tres piezas: la base de datos SQLite (`backend/database/`), una API REST en Express (`backend/src/`) y un frontend en Next.js (`frontend/src/`) que contiene la web pública y el panel. El navegador solo habla con Next.js, que reenvía `/api/*` a Express (`frontend/next.config.mjs`).

**¿Qué es el patrón controlador-servicio?**
Cada capa hace una sola cosa. La **ruta** define la URL y su protección; el **controlador** lee `req` y responde con `res`; el **servicio** tiene la lógica y el SQL. Ejemplo completo del login:
`routes/auth.routes.js` → `controllers/auth.controller.js` → `services/auth.service.js` → `services/users.service.js`.

**¿Por qué SQLite y no PostgreSQL?**
La guía lo deja opcional, y el profesor debía poder instalarlo sin configurar un servidor. SQLite es un solo archivo y viene dentro de Node.js 22 (`node:sqlite`), sin compilar nada. El SQL es estándar; para migrar a PostgreSQL bastaría con cambiar algunos tipos (`TEXT` con JSON → `JSONB`, `INTEGER 0/1` → `BOOLEAN`).

## 2. Base de datos

**¿Por qué está en 3FN?** (`backend/database/schema.sql`, comentarios al inicio)
- 1FN: cada columna guarda un solo valor (las redes sociales tienen su propia tabla, no columnas `facebook`, `instagram`…).
- 2FN: todas las tablas tienen clave primaria simple (`id`).
- 3FN: ningún dato depende de otro que no sea la clave. El nombre del rol está en `roles`; `users` solo guarda `role_id`. El nombre de la categoría no se repite en cada plato.

**¿Dónde está el JSON de los bloques?**
En `page_components.content`, validado por la propia base de datos con `CHECK (json_valid(content))`. La columna `type` dice qué bloque es. Además, cada tipo tiene su esquema Zod en `backend/src/validators/blocks.validator.js`.

**¿Por qué los precios están en céntimos?**
Para evitar errores de decimales (`0.1 + 0.2 = 0.30000000000000004`). La API recibe y devuelve soles; convierte en `services/menuCarta.service.js` (`toCents`, `toSoles`).

**¿Qué pasa si intento guardar un color inválido directamente en la BD?**
Lo rechaza el `CHECK (primary_color GLOB '#…')`. Es la última línea de defensa: antes ya lo valida Zod (`validators/content.validator.js`).

## 3. Seguridad

**¿Por qué el JWT va en una cookie httpOnly?** (`backend/src/utils/cookies.js`)
Porque JavaScript del navegador no puede leerla: si alguien inyectara un script (XSS), no podría robar la sesión. Con `localStorage` sí podría. `SameSite=Lax` ayuda contra CSRF.

**¿Cómo se protegen las rutas por rol?**
Con dos capas:
1. **Frontend:** `frontend/src/proxy.js` consulta `/api/auth/me` antes de mostrar cualquier página `/admin`. Sin sesión → login; EDITOR en Apariencia o Usuarios → inicio.
2. **API:** `middlewares/auth.middleware.js` (¿hay sesión?) y `middlewares/role.middleware.js` (¿tiene el rol?). Aunque alguien salte el panel, la API responde 401 o 403.

**¿Qué más protege el login?**
Contraseñas con bcrypt, mismo mensaje para "correo no existe" y "clave incorrecta", y máximo 10 intentos cada 15 minutos (`routes/auth.routes.js`).

## 4. Imágenes

**¿Cómo se procesan con sharp?** (`backend/src/services/media.service.js`, función `create`)
multer recibe el archivo en memoria; sharp confirma que de verdad es una imagen, corrige la orientación y genera 3 versiones WebP (480, 1024 y 1920 px). Se guardan en `media` y `media_variants` dentro de una transacción.

**¿Cómo se usan en la web?** (`frontend/src/components/site/ResponsiveImage.jsx`)
Con `srcset` y `sizes`: el navegador elige la versión según la pantalla. En un celular descarga la de 480 o 1024 px, no la de 1920.

## 5. Colores dinámicos (Look & Feel)

**¿Cómo llega el color de la base de datos al botón?**
1. `frontend/src/app/layout.jsx` (componente de servidor) pide `/api/public/site` y pone los colores como variables CSS en `<html style="--brand-primary: #0F4C75 …">`.
2. `frontend/src/app/globals.css` conecta las variables con Tailwind en `@theme inline` → existen clases como `bg-primary` o `text-accent`.
3. Al guardar en Apariencia, `router.refresh()` vuelve a ejecutar el layout y todo cambia sin recargar.

**¿Y si el dueño elige un color muy claro?**
`frontend/src/lib/colors.js` calcula el contraste WCAG y elige texto blanco u oscuro para los botones (`--brand-on-primary`). El panel también avisa si el contraste baja de 4.5:1.

## 6. Componentes de servidor y de cliente

**¿Cuándo usaste cada uno?**
- **Servidor:** lo que lee datos para pintar la página: layout raíz, web pública (`app/(public)/`), cabecera, pie y bloques. Llegan ya pintados y sin JavaScript extra.
- **Cliente (`'use client'`):** lo que necesita interacción: formularios del panel, arrastrar y soltar, menú ☰, gráficos.

## 7. Responsive

**¿Cómo evitaste el scroll horizontal?**
Diseño mobile-first con `sm:`, `md:`, `lg:`, tablas con `overflow-x-auto` dentro de su tarjeta y `grid-cols-1` (que equivale a `minmax(0,1fr)`) para que las columnas no se ensanchen con textos largos. Se verificó con Playwright en 375, 768 y 1440 px: 39 de 39 pantallas sin scroll horizontal.

## 8. Demostración en vivo (5 minutos)

1. Abrir `http://localhost:3000` y mostrar la web.
2. Entrar a `/admin` con **admin@sabormarino.pe / Admin123\***.
3. **Apariencia** → elegir "Arena y coral" → Guardar → volver a la web: cambió todo el color.
4. **Menú de navegación** → arrastrar "Contacto" arriba de "Nosotros" → la cabecera cambia.
5. **Carta** → apagar "Disponible" en un plato → desaparece de `/carta`.
6. **Imágenes** → subir una foto → mostrar los 3 tamaños y cuánto pesa cada uno.
7. Cerrar sesión, entrar como **editor@sabormarino.pe / Editor123\*** y escribir `/admin/usuarios` en la barra: lo redirige.

## 9. Comandos útiles

| Comando (en `backend/`) | Para qué |
|---|---|
| `npm test` | 58 pruebas automáticas de la API |
| `npm run db:reset` | Volver a los datos de demostración |
| `npm run dev` | API con recarga automática |
