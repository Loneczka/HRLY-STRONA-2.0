import React from 'react';

/**
 * Jedyna etykieta sekcji na stronie publicznej (docs/design-fixes.md, FAZA 5.4).
 *
 * Zastępuje trzy dotychczasowe style (pill + mono, pill + sans-bold, goły mono w brzoskwini)
 * jednym pillem: JetBrains Mono 12/600, tracking 0.08em (`type-label`), uppercase.
 * Numer sekcji jest własnością komponentu — copy przekazuje się BEZ numeru,
 * a komponent renderuje `{number} · {children}`. Dzięki temu przenumerowanie sekcji
 * nie wymaga dotykania treści.
 *
 * Tony (jedno tło dla jasnych sekcji, jedno dla ciemnych — bez wyjątków):
 *   light — `bg-primary-light/60 text-indigo-primary border-border-indigo/35`
 *   dark  — `bg-white/10 text-white border-white/15` (sekcje z `.section-dark`)
 *
 * Kolory wyłącznie z tokenów `@theme` w src/index.css (FAZA 4) — bez hexów.
 * `className` służy tylko do layoutu (marginesy, wyrównanie) — nie do kolorów ani typografii.
 */

export type SectionLabelTone = 'light' | 'dark';

export type SectionLabelProps = {
  /** Numer sekcji, np. "02". Renderowany przed treścią jako `{number} · {children}`. */
  number: string;
  tone?: SectionLabelTone;
  /** Opcjonalna ikona (lucide) po lewej stronie, skalowana do 14px. */
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

const BASE = 'inline-flex items-center gap-2 rounded-full px-3 py-1.5 type-label font-mono uppercase';

const TONE: Record<SectionLabelTone, string> = {
  light: 'bg-primary-light/60 text-indigo-primary border border-border-indigo/35',
  dark: 'bg-white/10 text-white border border-white/15',
};

export function SectionLabel({
  number,
  tone = 'light',
  icon,
  className = '',
  children,
}: SectionLabelProps): React.ReactElement {
  return (
    <span className={[BASE, TONE[tone], className].filter(Boolean).join(' ')}>
      {icon ? (
        <span aria-hidden="true" className="inline-flex shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5">
          {icon}
        </span>
      ) : null}
      <span>
        {number} · {children}
      </span>
    </span>
  );
}

export default SectionLabel;
