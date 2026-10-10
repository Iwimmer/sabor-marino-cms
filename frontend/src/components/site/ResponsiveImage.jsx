// Imagen responsive: el navegador elige la versión (480, 1024 o 1920 px) según el ancho
// de la pantalla gracias a srcset + sizes. En un celular descarga la de 480 px.
export default function ResponsiveImage({ image, sizes = '100vw', className = '', priority = false, alt }) {
  if (!image) return null;
  const variants = [...image.variants].sort((a, b) => a.width - b.width);
  const main = variants.find((v) => v.size === 'md') ?? variants.at(-1);
  return (
    <img
      src={main.url}
      srcSet={variants.map((v) => `${v.url} ${v.width}w`).join(', ')}
      sizes={sizes}
      width={main.width}
      height={main.height}
      alt={alt ?? image.alt ?? ''}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
    />
  );
}
