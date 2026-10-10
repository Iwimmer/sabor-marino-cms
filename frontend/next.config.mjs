// Configuración de Next.js
// "rewrites" hace que el navegador hable SOLO con Next.js (puerto 3000):
//   /api/*     -> se reenvía a la API Express (puerto 4000)
//   /uploads/* -> imágenes procesadas por sharp
// Así la cookie httpOnly de sesión es del mismo origen y no hay problemas de CORS.
const API_URL = process.env.API_URL || 'http://localhost:4000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API_URL}/api/:path*` },
      { source: '/uploads/:path*', destination: `${API_URL}/uploads/:path*` },
    ];
  },
  poweredByHeader: false,
};

export default nextConfig;
