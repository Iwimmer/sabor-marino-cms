// Layout del panel (Server Component). El proxy ya verificó la sesión y nos pasa
// el rol y el nombre del usuario en cabeceras; aquí solo armamos el "cascarón".
import { headers } from 'next/headers';
import { getSite } from '@/lib/server-api';
import AdminShell from '@/components/admin/AdminShell';
import { ConfirmProvider } from '@/components/ui';

export const metadata = { robots: { index: false } };

export default async function PanelLayout({ children }) {
  const h = await headers();
  const user = { role: h.get('x-user-role') ?? 'EDITOR', name: decodeURIComponent(h.get('x-user-name') ?? '') };
  const { settings } = await getSite();

  return (
    <ConfirmProvider>
      <AdminShell user={user} siteName={settings.siteName}>{children}</AdminShell>
    </ConfirmProvider>
  );
}
