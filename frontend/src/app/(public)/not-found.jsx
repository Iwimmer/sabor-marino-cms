import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-7xl font-semibold text-primary">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">Esta página no está en la carta</h1>
      <p className="mt-3 text-ink/70">Puede que la dirección esté mal escrita o que la página ya no exista.</p>
      <Link href="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-primary px-7 font-semibold text-on-primary">Volver al inicio</Link>
    </div>
  );
}
