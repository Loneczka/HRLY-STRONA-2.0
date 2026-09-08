import React from 'react';
import { motion } from 'motion/react';
import { Activity, TrendingUp, Heart } from 'lucide-react';

export const HrlyHeroGraphic: React.FC = () => {
  return (
    <div className="relative w-full lg:max-w-md h-[480px] flex items-center justify-center overflow-visible bg-transparent select-none">
      {/* Background radial glow */}
      <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-[#3B2F8C]/12 blur-[80px] animate-pulse" />
      <div className="absolute bottom-[10%] right-[5%] w-64 h-64 rounded-full bg-[#F4A574]/12 blur-[75px] animate-pulse delay-75" />

      {/* Dotted Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#3B2F8C 2px, transparent 2px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Decorative bead/sphere behind bottom-right */}
      <div className="absolute bottom-[12%] right-[20%] w-14 h-14 rounded-full bg-gradient-to-br from-[#F4A574]/40 to-[#3B2F8C]/40 blur-[10px] opacity-70 animate-pulse" />
      <div className="absolute bottom-[14%] right-[22%] w-8 h-8 rounded-full bg-[#14183D] opacity-90 shadow-lg flex items-center justify-center border border-white/10" />

      {/* Decorative bead/sphere behind top-left */}
      <div className="absolute top-[12%] left-[20%] w-16 h-16 rounded-full bg-gradient-to-tr from-[#3B2F8C]/30 to-[#E3DEEE]/30 blur-[8px] opacity-80" />

      {/* MAIN 3D PERSPECTIVE WRAPPER (Gentler angle) */}
      <div className="relative isometric-container w-full h-full flex items-center justify-center">
        <motion.div 
          className="relative isometric-card w-[320px] h-[320px] flex items-center justify-center"
          style={{
            transform: 'rotateX(38deg) rotateY(0deg) rotateZ(-20deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Base Grid Underlay (Page Sheet) */}
          <div 
            className="absolute w-[320px] h-[320px] bg-[#FBFAF8]/30 border border-[#EFEAE1]/50 rounded-[40px] shadow-lg overflow-hidden"
            style={{
              transform: 'translateZ(0px)',
            }}
          >
            <div 
              className="absolute inset-0 opacity-[0.06] rounded-[40px]"
              style={{
                backgroundImage: `linear-gradient(to right, #3B2F8C 1px, transparent 1px), linear-gradient(to bottom, #3B2F8C 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
              }}
            />
          </div>

          {/* Main Card: "Analityka Pulsu" with floating motion */}
          <motion.div
            className="absolute w-[290px] h-[290px] bg-white border border-[#EFEAE1]/90 rounded-[32px] p-5 shadow-[0_30px_60px_-15px_rgba(20,24,61,0.18)] flex flex-col justify-between"
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
              <span className="text-[9px] font-display font-extrabold text-[#3B2F8C] uppercase tracking-widest block mb-0.5">
                Kondycja Zespołu
              </span>
              <div className="text-base font-display font-bold text-[#14183D] tracking-tight">
                Analityka Pulsu
              </div>
            </div>

            {/* Grid display with Animating Live Wave */}
            <div 
              className="relative h-[115px] bg-[#FBFAF8]/95 border border-[#EFEAE1]/75 rounded-2xl p-2.5 overflow-hidden my-2.5"
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)',
                backgroundSize: '9px 9px'
              }}
            >
              {/* LIVE DANE badge */}
              <div className="absolute top-2.5 right-2.5 bg-[#D1FAE5] text-[7px] text-[#047857] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                DANE LIVE
              </div>

              {/* Heartbeat SVG Wave Line (Animating) */}
              <svg className="w-full h-full relative z-10" viewBox="0 0 200 80" preserveAspectRatio="none">
                {/* Secondary wave - Indigo (Animating) */}
                <path
                  d="M 20 50 L 35 50 L 42 60 L 50 45 L 58 45 L 72 25 L 100 25 L 106 38 L 112 48 L 120 38 L 160 32 L 200 32"
                  fill="none"
                  stroke="#8A82C7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-30 pulse-wave-1"
                />

                {/* Primary bright wave - Peach Orange (Animating) */}
                <path
                  d="M 20 50 L 35 50 L 42 60 L 50 45 L 58 45 L 72 25 L 100 25 L 106 38 L 112 48 L 120 38 L 160 32 L 200 32"
                  fill="none"
                  stroke="#F4A574"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_5px_rgba(244,165,116,0.8)] pulse-wave-2"
                />

                {/* Traveling dot traveling the signal line */}
                <circle
                  cx="20"
                  r="3.5"
                  fill="#3B2F8C"
                  cy="40"
                  className="drop-shadow-[0_0_4px_#3B2F8C] traveling-dot"
                />

                {/* Fixed Wave Dot */}
                <circle cx="20" cy="50" r="3.5" fill="#14183D" className="drop-shadow-[0_2px_4px_rgba(20,24,61,0.15)]" />
              </svg>
            </div>

            {/* Bottom details block */}
            <div>
              <div className="border-t border-[#EFEAE1]/75 my-2.5" />
              <div className="flex justify-between items-center text-[10px] text-[#55506E] font-display font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F4A574] shadow-sm" />
                  Uznanie: 3.8
                </span>
                <span className="text-emerald-600 font-extrabold font-mono tracking-tight">
                  +12% wzrostu
                </span>
              </div>
            </div>
          </motion.div>

          {/* Floating Card 1: "ZAUFANIE W FIRMIE" (Top Right) */}
          <motion.div
            className="absolute -top-10 -right-8 w-[175px] bg-gradient-to-br from-[#241F59] to-[#120E37] border border-white/10 rounded-2xl p-3.5 shadow-[0_20px_45px_-10px_rgba(20,24,61,0.5)] text-white space-y-1.5"
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
              <span className="text-[8px] font-bold tracking-widest text-[#6A5E8C] font-display uppercase">
                Zaufanie w firmie
              </span>
              <Heart className="w-3 h-3 text-[#FF5A79] fill-[#FF5A79] animate-pulse" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl font-display font-extrabold leading-none">94%</span>
              <span className="text-[9px] font-bold text-[#00E5A3] font-display">Wysokie</span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#F4A574] to-[#F4A574] rounded-full w-[94%]" />
            </div>
          </motion.div>

          {/* Floating Card 2: "RETENCJA KADRY" (Bottom Left) */}
          <motion.div
            className="absolute -bottom-10 -left-8 w-[185px] bg-white border border-[#EFEAE1]/90 rounded-2xl p-3.5 shadow-[0_20px_40px_-10px_rgba(20,24,61,0.18)] flex items-center justify-between gap-3"
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
              <span className="text-[8px] font-bold tracking-widest text-[#6A5E8C] font-display uppercase block">
                Retencja kadry
              </span>
              <strong className="text-base font-bold text-[#14183D] mt-1 block leading-none">
                stabilna
              </strong>
              <span className="text-[9px] text-emerald-800 font-bold font-display mt-0.5 block leading-none">
                96.4% retencji
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0 shadow-sm border border-emerald-100/50">
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
            </div>
          </motion.div>

          {/* Decorative Waveform Button badge (Top Right, above main card) */}
          <motion.div
            className="absolute top-[18px] -right-3 w-7 h-7 rounded-lg bg-indigo-50 border border-[#C4BBDE]/30 text-[#3B2F8C] flex items-center justify-center shadow-md"
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
            <Activity className="w-3.5 h-3.5 text-[#3B2F8C]" strokeWidth={2.5} />
          </motion.div>

          {/* Decorative "Preview" badge (Left side of main card) */}
          <motion.div
            className="absolute top-[60px] -left-8 bg-white/95 border border-[#EFEAE1]/80 px-2.5 py-1.5 shadow-[0_4px_12px_rgba(20,24,61,0.08)] text-[#14183D] text-[9px] font-bold rounded-lg uppercase tracking-wider font-display"
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
