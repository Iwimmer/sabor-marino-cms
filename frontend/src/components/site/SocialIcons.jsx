// ÍCONOS DE REDES SOCIALES (vienen de la tabla social_links, se editan en el panel).
// lucide-react ya no incluye logotipos de marcas, así que aquí van dibujados en SVG simple.
// Usan "currentColor": toman el color del texto, por eso combinan con cualquier paleta.
import { Globe, MessageCircle } from 'lucide-react';

const svg = (children) => function Icon(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>;
};

const ICONS = {
  facebook: svg(<path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H7v3.5h2V21h3.5v-8.5h2.6l.4-3.5h-3V7a1 1 0 0 1 1-1H15z" fill="currentColor" stroke="none" />),
  instagram: svg(<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></>),
  tiktok: svg(<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.4 2.6 2.3 4.5 5 4.8" />),
  youtube: svg(<><rect x="2.5" y="5" width="19" height="14" rx="4" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></>),
  x: svg(<path d="M4 4l16 16M20 4 4 20" />),
  whatsapp: MessageCircle,
  otro: Globe,
};

export const SOCIAL_NAMES = { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', x: 'X', whatsapp: 'WhatsApp', otro: 'Web' };

/** Fila de íconos redondos. "itemClassName" define el tamaño y el color de cada botón. */
export default function SocialIcons({ links, className = '', itemClassName = '' }) {
  if (!links?.length) return null;
  return (
    <ul className={`flex items-center ${className}`}>
      {links.map((s) => {
        const Icon = ICONS[s.platform] ?? Globe;
        const name = SOCIAL_NAMES[s.platform] ?? s.platform;
        return (
          <li key={s.id}>
            <a href={s.url} target="_blank" rel="noreferrer" aria-label={name} title={name}
              className={`flex items-center justify-center rounded-full transition hover:-translate-y-0.5 motion-reduce:transition-none ${itemClassName}`}>
              <Icon className="size-[18px]" aria-hidden />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
