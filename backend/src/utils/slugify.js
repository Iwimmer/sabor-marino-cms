// Convierte un texto en "slug" para URLs: "Ceviche Clásico!" -> "ceviche-clasico"
export const slugify = (text) =>
  String(text)
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita tildes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
