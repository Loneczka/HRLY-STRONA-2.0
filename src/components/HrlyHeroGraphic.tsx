import React from 'react';
import { motion } from 'motion/react';
import { Activity, TrendingUp, Heart } from 'lucide-react';

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

      {/* MAIN 3D PERSPECTIVE WRAPPER (Gentler angle) */}
      <div className="relative isometric-container w-full h-full flex items-center justify-center">
        <motion.div 
          className="relative isometric-card w-[350px] h-[350px] max-sm:w-[330px] max-sm:h-[330px] shrink-0 flex items-center justify-center"
          style={{
            transform: 'rotateX(38deg) rotateY(0deg) rotateZ(-20deg)',
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
              className="relative h-[115px] bg-neutral-bg/95 border border-border-soft/75 rounded-2xl p-2.5 overflow-hidden my-2.5"
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

              {/* Heartbeat SVG Wave Line (Animating) */}
              <svg className="w-full h-full relative z-10" viewBox="0 0 200 80" preserveAspectRatio="none">
                {/* Secondary wave - Indigo (Animating) */}
                <path
                  d="M 20 50 L 35 50 L 42 60 L 50 45 L 58 45 L 72 25 L 100 25 L 106 38 L 112 48 L 120 38 L 160 32 L 200 32"
                  fill="none"
                  stroke="var(--color-muted-indigo)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-30 pulse-wave-1"
                />

                {/* Primary bright wave - indigo (Animating; light card, so no apricot here — the 94% bar on the navy card is the hero's single apricot accent) */}
                <path
                  d="M 20 50 L 35 50 L 42 60 L 50 45 L 58 45 L 72 25 L 100 25 L 106 38 L 112 48 L 120 38 L 160 32 L 200 32"
                  fill="none"
                  stroke="var(--color-indigo-primary)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_5px_color-mix(in_oklab,var(--color-indigo-primary)_50%,transparent)] pulse-wave-2"
                />

                {/* Traveling dot traveling the signal line */}
                <circle
                  cx="20"
                  r="3.5"
                  fill="var(--color-indigo-primary)"
                  cy="40"
                  className="drop-shadow-[0_0_4px_var(--color-indigo-primary)] traveling-dot"
                />

                {/* Fixed Wave Dot */}
                <circle cx="20" cy="50" r="3.5" fill="var(--color-text-dark)" className="drop-shadow-[0_2px_4px_color-mix(in_oklab,var(--color-text-dark)_15%,transparent)]" />
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

          {/* Floating Card 1: "ZAUFANIE W FIRMIE" (Top Right) */}
          <motion.div
            className="absolute -top-10 -right-8 w-[210px] max-sm:w-[190px] bg-navy-card-from bg-gradient-to-br from-navy-card-from to-navy-card-to border border-white/10 rounded-2xl p-3.5 shadow-[0_20px_45px_-10px_color-mix(in_oklab,var(--color-text-dark)_50%,transparent)] text-white space-y-1.5"
            style={{
              transformStyle: 'preserve-3d',
            }}
            animate={{
              translateZ: [40, 56, 40],
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
            className="absolute -bottom-10 -left-8 w-[220px] max-sm:w-[200px] bg-neutral-surface border border-border-soft/90 rounded-2xl p-3.5 shadow-[0_20px_40px_-10px_color-mix(in_oklab,var(--color-text-dark)_18%,transparent)] flex items-center justify-between gap-3"
            style={{
              transformStyle: 'preserve-3d',
            }}
            animate={{
              translateZ: [60, 78, 60],
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

          {/* Decorative Waveform Button badge (Top Right, above main card) */}
          <motion.div
            className="absolute top-[84px] -right-3 w-7 h-7 rounded-lg bg-primary-light/60 border border-border-indigo/30 text-indigo-primary flex items-center justify-center shadow-md"
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

          {/* Decorative "Preview" badge (Left side of main card) */}
          <motion.div
            className="absolute top-[60px] max-sm:top-[125px] -left-16 lg:max-xl:-left-12 max-sm:-left-8 bg-neutral-surface/95 border border-border-soft/80 px-2.5 py-1.5 shadow-[0_4px_12px_color-mix(in_oklab,var(--color-text-dark)_8%,transparent)] text-text-dark type-label rounded-lg uppercase font-display"
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
      </div>
    </div>
  );
};
