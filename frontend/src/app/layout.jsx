// LAYOUT RAÍZ (Server Component)
// 1) Pide a la API la configuración del sitio.
// 2) Convierte los colores HEX en variables CSS y las pone en <html style="...">.
// 3) Tailwind usa esas variables (ver globals.css), así que TODO el frontend
//    —web pública y panel— cambia de color sin tocar código.
import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces';
import './globals.css';
import { Toaster } from 'sonner';
import { getSite } from '@/lib/server-api';
import { brandCssVars } from '@/lib/colors';

export async function generateMetadata() {
  const { settings } = await getSite();
  return {
    title: { default: settings.siteName, template: `%s · ${settings.siteName}` },
    description: settings.slogan || undefined,
  };
}

export const viewport = { width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }) {
  const { settings } = await getSite();

  return (
    <html lang="es" style={brandCssVars(settings.colors)}>
      <body className="bg-surface font-sans text-ink">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
