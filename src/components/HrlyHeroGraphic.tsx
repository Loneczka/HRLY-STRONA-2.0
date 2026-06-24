import React from 'react';
import { motion } from 'motion/react';
import { Users, Activity, Sparkles, TrendingUp, Heart } from 'lucide-react';

export const HrlyHeroGraphic: React.FC = () => {
  return (
    <div className="relative w-full lg:max-w-md h-[460px] flex items-center justify-center overflow-hidden rounded-3xl bg-transparent select-none">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#3B2F8C]/15 blur-[60px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[#F4A574]/15 blur-[50px] animate-pulse delay-75" />

      {/* Isometric 3D Space Container */}
      <div className="relative w-full h-full flex items-center justify-center [perspective:1200px]">
        
        {/* Animated Background 3D Grid */}
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#3B2F8C 2px, transparent 2px)`,
            backgroundSize: '24px 24px',
            transform: 'rotateX(35deg) rotateZ(-15deg) translateZ(-40px) scale(1.5)'
          }}
        />

        {/* Outer Floating Orb 1: Orchid/Purple */}
        <motion.div
          animate={{
            y: [-15, 15, -15],
            rotate: [0, 360],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-12 left-8 w-24 h-24 rounded-full bg-gradient-to-tr from-[#3B2F8C]/40 to-[#E3DEEE]/20 blur-sm flex items-center justify-center border border-white/20 backdrop-blur-xs shadow-lg"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shadow-inner">
            <Users className="w-5 h-5 text-[#3B2F8C]" />
          </div>
        </motion.div>

        {/* Outer Floating Orb 2: Peach/Coral */}
        <motion.div
          animate={{
            y: [10, -15, 10],
            x: [-5, 15, -5],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-16 right-4 w-20 h-20 rounded-full bg-gradient-to-br from-[#F4A574]/50 to-[#FBFAF8]/10 blur-xs flex items-center justify-center border border-white/30 backdrop-blur-xs shadow-md"
        >
          <motion.div 
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-10 h-10 rounded-full bg-[#14183D] flex items-center justify-center shadow-md shadow-orange-500/10"
          >
            <Sparkles className="w-4 h-4 text-[#F4A574]" />
          </motion.div>
        </motion.div>

        {/* MAIN ISOMETRIC STACK */}
        <div 
          className="relative w-[340px] h-[340px] flex items-center justify-center"
          style={{
            transform: 'rotateX(30deg) rotateZ(-14deg) skewX(1deg) translateY(-10px)',
            transformStyle: 'preserve-3d'
          }}
        >
          
          {/* Base Layer: Glow Platform (Shadow projection) */}
          <div 
            className="absolute w-72 h-72 rounded-[40px] bg-gradient-to-tr from-[#3B2F8C]/15 to-[#F4A574]/15 filter blur-md"
            style={{ transform: 'translateZ(-60px)' }}
          />

          {/* Layer 1: Solid Base Platform */}
          <div 
            className="absolute w-72 h-72 rounded-[32px] bg-[#FBFAF8]/80 border-2 border-[#EFEAE1] shadow-2xl flex flex-col justify-end p-6 overflow-hidden"
            style={{ 
              transform: 'translateZ(-30px)',
              backfaceVisibility: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(20, 24, 61, 0.12)'
            }}
          >
            {/* Grid pattern inside the platform */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
            
            {/* Minimalist chart background */}
            <div className="space-y-2 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold text-[#A39AB4] uppercase tracking-wider">Pulpit badawczy</span>
                <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">aktywny</span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full w-full overflow-hidden">
                <div className="bg-[#3B2F8C] w-3/4 h-full rounded-full" />
              </div>
              <div className="h-1 bg-gray-100 rounded-full w-2/3 overflow-hidden">
                <div className="bg-[#F4A574] w-1/2 h-full rounded-full" />
              </div>
            </div>
          </div>

          {/* Layer 2: Floating Translucent Glass Dashboard Sheet */}
          <motion.div 
            animate={{
              translateZ: [0, 12, 0],
              y: [0, -4, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-64 h-64 rounded-2xl bg-white/70 border border-white/40 backdrop-blur-md shadow-lg p-5 flex flex-col justify-between"
            style={{ 
              transform: 'translateZ(10px)',
              boxShadow: '0 20px 40px -5px rgba(59, 47, 140, 0.1)'
            }}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#3B2F8C] uppercase tracking-tight">Kondycja Zespołu</span>
                <h5 className="text-sm font-display font-black text-[#14183D] leading-none">Analityka Pulsu</h5>
              </div>
              <div className="p-1.5 rounded-lg bg-indigo-50 text-[#3B2F8C]">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
              </div>
            </div>

            {/* Live Pulses / Heartbeat Wave SVG */}
            <div className="relative h-22 bg-[#14183D]/5 rounded-xl flex items-center justify-center overflow-hidden border border-[#EFEAE1]/60 px-1 my-1.5">
              {/* Background grid lines */}
              <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#3B2F8C_1px,transparent_1px),linear-gradient(to_bottom,#3B2F8C_1px,transparent_1px)] bg-[size:10px_10px]" />
              
              <svg className="w-full h-15 relative z-10" viewBox="0 0 200 60" preserveAspectRatio="none">
                {/* Secondary wave - Dark Indigo */}
                <path
                  d="M 0,30 L 25,30 L 32,15 L 39,45 L 45,30 L 70,30 L 78,30 L 85,5 L 92,55 L 98,30 L 125,30 L 132,22 L 138,38 L 144,30 L 175,30 L 200,30"
                  fill="none"
                  stroke="#3B2F8C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-30 pulse-wave-1"
                />

                {/* Primary bright wave - Peach Coral */}
                <path
                  d="M 0,30 L 25,30 L 32,15 L 39,45 L 45,30 L 70,30 L 78,30 L 85,5 L 92,55 L 98,30 L 125,30 L 132,22 L 138,38 L 144,30 L 175,30 L 200,30"
                  fill="none"
                  stroke="#F4A574"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_5px_rgba(244,165,116,0.9)] pulse-wave-2"
                />

                {/* Sparkling dot traveling the signal line */}
                <circle
                  r="3.5"
                  fill="#3B2F8C"
                  cy="30"
                  className="drop-shadow-[0_0_4px_#3B2F8C] traveling-dot"
                />
              </svg>

              {/* Pulsing indicator flag */}
              <div className="absolute top-1 right-1 bg-emerald-500/15 border border-emerald-500/20 px-1 py-0.5 rounded text-[7px] font-mono font-black text-emerald-700 flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                DANE LIVE
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-[#55506E] border-t border-gray-150/50 pt-2.5">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F4A574] animate-pulse" />
                Uznanie: 3.8
              </span>
              <span className="font-mono text-emerald-600 font-bold">+12% wzrostu</span>
            </div>
          </motion.div>

          {/* Layer 3: Extra floating widgets / Glass cards that overlap */}
          
          {/* Small Floating Card: Users/Heart indicator */}
          <motion.div
            animate={{
              translateZ: [30, 48, 30],
              x: [0, 5, 0],
              y: [0, -3, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute top-6 -right-4 w-36 bg-gradient-to-br from-[#3B2F8C] to-[#14183D] border border-white/10 rounded-xl p-3 shadow-md text-white space-y-1.5"
            style={{ transform: 'translateZ(40px)' }}
          >
            <div className="flex justify-between items-center">
              <span className="text-[8px] uppercase tracking-wider font-mono text-white/60">Zaufanie w firmie</span>
              <Heart className="w-3 h-3 text-red-400 fill-red-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-display font-black">94%</span>
              <span className="text-[7px] text-emerald-300 font-bold">Wysokie</span>
            </div>
            <div className="w-full bg-white/10 h-0.5 rounded-full overflow-hidden">
              <div className="bg-[#F4A574] h-full w-[94%]" />
            </div>
          </motion.div>

          {/* Small Floating Card: Growth Indicator */}
          <motion.div
            animate={{
              translateZ: [20, 32, 20],
              x: [0, -4, 0],
              y: [0, 4, 0]
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.2
            }}
            className="absolute -bottom-4 -left-8 w-40 bg-white border border-[#EFEAE1] rounded-xl p-3.5 shadow-md space-y-1.5 flex items-center justify-between gap-3"
            style={{ transform: 'translateZ(30px)' }}
          >
            <div className="space-y-1">
              <span className="text-[8px] tracking-wider uppercase font-mono text-[#A39AB4] leading-none block">Retencja Kadry</span>
              <strong className="text-xs font-display font-black text-[#14183D] block leading-none">stabilna</strong>
              <span className="text-[8px] text-emerald-600 font-bold block leading-none">96.4% retencji</span>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
};
