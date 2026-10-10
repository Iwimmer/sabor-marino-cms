// Utilidades de color (sirven en el servidor y en el navegador).

export const DEFAULT_COLORS = {
  primary: '#0F4C75',
  secondary: '#3282B8',
  accent: '#F28C6B',
  background: '#FFFFFF',
  text: '#1E293B',
};

const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

// Luminancia relativa según WCAG 2.1
export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Relación de contraste entre dos colores (1 a 21). WCAG AA pide 4.5 para texto normal. */
export function contrastRatio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Devuelve blanco o casi negro: el que se lea mejor sobre el color dado. */
export const readableOn = (hex) =>
  contrastRatio(hex, '#FFFFFF') >= contrastRatio(hex, '#0F172A') ? '#FFFFFF' : '#0F172A';

/** Variables CSS que se inyectan en <html>. */
export function brandCssVars(colors = DEFAULT_COLORS) {
  const c = { ...DEFAULT_COLORS, ...colors };
  return {
    '--brand-primary': c.primary,
    '--brand-secondary': c.secondary,
    '--brand-accent': c.accent,
    '--brand-background': c.background,
    '--brand-text': c.text,
    '--brand-on-primary': readableOn(c.primary),
    '--brand-on-accent': readableOn(c.accent),
  };
}
