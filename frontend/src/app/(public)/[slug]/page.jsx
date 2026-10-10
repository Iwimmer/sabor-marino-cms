// Cualquier otra página creada en el panel: /carta, /nosotros, /promociones...
// El "slug" de la URL se busca en la base de datos; si no existe o está en borrador -> 404.
import { notFound } from 'next/navigation';
import { apiGet } from '@/lib/server-api';
import BlockRenderer from '@/components/site/BlockRenderer';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await apiGet(`/public/pages/${encodeURIComponent(slug)}`).catch(() => null);
  return page ? { title: page.title, description: page.metaDescription ?? undefined } : {};
}

export default async function DynamicPage({ params }) {
  const { slug } = await params;
  const page = await apiGet(`/public/pages/${encodeURIComponent(slug)}`);
  if (!page) notFound();

  // Si el primer bloque ya tiene título (se mostrará como <h1>), no hace falta la franja con el nombre de la página
  const firstHasTitle = Boolean(page.blocks[0]?.content?.title);
  return (
    <>
      {!firstHasTitle && (
        <div className="bg-primary text-on-primary">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <h1 className="font-display text-4xl font-semibold sm:text-6xl">{page.title}</h1>
            {page.metaDescription && <p className="mt-3 max-w-2xl text-lg opacity-85">{page.metaDescription}</p>}
          </div>
        </div>
      )}
      <BlockRenderer blocks={page.blocks} />
      {!page.blocks.length && <p className="mx-auto max-w-6xl px-4 py-24 text-center text-ink/60">Esta página aún no tiene contenido.</p>}
    </>
  );
}
