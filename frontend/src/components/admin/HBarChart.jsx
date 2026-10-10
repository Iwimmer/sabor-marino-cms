'use client';
// Gráfico de barras horizontales (una sola serie) con Recharts.
// Reglas de visualización aplicadas:
//  - Una serie = un solo color (el de la marca). Sin leyenda: el título ya dice qué es.
//  - Barras delgadas con extremos redondeados de 4px, separadas por aire.
//  - Grilla y ejes discretos; los textos usan colores de texto, no el de la serie.
//  - Tooltip al pasar el mouse + valor escrito al final de cada barra.
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import { contrastRatio } from '@/lib/colors';

function useBrandBarColor() {
  const [color, setColor] = useState('#334155');
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    const primary = css.getPropertyValue('--brand-primary').trim();
    const secondary = css.getPropertyValue('--brand-secondary').trim();
    // Si el color de marca casi no contrasta con el fondo blanco, usamos otro que sí se vea
    const pick = [primary, secondary].find((c) => c && contrastRatio(c, '#FFFFFF') >= 3) ?? '#334155';
    setColor(pick);
  }, []);
  return color;
}

export default function HBarChart({ data, unit }) {
  const color = useBrandBarColor();
  const height = Math.max(160, data.length * 44);

  if (!data.length) return <p className="py-8 text-center text-sm text-slate-500">Aún no hay datos.</p>;

  return (
    <div style={{ height }} role="img" aria-label={data.map((d) => `${d.label}: ${d.value} ${unit}`).join(', ')}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }} barCategoryGap="28%">
          <CartesianGrid horizontal={false} stroke="#E2E8F0" />
          <XAxis type="number" allowDecimals={false} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="label" width={110} tick={{ fill: '#334155', fontSize: 13 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: '#F1F5F9' }}
            formatter={(v) => [`${v} ${unit}`, '']}
            separator=""
            contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }}
          />
          <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} maxBarSize={22}>
            <LabelList dataKey="value" position="right" fill="#334155" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
