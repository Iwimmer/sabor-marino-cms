// DASHBOARD (Server Component): las estadísticas se piden EN EL SERVIDOR reenviando la
// cookie de sesión, así la página llega ya armada y sin "parpadeo" de carga.
// Solo los gráficos y el aviso son componentes de cliente (necesitan el navegador).
import { Suspense } from 'react';
import Link from 'next/link';
import { FileText, UtensilsCrossed, Image as ImageIcon, Users, Plus, Palette } from 'lucide-react';
import { apiGetAsUser } from '@/lib/server-api';
import { Card, CardHeader, PageHeader, Button } from '@/components/ui';
import HBarChart from '@/components/admin/HBarChart';
import DeniedNotice from '@/components/admin/DeniedNotice';

export const metadata = { title: 'Inicio · Panel' };

const BLOCK_NAMES = { hero: 'Portada', menu: 'Carta', gallery: 'Galería', testimonials: 'Testimonios', schedule: 'Horario', contact: 'Contacto', text: 'Texto' };

function Stat({ icon: Icon, label, value, detail }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm text-slate-500"><Icon className="size-4" aria-hidden /> {label}</div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
      {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
    </Card>
  );
}

export default async function DashboardPage() {
  const data = await apiGetAsUser('/stats');

  return (
    <>
      <Suspense><DeniedNotice /></Suspense>
      <PageHeader
        title="Hola 👋"
        description="Este es el resumen de tu sitio. Desde el menú puedes editar las páginas, la carta y la apariencia."
        actions={<>
          <Button variant="secondary" href="/admin/carta"><Plus className="size-4" /> Agregar plato</Button>
          <Button href="/admin/paginas"><FileText className="size-4" /> Editar páginas</Button>
        </>}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat icon={FileText} label="Páginas" value={data.pages} detail={`${data.publishedPages} publicadas · ${data.blocks} bloques`} />
        <Stat icon={UtensilsCrossed} label="Platos" value={data.dishes} detail={`${data.availableDishes} disponibles hoy`} />
        <Stat icon={ImageIcon} label="Imágenes" value={data.media} detail="En 3 tamaños cada una" />
        <Stat icon={Users} label="Usuarios" value={data.users} detail={`${data.categories} categorías en la carta`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Platos por categoría" description="Cantidad de platos registrados en cada sección de la carta" />
          <div className="p-4 sm:p-6">
            <HBarChart data={data.dishesByCategory.map((d) => ({ label: d.category, value: d.total }))} unit="platos" />
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Bloques usados" description="Tipos de sección en todas las páginas" />
          <div className="p-4 sm:p-6">
            <HBarChart data={data.blocksByType.map((b) => ({ label: BLOCK_NAMES[b.type] ?? b.type, value: b.total }))} unit="bloques" />
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Últimas páginas editadas" actions={<Button variant="ghost" size="sm" href="/admin/apariencia"><Palette className="size-4" /> Cambiar colores</Button>} />
        <ul className="divide-y divide-slate-100">
          {data.recentPages.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/paginas/${p.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50 sm:px-6">
                <span className="truncate font-medium text-slate-800">{p.title}</span>
                <span className="shrink-0 text-xs text-slate-500">
                  {new Date(p.updatedAt.replace(' ', 'T') + 'Z').toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Lima' })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
