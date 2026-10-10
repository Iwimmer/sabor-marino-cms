'use client';
// CARRUSEL DE LA PORTADA (Client Component: necesita un temporizador y botones).
// Las fotos se superponen dentro del "ojo de buey" y se cambian con un fundido suave.
// Buenas prácticas de accesibilidad para carruseles:
//  - Se pausa al pasar el mouse o al enfocar con el teclado.
//  - Si la persona pidió "reducir movimiento" en su sistema, NO avanza solo.
//  - Puntos con aria-label ("Ver imagen 2 de 4") y aria-current en la foto visible.
import { useEffect, useState } from 'react';
import ResponsiveImage from './ResponsiveImage';

const INTERVAL_MS = 5000;

export default function HeroCarousel({ slides }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  useEffect(() => {
    if (total < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % total), INTERVAL_MS);
    return () => clearInterval(timer); // limpieza: se borra el temporizador al pausar o salir
  }, [total, paused]);

  return (
    <div
      className="relative size-full"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      aria-roledescription="carrusel" aria-label="Fotos del restaurante"
    >
      {slides.map((img, i) => (
        <div key={img.id} aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${i === index ? 'opacity-100' : 'opacity-0'}`}>
          {/* Solo la primera foto se descarga con prioridad; las demás, en segundo plano */}
          <ResponsiveImage image={img} priority={i === 0} sizes="(min-width: 768px) 480px, 78vw" className="size-full rounded-full object-cover" />
        </div>
      ))}

      {total > 1 && (
        <div className="absolute -bottom-12 left-1/2 flex -translate-x-1/2 gap-2 sm:-bottom-14">
          {slides.map((img, i) => (
            <button key={img.id} type="button" onClick={() => setIndex(i)}
              aria-label={`Ver imagen ${i + 1} de ${total}`} aria-current={i === index}
              className="group flex h-6 items-center px-0.5">
              <span className={`block h-2 rounded-full transition-all duration-300 ${i === index ? 'w-7 bg-primary' : 'w-2 bg-primary/30 group-hover:bg-primary/60'}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
