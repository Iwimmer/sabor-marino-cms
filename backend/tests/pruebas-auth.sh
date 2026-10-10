#!/bin/bash
# Pruebas manuales de autenticación con curl (requiere la API corriendo: npm run dev)
# En Windows ejecútalo desde Git Bash.
B=http://localhost:4000/api
J=$(mktemp); E=$(mktemp); BODY=$(mktemp)
t(){ echo "### $1"; shift; curl -s -w '\n→ HTTP %{http_code}\n\n' "$@"; }
t "1. Health check" $B/health
t "2. /me sin sesión (debe dar 401)" $B/auth/me
t "3. Login con datos inválidos (400)" -X POST $B/auth/login -H 'Content-Type: application/json' -d '{"email":"no-es-correo","password":""}'
t "4. Login con clave incorrecta (401)" -X POST $B/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@sabormarino.pe","password":"mala"}'
echo "### 5. Login ADMIN correcto (200) — cabecera Set-Cookie:"
curl -s -c $J -D - -o $BODY -X POST $B/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@sabormarino.pe","password":"Admin123*"}' | grep -i 'set-cookie\|^HTTP' | sed -E 's/sm_token=[^;]{20}[^;]*/sm_token=eyJhbGciOi…(recortado)/'
cat $BODY; echo; echo
t "6. /me con sesión ADMIN (200)" -b $J $B/auth/me
t "7. /users con ADMIN (200)" -b $J $B/users
curl -s -c $E -o /dev/null -X POST $B/auth/login -H 'Content-Type: application/json' -d '{"email":"editor@sabormarino.pe","password":"Editor123*"}'
t "8. /users con EDITOR (403 — no tiene permiso)" -b $E $B/users
t "9. Token alterado (401)" -b "sm_token=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwicm9sZSI6IkFETUlOIn0.firmafalsa" $B/auth/me
t "10. Logout (200)" -b $J -c $J -X POST $B/auth/logout
t "11. /me después del logout (401)" -b $J $B/auth/me
t "12. Ruta inexistente (404)" $B/no-existe
