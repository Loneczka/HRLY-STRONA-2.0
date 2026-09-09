import React from 'react';
import { SectionLabel, type SectionLabelTone } from './SectionLabel';

/**
 * Szkielet sekcji „social proof" (docs/design-fixes.md, FAZA 7).
 *
 * FAZA 7 jest punktem STOP na TREŚCI: komponent jest gotowy do wypełnienia, ale
 * NIE zawiera żadnych nazw firm, cytatów, stanowisk ani logotypów. Wszystko wchodzi
 * propsami, od właściciela. Dopóki nie ma treści, komponent nie renderuje nic
 * (zwraca `null`), więc można go włączyć w `App.tsx` bez pustej ramki na stronie.
 *
 * Numeracja sekcji: numer jest propsem (`number`), bo włączenie tej sekcji między hero
 * a „Pulpit demonstracyjny" przesuwa całą serię etykiet — patrz komentarz w `App.tsx`.
 *
 * Style: wyłącznie tokeny `@theme` z src/index.css (FAZA 4) i utility `type-*` (FAZA 2).
 * Bez hexów, bez nowych zależności, bez CTA (to sekcja dowodu, nie konwersji).
 *
 * Dostępność:
 *   - `<section aria-labelledby>` → sekcja jest nazwanym landmarkiem,
 *   - nazwą jest widoczna etykieta w `<h2>` (bez dublowania treści dla czytnika ekranu),
 *   - logotypy: `alt` = nazwa firmy (`name`), przy `svg` nazwa idzie do `sr-only`,
 *   - awatar w cytacie jest dekoracyjny (`alt=""`) — autor jest w `<figcaption>`.
 *
 * Uwaga do `metric.source`: przypis renderuje się DOSŁOWNIE, bez doklejania „Źródło:".
 * Pełną formę zapisuje właściciel (np. „Dane wewnętrzne HRly, IV kw. 2025").
 */

export type SocialProofLogo = {
  /** Nazwa firmy — trafia do `alt` (lub `sr-only` przy `svg`). Wymagana. */
  name: string;
  /** Ścieżka do pliku logo (najlepiej SVG, jednokolorowe). */
  src?: string;
  /** Alternatywnie: logo wstawione inline jako `<svg>`. */
  svg?: React.ReactNode;
};

export type SocialProofQuote = {
  text: string;
  author: string;
  role: string;
  company: string;
  avatarSrc?: string;
};

export type SocialProofMetric = {
  /** Np. liczba wdrożeń albo liczba przebadanych pracowników. */
  value: string;
  label: string;
  /** Przypis ze źródłem — renderowany dosłownie, bez prefiksu. */
  source?: string;
};

export type SocialProofProps = {
  /** Numer sekcji dla `SectionLabel`, np. "02". */
  number: string;
  /** Treść etykiety sekcji (bez numeru). */
  label?: string;
  tone?: SectionLabelTone;
  logos?: SocialProofLogo[];
  quote?: SocialProofQuote;
  metric?: SocialProofMetric;
  /** Tylko layout (marginesy, wyrównanie) — nie kolory ani typografia. */
  className?: string;
  /** Nadpisanie id nagłówka, gdyby sekcja pojawiła się na stronie dwa razy. */
  headingId?: string;
};

/** Monochromatyczne wygaszenie logotypów (styl, nie treść) — tylko dla grafik. */
const LOGO_TREATMENT =
  'grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-200';

export function SocialProof({
  number,
  label = 'Zaufali nam',
  tone = 'light',
  logos = [],
  quote,
  metric,
  className = '',
  headingId = 'social-proof-heading',
}: SocialProofProps): React.ReactElement | null {
  const hasLogos = logos.length > 0;

  // Stan pusty: bez treści sekcja nie istnieje w DOM (żadnej pustej ramki, żadnych
  // placeholderów udających prawdziwe marki). FAZA 7 = szkielet, nie zaślepka.
  if (!hasLogos && !quote && !metric) {
    return null;
  }

  return (
    <section
      aria-labelledby={headingId}
      className={[
        'bg-neutral-bg border border-border-soft/80 rounded-[32px] p-8 sm:p-12 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="max-w-3xl mx-auto space-y-10">
        <h2 id={headingId} className="flex justify-center">
          <SectionLabel number={number} tone={tone}>
            {label}
          </SectionLabel>
        </h2>

        {hasLogos && (
          <ul className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 list-none p-0 m-0">
            {logos.map((logo) => (
              <li key={logo.name} className="flex items-center">
                {logo.src ? (
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className={`h-8 w-auto object-contain ${LOGO_TREATMENT}`}
                  />
                ) : logo.svg ? (
                  <span
                    className={`inline-flex items-center text-text-dark [&>svg]:h-8 [&>svg]:w-auto ${LOGO_TREATMENT}`}
                  >
                    {logo.svg}
                    <span className="sr-only">{logo.name}</span>
                  </span>
                ) : (
                  // Fallback tekstowy NIE dostaje wygaszenia — to tekst, a nie grafika:
                  // `opacity-60` zbiłoby kontrast poniżej 4,5:1 (FAZA 1).
                  <span className="type-label font-mono uppercase text-muted-indigo">{logo.name}</span>
                )}
              </li>
            ))}
          </ul>
        )}

        {quote && (
          <figure className="bg-neutral-surface border border-border-soft rounded-3xl p-8 text-left">
            <blockquote className="type-body-lg text-text-dark">{quote.text}</blockquote>
            <figcaption className="flex items-center gap-3 pt-6 mt-6 border-t border-border-soft">
              {quote.avatarSrc && (
                <img
                  src={quote.avatarSrc}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover shrink-0"
                />
              )}
              <span className="flex flex-col">
                <span className="type-body-sm font-semibold text-text-dark">{quote.author}</span>
                <span className="type-label font-mono uppercase text-muted-indigo">
                  {quote.role}, {quote.company}
                </span>
              </span>
            </figcaption>
          </figure>
        )}

        {metric && (
          <div className="flex flex-col items-center gap-1">
            <span className="type-h2 font-mono text-indigo-primary">{metric.value}</span>
            <span className="type-label font-mono uppercase text-muted-indigo">{metric.label}</span>
            {metric.source && (
              <p className="type-body-sm text-muted-purple max-w-md mt-2">{metric.source}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default SocialProof;
