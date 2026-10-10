// Ilustraciones ORIGINALES de los platos, dibujadas con código (SVG).
// El seed las convierte en imágenes WebP con sharp, igual que una foto subida desde el panel.
// Si en seed-images/photos/ existe una foto con el mismo nombre (ej. ceviche-clasico.jpg),
// se usa la foto en lugar de la ilustración.

// Generador aleatorio con semilla: el mismo dibujo sale siempre igual
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const W = 1600;
const H = 1067;

// ---------- Piezas reutilizables ----------
const defs = `
  <defs>
    <radialGradient id="table" cx="50%" cy="45%" r="75%">
      <stop offset="0" stop-color="#E9DCC7"/><stop offset="1" stop-color="#CDB89A"/>
    </radialGradient>
    <radialGradient id="plate" cx="45%" cy="40%" r="60%">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E8EEF2"/>
    </radialGradient>
    <radialGradient id="leche" cx="50%" cy="45%" r="55%">
      <stop offset="0" stop-color="#FBF6E3"/><stop offset="1" stop-color="#EFE3BC"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#5B4630" flood-opacity="0.28"/>
    </filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#3D2B1A" flood-opacity="0.25"/>
    </filter>
  </defs>`;

function table(r) {
  // mesa de madera clara con vetas suaves
  let veins = '';
  for (let i = 0; i < 14; i++) {
    const y = 40 + i * 78 + r() * 30;
    veins += `<path d="M0 ${y} C ${W * 0.3} ${y + 18 - r() * 36}, ${W * 0.6} ${y - 20 + r() * 40}, ${W} ${y + 6}" stroke="#B89E7C" stroke-opacity="${0.18 + r() * 0.15}" stroke-width="${2 + r() * 3}" fill="none"/>`;
  }
  return `<rect width="${W}" height="${H}" fill="url(#table)"/>${veins}`;
}

const napkin = (x, y, rot, color = '#3E6E8E') =>
  `<g transform="translate(${x} ${y}) rotate(${rot})"><rect width="260" height="420" rx="10" fill="${color}" opacity="0.9"/>
   ${[60, 120, 180, 240, 300, 360].map((yy) => `<line x1="0" x2="260" y1="${yy}" y2="${yy}" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="6"/>`).join('')}</g>`;

const lime = (x, y, s = 1, rot = 0) =>
  `<g transform="translate(${x} ${y}) scale(${s}) rotate(${rot})" filter="url(#soft)">
    <path d="M-70 0 A70 70 0 0 1 70 0 Z" fill="#6FA83A"/><path d="M-58 0 A58 58 0 0 1 58 0 Z" fill="#D7EBA4"/>
    ${[-60, -30, 0, 30, 60].map((a) => `<line x1="0" y1="0" x2="${Math.sin((a * Math.PI) / 180) * 52}" y2="${-Math.cos((a * Math.PI) / 180) * 52}" stroke="#B9D77A" stroke-width="4"/>`).join('')}
  </g>`;

const leaf = (x, y, rot, s = 1) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 0 C 14 -22, 40 -22, 52 0 C 40 18, 14 18, 0 0 Z" fill="#3F8F3A"/><path d="M4 0 L46 0" stroke="#2C6B2A" stroke-width="2"/></g>`;

function cilantro(r, cx, cy, spread, n = 10) {
  let out = '';
  for (let i = 0; i < n; i++) out += leaf(cx + (r() - 0.5) * spread, cy + (r() - 0.5) * spread, r() * 360, 0.7 + r() * 0.5);
  return out;
}

function onion(r, cx, cy, spread, n = 10) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = cx + (r() - 0.5) * spread;
    const y = cy + (r() - 0.5) * spread;
    const rr = 26 + r() * 30;
    const a = r() * 360;
    out += `<path transform="rotate(${a} ${x} ${y})" d="M${x - rr} ${y} A ${rr} ${rr * 0.55} 0 0 1 ${x + rr} ${y}" stroke="#9B3F7A" stroke-width="9" fill="none" stroke-linecap="round"/>
            <path transform="rotate(${a} ${x} ${y})" d="M${x - rr} ${y} A ${rr} ${rr * 0.55} 0 0 1 ${x + rr} ${y}" stroke="#E7B9D6" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  return out;
}

function fishCubes(r, cx, cy, spread, n = 14, color = '#FAF3EA') {
  let out = '';
  for (let i = 0; i < n; i++) {
    const s = 44 + r() * 26;
    out += `<rect x="${cx + (r() - 0.5) * spread}" y="${cy + (r() - 0.5) * spread}" width="${s}" height="${s * (0.8 + r() * 0.3)}" rx="12"
      transform="rotate(${r() * 90} ${cx} ${cy})" fill="${color}" stroke="#E6D3C0" stroke-width="3" filter="url(#soft)"/>`;
  }
  return out;
}

const camote = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#soft)"><ellipse rx="92" ry="70" fill="#E8792E"/><ellipse rx="78" ry="58" fill="#F39A4C"/><ellipse rx="40" ry="28" fill="#F7B271" opacity="0.7"/></g>`;

function corn(x, y, rot, s = 1) {
  let k = '';
  for (let row = 0; row < 7; row++) for (let col = 0; col < 3; col++) k += `<ellipse cx="${-26 + col * 26}" cy="${-84 + row * 28}" rx="12" ry="13" fill="#F4E3A1" stroke="#D9BE62" stroke-width="2"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" filter="url(#soft)"><rect x="-48" y="-104" width="96" height="210" rx="44" fill="#E9CF7A"/>${k}</g>`;
}

function shrimp(x, y, rot, s = 1) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" filter="url(#soft)">
    <path d="M0 0 C 40 -70, 120 -60, 120 10 C 118 50, 80 60, 60 40 C 80 30, 92 0, 70 -16 C 50 -30, 20 -10, 18 20 Z" fill="#F2855B"/>
    ${[0, 1, 2, 3].map((i) => `<path d="M${30 + i * 20} ${-40 + i * 6} q 10 20 0 40" stroke="#FBC2A6" stroke-width="5" fill="none"/>`).join('')}
    <path d="M18 20 L -8 34 L 6 8 Z" fill="#E36A40"/></g>`;
}

function octopus(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#soft)"><path d="M-50 0 C -50 -40, 50 -40, 50 0 C 50 20, 30 30, 0 30 C -30 30, -50 20, -50 0 Z" fill="#B24A6E"/>
    ${[-30, -10, 10, 30].map((xx) => `<circle cx="${xx}" cy="${8}" r="7" fill="#F5D3DF"/>`).join('')}</g>`;
}

const squid = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#soft)"><circle r="40" fill="none" stroke="#FFF7EE" stroke-width="20"/><circle r="40" fill="none" stroke="#E8D6C4" stroke-width="3"/></g>`;

function mussel(x, y, rot, s = 1) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" filter="url(#soft)">
    <path d="M0 -70 C 60 -60, 70 40, 0 80 C -70 40, -60 -60, 0 -70 Z" fill="#1F2A44"/>
    <path d="M0 -50 C 40 -40, 46 30, 0 58 C -46 30, -40 -40, 0 -50 Z" fill="#F0A35E"/>
    <path d="M0 -50 C 40 -40, 46 30, 0 58" stroke="#3B4A6B" stroke-width="6" fill="none"/></g>`;
}

function bowl(cx, cy, rOuter, innerFill = 'url(#leche)') {
  return `<g filter="url(#shadow)"><circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="url(#plate)"/></g>
    <circle cx="${cx}" cy="${cy}" r="${rOuter - 26}" fill="#E4EAEE"/>
    <circle cx="${cx}" cy="${cy}" r="${rOuter - 48}" fill="${innerFill}"/>`;
}

function plate(cx, cy, r) {
  return `<g filter="url(#shadow)"><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#plate)"/></g>
    <circle cx="${cx}" cy="${cy}" r="${r - 70}" fill="#FFFFFF" stroke="#E2E8EC" stroke-width="4"/>`;
}

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}${body}</svg>`;

// ---------- Platos ----------
function ceviche(seed, mixto = false) {
  const r = rng(seed);
  const cx = 820;
  const cy = 540;
  let food = fishCubes(r, cx - 20, cy, 300, mixto ? 9 : 16);
  if (mixto) {
    food += [[-140, -60], [90, 110], [140, -80]].map(([dx, dy]) => octopus(cx + dx, cy + dy, 1)).join('');
    food += [[-60, 120], [40, -150]].map(([dx, dy]) => squid(cx + dx, cy + dy, 0.9)).join('');
    food += [[-190, 60, 20], [60, 10, 200], [160, 40, -30]].map(([dx, dy, a]) => shrimp(cx + dx, cy + dy, a, 0.9)).join('');
  }
  food += onion(r, cx, cy - 10, 320, 12) + cilantro(r, cx, cy, 300, 12);
  return svg(`${table(r)}${napkin(1250, 120, 12)}${bowl(cx, cy, 400)}${food}
    ${camote(cx - 230, cy + 190, 1)}${corn(cx + 250, cy + 170, 40, 0.9)}${lime(300, 860, 1.2, -20)}${lime(1360, 860, 1, 30)}`);
}

function tiradito(seed) {
  const r = rng(seed);
  let slices = '';
  for (let i = 0; i < 6; i++) {
    slices += `<ellipse cx="${470 + i * 130}" cy="${530 + (r() - 0.5) * 20}" rx="80" ry="120" fill="#FAF1E8" stroke="#E7D2BF" stroke-width="4" transform="rotate(${-12 + r() * 6} ${470 + i * 130} 530)" filter="url(#soft)"/>`;
  }
  let sauce = '';
  for (let i = 0; i < 26; i++) sauce += `<circle cx="${400 + r() * 820}" cy="${430 + r() * 220}" r="${6 + r() * 16}" fill="#F2B51E" opacity="0.9"/>`;
  return svg(`${table(r)}${napkin(100, 90, -14, '#5C7F64')}
    <g filter="url(#shadow)"><rect x="300" y="330" width="1000" height="410" rx="200" fill="url(#plate)"/></g>
    <rect x="340" y="370" width="920" height="330" rx="165" fill="#F6C437" opacity="0.85"/>${slices}${sauce}${cilantro(r, 800, 530, 700, 14)}
    ${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="${520 + i * 150}" cy="${640}" rx="13" ry="14" fill="#F4E3A1" stroke="#D9BE62" stroke-width="2"/>`).join('')}${lime(1350, 880, 1, 15)}`);
}

function causa(seed) {
  const r = rng(seed);
  const cx = 800;
  const cy = 540;
  let avocado = '';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    avocado += `<ellipse cx="${cx + Math.cos(a) * 120}" cy="${cy + Math.sin(a) * 120}" rx="70" ry="30" fill="#9CC25B" stroke="#5E8A2E" stroke-width="5" transform="rotate(${(a * 180) / Math.PI + 90} ${cx + Math.cos(a) * 120} ${cy + Math.sin(a) * 120})"/>`;
  }
  let dots = '';
  for (let i = 0; i < 12; i++) {
    const a = r() * Math.PI * 2;
    dots += `<circle cx="${cx + Math.cos(a) * 330}" cy="${cy + Math.sin(a) * 330}" r="${10 + r() * 10}" fill="#F2C12E"/>`;
  }
  return svg(`${table(r)}${napkin(1230, 600, 18, '#3E6E8E')}${plate(cx, cy, 440)}${dots}
    <g filter="url(#shadow)"><circle cx="${cx}" cy="${cy}" r="230" fill="#F5D046"/></g><circle cx="${cx}" cy="${cy}" r="210" fill="#F8DA5E"/>
    ${avocado}${shrimp(cx - 70, cy - 20, -20, 1)}${shrimp(cx + 10, cy + 40, 160, 0.9)}${leaf(cx + 40, cy - 70, 30, 1.3)}${lime(260, 860, 1, 10)}`);
}

function lecheDeTigre(seed) {
  const r = rng(seed);
  let bits = '';
  for (let i = 0; i < 10; i++) bits += `<rect x="${640 + r() * 300}" y="${420 + r() * 260}" width="40" height="34" rx="10" fill="#FFFFFF" opacity="0.85"/>`;
  return svg(`${table(r)}${napkin(1180, 160, 10)}
    <g filter="url(#shadow)"><path d="M600 260 L1000 260 L960 840 Q800 880 640 840 Z" fill="#FFFFFF" fill-opacity="0.55" stroke="#DCE6EC" stroke-width="8"/></g>
    <path d="M612 380 L988 380 L958 830 Q800 868 642 830 Z" fill="#F4EBC8"/>${bits}${onion(r, 800, 600, 200, 6)}${cilantro(r, 800, 400, 260, 6)}
    ${corn(380, 640, -30, 0.9)}${lime(1220, 820, 1.1, -20)}`);
}

function choritos(seed) {
  const r = rng(seed);
  const cx = 800;
  const cy = 540;
  let m = '';
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    m += mussel(cx + Math.cos(a) * 220, cy + Math.sin(a) * 200, (a * 180) / Math.PI + 90, 1.25);
  }
  return svg(`${table(r)}${plate(cx, cy, 450)}${m}${mussel(cx, cy, 20, 1.2)}${onion(r, cx, cy, 380, 10)}${cilantro(r, cx, cy, 380, 10)}${lime(1360, 860, 1, 20)}`);
}

function arrozConMariscos(seed) {
  const r = rng(seed);
  const cx = 800;
  const cy = 540;
  let rice = '';
  for (let i = 0; i < 420; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 320;
    rice += `<ellipse cx="${cx + Math.cos(a) * d}" cy="${cy + Math.sin(a) * d}" rx="9" ry="4" transform="rotate(${r() * 180} ${cx + Math.cos(a) * d} ${cy + Math.sin(a) * d})" fill="${['#E08A3C', '#EAA04E', '#D9772F', '#F0B565'][Math.floor(r() * 4)]}"/>`;
  }
  return svg(`${table(r)}${napkin(90, 600, -10, '#5C7F64')}${plate(cx, cy, 460)}
    <circle cx="${cx}" cy="${cy}" r="340" fill="#E48F3F"/>${rice}
    ${mussel(cx - 160, cy - 120, 30, 1)}${mussel(cx + 180, cy + 110, -40, 1)}${shrimp(cx - 60, cy + 60, 10, 1.1)}${shrimp(cx + 60, cy - 110, 200, 1)}
    ${squid(cx + 170, cy - 60, 0.8)}${squid(cx - 190, cy + 120, 0.8)}
    ${[0, 1, 2, 3].map((i) => `<rect x="${cx - 120 + i * 70}" y="${cy - 20 + (i % 2) * 40}" width="80" height="14" rx="7" fill="#C2332E" transform="rotate(${-30 + i * 20} ${cx - 80 + i * 70} ${cy})"/>`).join('')}
    ${cilantro(r, cx, cy, 380, 12)}${lime(1340, 860, 1.1, -10)}`);
}

function golden(r, cx, cy, spread, n, color = '#D9963A') {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = cx + (r() - 0.5) * spread;
    const y = cy + (r() - 0.5) * spread;
    out += `<path d="M${x - 50} ${y} C ${x - 40} ${y - 46}, ${x + 46} ${y - 50}, ${x + 56} ${y - 6} C ${x + 60} ${y + 40}, ${x - 30} ${y + 52}, ${x - 50} ${y} Z" fill="${color}" stroke="#B86F22" stroke-width="4" filter="url(#soft)"/>
      <circle cx="${x - 10}" cy="${y - 8}" r="6" fill="#F3C474" opacity="0.8"/><circle cx="${x + 20}" cy="${y + 10}" r="5" fill="#F3C474" opacity="0.8"/>`;
  }
  return out;
}

function jalea(seed) {
  const r = rng(seed);
  const cx = 800;
  const cy = 540;
  let yuca = '';
  for (let i = 0; i < 7; i++) yuca += `<rect x="${cx - 360 + r() * 120}" y="${cy - 200 + i * 60}" width="190" height="44" rx="14" fill="#F3D78A" stroke="#D3A84C" stroke-width="4" transform="rotate(${-20 + r() * 40} ${cx - 280} ${cy})" filter="url(#soft)"/>`;
  return svg(`${table(r)}${plate(cx, cy, 470)}${yuca}${golden(r, cx + 40, cy, 380, 16)}${onion(r, cx + 40, cy - 40, 180, 8)}
    ${[0, 1, 2, 3, 4, 5].map(() => `<rect x="${cx + (r() - 0.3) * 160}" y="${cy - 60 + (r() - 0.5) * 120}" width="22" height="22" rx="4" fill="#D8433B"/>`).join('')}
    ${cilantro(r, cx + 40, cy - 40, 200, 8)}${lime(cx + 300, cy + 280, 0.9, 30)}`);
}

function chicharron(seed) {
  const r = rng(seed);
  const cx = 780;
  const cy = 540;
  return svg(`${table(r)}${napkin(1200, 120, 14)}${plate(cx, cy, 440)}${golden(r, cx - 30, cy + 10, 400, 14, '#DDA040')}
    <g filter="url(#shadow)"><circle cx="${cx + 250}" cy="${cy - 200}" r="95" fill="#FFFFFF"/></g><circle cx="${cx + 250}" cy="${cy - 200}" r="75" fill="#F4F0DC"/>
    ${[0, 1, 2, 3, 4, 5].map(() => `<circle cx="${cx + 220 + r() * 60}" cy="${cy - 230 + r() * 60}" r="6" fill="#7DA24A"/>`).join('')}
    ${lime(cx - 230, cy + 260, 1, -30)}${lime(cx + 280, cy + 220, 0.9, 40)}`);
}

function sudado(seed) {
  const r = rng(seed);
  const cx = 800;
  const cy = 540;
  let tomato = '';
  for (let i = 0; i < 6; i++) tomato += `<circle cx="${cx + (r() - 0.5) * 420}" cy="${cy + (r() - 0.5) * 420}" r="${34 + r() * 10}" fill="#D9473A" stroke="#F08A6C" stroke-width="8" opacity="0.95"/>`;
  return svg(`${table(r)}${napkin(90, 140, -12, '#5C7F64')}${bowl(cx, cy, 440, '#C9572F')}
    <circle cx="${cx}" cy="${cy}" r="300" fill="#D76A3A" opacity="0.6"/>${tomato}
    <g filter="url(#soft)"><path d="M${cx - 230} ${cy} C ${cx - 180} ${cy - 120}, ${cx + 180} ${cy - 120}, ${cx + 230} ${cy} C ${cx + 180} ${cy + 110}, ${cx - 180} ${cy + 110}, ${cx - 230} ${cy} Z" fill="#FBF3EA" stroke="#E6D0BC" stroke-width="5"/></g>
    ${[0, 1, 2, 3, 4].map((i) => `<path d="M${cx - 150 + i * 75} ${cy - 60} q 20 60 0 120" stroke="#EBDCCC" stroke-width="4" fill="none"/>`).join('')}
    ${onion(r, cx, cy - 40, 300, 8)}${cilantro(r, cx, cy, 340, 12)}`);
}

function drink(seed, liquid, garnish) {
  const r = rng(seed);
  return svg(`${table(r)}${napkin(1180, 520, 16)}
    <g filter="url(#shadow)"><path d="M560 200 L1040 200 L990 880 Q800 920 610 880 Z" fill="#FFFFFF" fill-opacity="0.5" stroke="#DCE6EC" stroke-width="8"/></g>
    <path d="M574 330 L1026 330 L988 868 Q800 904 612 868 Z" fill="${liquid}"/>
    ${[0, 1, 2, 3, 4].map(() => `<rect x="${640 + r() * 300}" y="${360 + r() * 140}" width="70" height="64" rx="12" fill="#FFFFFF" opacity="0.35"/>`).join('')}
    <rect x="640" y="215" width="320" height="22" rx="11" fill="#FFFFFF" opacity="0.5"/>${garnish}`);
}

function piscoSour(seed) {
  const r = rng(seed);
  return svg(`${table(r)}${napkin(140, 560, -14, '#3E6E8E')}
    <g filter="url(#shadow)"><path d="M520 260 Q800 640 1080 260 Z" fill="#FFFFFF" fill-opacity="0.55" stroke="#DCE6EC" stroke-width="8"/>
      <rect x="784" y="520" width="32" height="300" fill="#EEF3F6"/><ellipse cx="800" cy="830" rx="190" ry="34" fill="#EEF3F6"/></g>
    <path d="M556 300 Q800 610 1044 300 Z" fill="#EFE7B4"/><path d="M556 300 Q800 360 1044 300 Q800 250 556 300 Z" fill="#FFFDF4"/>
    ${[0, 1, 2].map((i) => `<circle cx="${740 + i * 60}" cy="${300 + (i % 2) * 8}" r="11" fill="#8E3B1F"/>`).join('')}${lime(1240, 820, 1.1, 20)}`);
}

function suspiro(seed) {
  const r = rng(seed);
  return svg(`${table(r)}${napkin(1180, 140, 10, '#5C7F64')}
    <g filter="url(#shadow)"><path d="M600 280 L1000 280 L960 860 Q800 900 640 860 Z" fill="#FFFFFF" fill-opacity="0.55" stroke="#DCE6EC" stroke-width="8"/></g>
    <path d="M626 560 L974 560 L958 850 Q800 886 642 850 Z" fill="#D08A3E"/>
    <path d="M620 560 C 640 420, 720 470, 760 380 C 790 300, 860 380, 880 330 C 920 390, 990 420, 980 560 Z" fill="#FFF9F2" stroke="#EADFD2" stroke-width="5"/>
    ${[0, 1, 2, 3, 4, 5, 6].map(() => `<circle cx="${680 + r() * 260}" cy="${430 + r() * 100}" r="4" fill="#B8742E"/>`).join('')}`);
}

function picarones(seed) {
  const r = rng(seed);
  const cx = 800;
  const cy = 540;
  let rings = '';
  [[-150, -90], [130, -110], [-120, 140], [150, 120], [10, 10]].forEach(([dx, dy]) => {
    rings += `<g filter="url(#soft)"><ellipse cx="${cx + dx}" cy="${cy + dy}" rx="150" ry="120" fill="#D58A3A"/><ellipse cx="${cx + dx}" cy="${cy + dy}" rx="54" ry="40" fill="url(#plate)"/>
      <ellipse cx="${cx + dx - 40}" cy="${cy + dy - 60}" rx="60" ry="18" fill="#F0B866" opacity="0.6"/></g>`;
  });
  return svg(`${table(r)}${plate(cx, cy, 460)}${rings}
    <path d="M${cx - 300} ${cy - 80} C ${cx - 100} ${cy - 220}, ${cx + 120} ${cy + 40}, ${cx + 320} ${cy - 120}" stroke="#5A2A10" stroke-width="22" fill="none" stroke-linecap="round" opacity="0.85"/>
    <path d="M${cx - 260} ${cy + 160} C ${cx - 40} ${cy + 20}, ${cx + 140} ${cy + 260}, ${cx + 300} ${cy + 120}" stroke="#5A2A10" stroke-width="18" fill="none" stroke-linecap="round" opacity="0.85"/>
    <g filter="url(#shadow)"><circle cx="1330" cy="230" r="110" fill="#FFFFFF"/></g><circle cx="1330" cy="230" r="86" fill="#5A2A10"/>`);
}

// ---------- Escenas ----------
function hero() {
  const w = 1920;
  const h = 1080;
  const r = rng(7);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}
    <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#F6D3A8"/><stop offset="1" stop-color="#F3B98B"/></linearGradient>
    <linearGradient id="sea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3C7DA6"/><stop offset="1" stop-color="#1D4E73"/></linearGradient>
    <rect width="${w}" height="380" fill="url(#sky)"/><circle cx="1480" cy="330" r="120" fill="#FBE3B6"/>
    <rect y="330" width="${w}" height="200" fill="url(#sea)"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${r() * w} ${360 + i * 20} q 40 -8 80 0" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="4" fill="none"/>`).join('')}
    <path d="M0 330 L220 250 L420 300 L560 230 L700 330 Z" fill="#7C8F86" opacity="0.7"/>
    <g transform="translate(0 470)"><rect width="${w}" height="${h - 470}" fill="url(#table)"/></g>
    <g transform="translate(40 380) scale(0.86)">${ceviche(21).replace(/<\/?svg[^>]*>/g, '').replace(defs, '').replace(/<rect width="1600" height="1067" fill="url\(#table\)"\/>/, '')}</g>
    <g transform="translate(1000 420) scale(0.8)">${arrozConMariscos(23).replace(/<\/?svg[^>]*>/g, '').replace(defs, '').replace(/<rect width="1600" height="1067" fill="url\(#table\)"\/>/, '')}</g>
  </svg>`;
}

function local() {
  const r = rng(3);
  const w = 1600;
  const h = 1067;
  let tiles = '';
  for (let x = 0; x < w; x += 80) tiles += `<rect x="${x}" y="760" width="78" height="78" fill="${(x / 80) % 2 ? '#FFFFFF' : '#2F6D96'}" opacity="0.9"/><circle cx="${x + 39}" cy="799" r="16" fill="${(x / 80) % 2 ? '#2F6D96' : '#FFFFFF'}" opacity="0.8"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}
    <rect width="${w}" height="${h}" fill="#F3EEE6"/>
    <rect x="120" y="120" width="560" height="520" rx="260" fill="#9CC9E3"/><rect x="120" y="420" width="560" height="220" fill="#2F6D96"/>
    <rect x="920" y="120" width="560" height="520" rx="260" fill="#9CC9E3"/><rect x="920" y="420" width="560" height="220" fill="#2F6D96"/>
    <circle cx="1300" cy="330" r="60" fill="#FBE3B6"/>
    <rect x="110" y="110" width="580" height="540" rx="270" fill="none" stroke="#FFFFFF" stroke-width="22"/>
    <rect x="910" y="110" width="580" height="540" rx="270" fill="none" stroke="#FFFFFF" stroke-width="22"/>
    ${tiles}<rect y="838" width="${w}" height="${h - 838}" fill="#C9A77E"/>
    ${[260, 800, 1340].map((x) => `<g filter="url(#shadow)"><ellipse cx="${x}" cy="900" rx="190" ry="40" fill="#8E6A45"/><rect x="${x - 14}" y="900" width="28" height="160" fill="#6E5034"/></g>`).join('')}
    ${[[380, 300, -20], [1220, 330, 30]].map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0 C 60 -30, 140 -20, 180 0 C 140 20, 60 30, 0 0 Z" fill="#F28C6B"/><path d="M180 0 L 220 -24 L 220 24 Z" fill="#F28C6B"/><circle cx="40" cy="-4" r="6" fill="#1D3B53"/></g>`).join('')}
    ${[0, 1, 2].map((i) => `<path d="M${200 + i * 600} 700 q 30 -60 60 0 q 30 -60 60 0" fill="#4E8F57"/>`).join('')}
    </svg>`;
}

/** Logo: un pez estilizado dentro de un círculo (sin texto) */
const logo = () => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <circle cx="256" cy="256" r="240" fill="#0F4C75"/><circle cx="256" cy="256" r="206" fill="none" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="6"/>
  <path d="M110 262 C 170 160, 320 150, 380 250 C 320 350, 170 360, 110 262 Z" fill="#F28C6B"/>
  <path d="M370 250 L 430 200 L 418 256 L 430 312 Z" fill="#F28C6B"/>
  <circle cx="175" cy="244" r="14" fill="#0F4C75"/>
  <path d="M230 200 q 30 56 0 112 M280 196 q 30 60 0 120" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M150 380 q 50 -26 100 0 t 100 0 t 100 0" stroke="#3282B8" stroke-width="14" fill="none" stroke-linecap="round"/>
</svg>`;

/** Catálogo: nombre de archivo -> { svg, alt } */
export const ILLUSTRATIONS = {
  'hero': { svg: hero, alt: 'Mesa con ceviche y arroz con mariscos frente al mar de Chorrillos' },
  'local': { svg: local, alt: 'Salón de Sabor Marino con ventanas al mar y azulejos azules' },
  'logo': { svg: logo, alt: 'Logo de Sabor Marino: un pez sobre fondo azul' },
  'ceviche-clasico': { svg: () => ceviche(101), alt: 'Ceviche clásico con camote, choclo y cebolla roja' },
  'ceviche-mixto': { svg: () => ceviche(202, true), alt: 'Ceviche mixto con pulpo, calamar y langostinos' },
  'tiradito-al-aji-amarillo': { svg: () => tiradito(303), alt: 'Tiradito bañado en crema de ají amarillo' },
  'leche-de-tigre': { svg: () => lecheDeTigre(404), alt: 'Vaso de leche de tigre' },
  'causa-de-langostinos': { svg: () => causa(505), alt: 'Causa limeña con palta y langostinos' },
  'choritos-a-la-chalaca': { svg: () => choritos(606), alt: 'Choritos a la chalaca' },
  'arroz-con-mariscos': { svg: () => arrozConMariscos(707), alt: 'Arroz con mariscos' },
  'jalea-mixta': { svg: () => jalea(808), alt: 'Jalea mixta con yuca frita y sarza criolla' },
  'chicharron-de-pescado': { svg: () => chicharron(909), alt: 'Chicharrón de pescado con salsa tártara' },
  'sudado-de-pescado': { svg: () => sudado(111), alt: 'Sudado de pescado' },
  'chicha-morada-jarra': { svg: () => drink(222, '#5B1E4D', lime(1260, 300, 0.9, 10)), alt: 'Chicha morada' },
  'limonada-frozen': { svg: () => drink(333, '#CFE6A4', leaf(760, 300, -30, 2.2) + leaf(840, 290, 200, 2)), alt: 'Limonada frozen con hierbabuena' },
  'pisco-sour': { svg: () => piscoSour(444), alt: 'Pisco sour' },
  'suspiro-a-la-limena': { svg: () => suspiro(555), alt: 'Suspiro a la limeña' },
  'picarones': { svg: () => picarones(666), alt: 'Picarones con miel de chancaca' },
};
