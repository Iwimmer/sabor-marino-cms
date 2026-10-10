// Página de INICIO: es la página marcada como "inicio" en el panel.
import { notFound } from 'next/navigation';
import { apiGet } from '@/lib/server-api';
import BlockRenderer from '@/components/site/BlockRenderer';

export async function generateMetadata() {
  const page = await apiGet('/public/home').catch(() => null);
  return { description: page?.metaDescription ?? undefined };
}

export default async function HomePage() {
  const page = await apiGet('/public/home');
  if (!page) notFound();
  return <BlockRenderer blocks={page.blocks} />;
}
