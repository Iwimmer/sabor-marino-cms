// Página de INICIO: es la página marcada como "inicio" en el panel.
import { notFound } from 'next/navigation';
import { apiGet, getSite } from '@/lib/server-api';
import BlockRenderer from '@/components/site/BlockRenderer';

export async function generateMetadata() {
  const page = await apiGet('/public/home').catch(() => null);
  return { description: page?.metaDescription ?? undefined };
}

export default async function HomePage() {
  const [page, site] = await Promise.all([apiGet('/public/home'), getSite()]);
  if (!page) notFound();
  return <BlockRenderer blocks={page.blocks} site={site} />;
}
