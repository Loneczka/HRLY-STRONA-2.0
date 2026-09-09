import React from 'react';
import { motion } from 'motion/react';
import { Activity, TrendingUp, Heart } from 'lucide-react';

/* FAZA 6.3 — dane wykresu w karcie „Analityka Pulsu”.
   Dwa szeregi po 12 punktów miesięcznych, liczone w jednostkach viewBox,
   które odpowiadają pikselom panelu (236×128 = wnętrze panelu na 390 px; skala 1,0 też na 1440),
   więc font-size 12 w SVG renderuje się jako 12 px. */
const SERIES_A = [58, 61, 60, 66, 64, 70, 73, 71, 76, 79, 78, 84]; // zaangażowanie
const SERIES_B = [62, 60, 63, 61, 65, 64, 68, 66, 69, 72, 71, 74]; // eNPS
const MONTHS = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
const Y_TICKS = [60, 70, 80];
const PLOT = { x0: 30, x1: 230, yTop: 26, yBottom: 98, vMin: 55, vMax: 88 };

const px = (i: number) => PLOT.x0 + (i * (PLOT.x1 - PLOT.x0)) / (SERIES_A.length - 1);
const py = (v: number) => PLOT.yBottom - ((v - PLOT.vMin) / (PLOT.vMax - PLOT.vMin)) * (PLOT.yBottom - PLOT.yTop);
const linePath = (series: number[]) =>
  series.map((v, i) => `${i === 0 ? 'M' : 'L'} ${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');

const PATH_A = linePath(SERIES_A);
const PATH_B = linePath(SERIES_B);

export const HrlyHeroGraphic: React.FC = () => {
  return (
    <div className="relative w-full lg:max-w-md h-[480px] flex items-center justify-center overflow-visible bg-transparent select-none">
      {/* Background radial glow */}
      <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-indigo-primary/12 blur-[80px] animate-pulse" />
      <div className="absolute bottom-[10%] right-[5%] w-64 h-64 rounded-full bg-primary-light/40 blur-[75px] animate-pulse delay-75" />

      {/* Dotted Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--color-indigo-primary) 2px, transparent 2px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Decorative bead/sphere behind bottom-right */}
      <div className="absolute bottom-[12%] right-[20%] w-14 h-14 rounded-full bg-gradient-to-br from-primary-light/60 to-indigo-primary/40 blur-[10px] opacity-70 animate-pulse" />
      <div className="absolute bottom-[14%] right-[22%] w-8 h-8 rounded-full bg-text-dark opacity-90 shadow-lg flex items-center justify-center border border-white/10" />

      {/* Decorative bead/sphere behind top-left */}
      <div className="absolute top-[12%] left-[20%] w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-primary/30 to-primary-light/30 blur-[8px] opacity-80" />

      {/* MAIN 3D PERSPECTIVE WRAPPER
          FAZA 6.2: karta zachowuje perspektywę (rotateX), ale rotacja w płaszczyźnie ekranu = 0°,
          więc żaden tekst mockupu nie jest przechylony (rotateZ było -20°). */}
      <div className="relative isometric-container w-full h-full flex items-center justify-center">
        <motion.div
          className="relative isometric-card w-[350px] h-[350px] max-sm:w-[330px] max-sm:h-[330px] shrink-0 flex items-center justify-center"
          style={{
            transform: 'rotateX(14deg) rotateY(0deg) rotateZ(0deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Base Grid Underlay (Page Sheet) */}
          <div
            className="absolute w-[350px] h-[350px] max-sm:w-[330px] max-sm:h-[330px] bg-neutral-bg/30 border border-border-soft/50 rounded-[40px] shadow-lg overflow-hidden"
            style={{
              transform: 'translateZ(0px)',
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.06] rounded-[40px]"
              style={{
                backgroundImage: 'linear-gradient(to right, var(--color-indigo-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--color-indigo-primary) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />
          </div>

          {/* Main Card: "Analityka Pulsu" with floating motion */}
          <motion.div
            className="absolute w-[320px] min-h-[320px] max-sm:w-[300px] max-sm:min-h-[300px] bg-neutral-surface border border-border-soft/90 rounded-[32px] p-5 shadow-[0_30px_60px_-15px_color-mix(in_oklab,var(--color-text-dark)_18%,transparent)] flex flex-col justify-between"
            style={{
              transformStyle: 'preserve-3d',
            }}
            animate={{
              translateZ: [10, 22, 10],
              y: [-4, 4, -4]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Header info */}
            <div>
              <span className="type-label font-display text-indigo-primary uppercase block mb-0.5">
                Kondycja Zespołu
              </span>
              <div className="type-h3 font-display text-text-dark">
                Analityka Pulsu
              </div>
            </div>

            {/* Grid display with Animating Live Wave */}
            <div
              className="relative h-[150px] bg-neutral-bg/95 border border-border-soft/75 rounded-2xl p-2.5 overflow-hidden my-2.5"
              style={{
                backgroundImage: 'linear-gradient(to right, color-mix(in oklab, var(--color-text-dark) 4%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--color-text-dark) 4%, transparent) 1px, transparent 1px)',
                backgroundSize: '9px 9px'
              }}
            >
              {/* LIVE DANE badge */}
              <div className="absolute top-2.5 right-2.5 bg-success-soft type-label text-success px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                DANE LIVE
              </div>

              {/* FAZA 6.3 — wykres 12-punktowy, dwa szeregi, oś X (miesiące) i oś Y (60/70/80).
                  viewBox 236×128 = wewnętrzny rozmiar panelu (mobile), skala 1,0 na 390 i na 1440,
                  więc font-size 12 renderuje się jako 12 px (nie zmniejszamy tekstu pod layout). */}
              <svg
                className="w-full h-full relative z-10"
                viewBox="0 0 236 128"
                role="img"
                aria-label="Wykres: zaangażowanie i eNPS w 12 miesiącach"
              >
                {/* Siatka pozioma + linia bazowa osi X */}
                <g strokeWidth="1" fill="none">
                  {Y_TICKS.map((v) => (
                    <line
                      key={`grid-${v}`}
                      x1={PLOT.x0}
                      x2={PLOT.x1}
                      y1={py(v)}
                      y2={py(v)}
                      stroke="color-mix(in oklab, var(--color-border-indigo) 55%, transparent)"
                    />
                  ))}
                  <line x1={PLOT.x0} x2={PLOT.x1} y1={PLOT.yBottom} y2={PLOT.yBottom} stroke="var(--color-border-indigo)" />
                </g>

                {/* Oś Y — wartości */}
                <g className="type-label font-mono text-muted-purple" fill="currentColor" textAnchor="end">
                  {Y_TICKS.map((v) => (
                    <text key={`ty-${v}`} x={PLOT.x0 - 6} y={py(v) + 4}>{v}</text>
                  ))}
                </g>

                {/* Oś X — miesiące (co druga etykieta, żeby nie zmniejszać fontu) */}
                <g className="type-label font-mono text-muted-purple" fill="currentColor" textAnchor="middle">
                  {MONTHS.map((m, i) => (i % 2 === 0 ? (
                    <text key={m} x={px(i)} y={PLOT.yBottom + 18}>{m}</text>
                  ) : null))}
                </g>

                {/* Szereg B — eNPS (drugi szereg, statyczny) */}
                <path
                  d={PATH_B}
                  fill="none"
                  stroke="var(--color-muted-indigo)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-70"
                />

                {/* Szereg A — zaangażowanie: pełna linia + dwie animowane fale („live”) */}
                <path
                  d={PATH_A}
                  fill="none"
                  stroke="var(--color-indigo-primary)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={PATH_A}
                  fill="none"
                  stroke="var(--color-indigo-primary)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-30 pulse-wave-1"
                />
                <path
                  d={PATH_A}
                  fill="none"
                  stroke="var(--color-indigo-primary)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_5px_color-mix(in_oklab,var(--color-indigo-primary)_50%,transparent)] pulse-wave-2"
                />

                {/* Punkty szeregu A */}
                <g fill="var(--color-neutral-surface)" stroke="var(--color-indigo-primary)" strokeWidth="1.4">
                  {SERIES_A.map((v, i) => (
                    <circle key={`p-${i}`} cx={px(i)} cy={py(v)} r="2.2" />
                  ))}
                </g>

                {/* Ostatni pomiar */}
                <circle
                  cx={px(SERIES_A.length - 1)}
                  cy={py(SERIES_A[SERIES_A.length - 1])}
                  r="3.4"
                  fill="var(--color-indigo-primary)"
                  className="drop-shadow-[0_2px_4px_color-mix(in_oklab,var(--color-text-dark)_15%,transparent)]"
                />
              </svg>
            </div>

            {/* Bottom details block */}
            <div>
              <div className="border-t border-border-soft/75 my-2.5" />
              <div className="flex justify-between items-center type-label text-muted-purple font-display">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-primary shadow-sm" />
                  Uznanie: 3.8
                </span>
                <span className="text-success font-mono">
                  +12% wzrostu
                </span>
              </div>
            </div>
          </motion.div>

          {/* Decorative Waveform Button badge (Top Right, above main card).
              Poprawka po review: przy 390 px prawa krawędź stoi dokładnie na klipie sekcji,
              a poniżej wychodziła poza nią — na <390 px (max-[390px] = width < 390px) chowamy ją tak jak badge „Preview”
              (element czysto dekoracyjny; przesunięcie do środka zasłoniłoby wykres). */}
          <motion.div
            className="absolute top-[84px] -right-3 max-[390px]:hidden w-7 h-7 rounded-lg bg-primary-light/60 border border-border-indigo/30 text-indigo-primary flex items-center justify-center shadow-md"
            animate={{
              translateZ: [20, 32, 20],
              y: [-2, 2, -2]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          >
            <Activity className="w-3.5 h-3.5 text-indigo-primary" strokeWidth={2.5} />
          </motion.div>

          {/* Decorative "Preview" badge (Left side of main card).
              FAZA 6.2: na <640 px ukryta — po wyprostowaniu mockupu wchodziła na oś Y wykresu
              i tak czy tak wystawała poza klip sekcji (kompromis z FAZY 2 zamknięty). */}
          <motion.div
            className="absolute top-[60px] -left-14 lg:max-xl:-left-12 max-sm:hidden bg-neutral-surface/95 border border-border-soft/80 px-2.5 py-1.5 shadow-[0_4px_12px_color-mix(in_oklab,var(--color-text-dark)_8%,transparent)] text-text-dark type-label rounded-lg uppercase font-display"
            animate={{
              translateZ: [20, 32, 20],
              y: [2, -2, 2]
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8
            }}
          >
            Preview
          </motion.div>

        </motion.div>

        {/* FAZA 6.2 — karty z liczbami POZA bryłą 3D: zero rotacji i zero perspektywy,
            więc „94%” i „96.4%” czytają się pod 0°. Geometria (350×350) taka sama jak karta 3D.
            Poprawka po review: poniżej 640 px odsunięcie kart jest płynne —
            clamp(-8px, 185px - 50vw, 24px). Sekcja hero ma overflow-hidden i szerokość
            vw - 32 px (padding <main>), więc od środka makiety jest 50vw - 16 px miejsca;
            przy połowie ramki 165 px offset musi zejść do ~21 px do wewnątrz przy 320 px.
            Do 378 px wzwyż clamp zwraca -8 px, czyli układ 390/1440 bez zmian. */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[350px] h-[350px] max-sm:w-[330px] max-sm:h-[330px] shrink-0">

            {/* Floating Card 1: "ZAUFANIE W FIRMIE" (Top Right) */}
            <motion.div
              className="absolute -top-16 -right-10 lg:max-xl:-right-6 max-sm:-top-14 max-sm:right-[clamp(-8px,calc(185px_-_50vw),24px)] w-[210px] max-sm:w-[190px] bg-navy-card-from bg-gradient-to-br from-navy-card-from to-navy-card-to border border-white/10 rounded-2xl p-3.5 shadow-[0_20px_45px_-10px_color-mix(in_oklab,var(--color-text-dark)_50%,transparent)] text-white space-y-1.5"
              animate={{
                y: [-6, 6, -6],
                x: [2, -2, 2]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="flex justify-between items-center">
                <span className="type-label text-on-dark-muted font-display uppercase">
                  Zaufanie w firmie
                </span>
                <Heart className="w-3 h-3 text-accent-rose fill-accent-rose animate-pulse" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="type-h3 font-display">94%</span>
                <span className="type-label text-success-on-dark font-display">Wysokie</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-accent-apricot rounded-full w-[94%]" />
              </div>
            </motion.div>

            {/* Floating Card 2: "RETENCJA KADRY" (Bottom Left) */}
            <motion.div
              className="absolute -bottom-[72px] -left-12 max-sm:-bottom-[68px] max-sm:left-[clamp(-8px,calc(185px_-_50vw),24px)] w-[220px] max-sm:w-[200px] bg-neutral-surface border border-border-soft/90 rounded-2xl p-3.5 shadow-[0_20px_40px_-10px_color-mix(in_oklab,var(--color-text-dark)_18%,transparent)] flex items-center justify-between gap-3"
              animate={{
                y: [6, -6, 6],
                x: [-2, 2, -2]
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <div className="space-y-0.5">
                <span className="type-label text-muted-indigo font-display uppercase block">
                  Retencja kadry
                </span>
                <strong className="type-h3 text-text-dark mt-1 block">
                  stabilna
                </strong>
                <span className="type-label text-success font-display mt-0.5 block">
                  96.4% retencji
                </span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-success-soft text-success flex items-center justify-center shrink-0 shadow-sm border border-success/15">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};
