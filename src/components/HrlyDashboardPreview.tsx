import React, { useState } from 'react';
import { 
  Coins, Target, Award, Laptop, Heart, ShieldCheck, 
  TrendingUp, Zap, MessageSquareText, Fingerprint, Info,
  AlertTriangle, Lightbulb, CheckCircle2, ShieldAlert,
  Sliders, ChevronRight, BarChart2, Star, BrainCircuit,
  Download, Users, Briefcase, Sparkles, BookOpen, AlertCircle,
  PlayCircle
} from 'lucide-react';
import { HR_AREAS, HRArea, HRFactor } from '../data/hrlyData';

type IconName = 'Coins' | 'Target' | 'Award' | 'Laptop' | 'Heart' | 'ShieldCheck' | 'TrendingUp' | 'Zap' | 'BrainCircuit' | 'MessageSquareText' | 'Fingerprint';

const iconMap: Record<IconName, React.ComponentType<{ className?: string }>> = {
  Coins: Coins,
  Target: Target,
  Award: Award,
  Laptop: Laptop,
  Heart: Heart,
  ShieldCheck: ShieldCheck,
  TrendingUp: TrendingUp,
  Zap: Zap,
  BrainCircuit: BrainCircuit,
  MessageSquareText: MessageSquareText,
  Fingerprint: Fingerprint,
};

export const HrlyDashboardPreview: React.FC = () => {
  const [selectedAreaId, setSelectedAreaId] = useState<number>(3); // Default to "Uznanie i docenianie" (low score, interesting)

  const activeArea = HR_AREAS.find(a => a.id === selectedAreaId) || HR_AREAS[0];

  const getStatusColors = (status: 'Wysoki' | 'Średni' | 'Niski' | 'Dobry' | 'Średni' | 'Wymaga uwagi') => {
    switch (status) {
      case 'Wysoki':
      case 'Dobry':
        return {
          bg: 'bg-emerald-50 border-emerald-200/50',
          text: 'text-emerald-800',
          accent: 'text-emerald-500',
          border: 'border-emerald-200',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'Średni':
        return {
          bg: 'bg-amber-50 border-amber-200/50',
          text: 'text-amber-800',
          accent: 'text-amber-500',
          border: 'border-amber-200',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'Niski':
      case 'Wymaga uwagi':
        return {
          bg: 'bg-rose-50 border-rose-200/50',
          text: 'text-rose-800',
          accent: 'text-rose-500',
          border: 'border-rose-200',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          dot: 'bg-rose-500'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200/50',
          text: 'text-gray-800',
          accent: 'text-gray-500',
          border: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-800 border-gray-200',
          dot: 'bg-gray-500'
        };
    }
  };

  const overallAvgScore = Number((HR_AREAS.reduce((sum, a) => sum + a.averageScore, 0) / HR_AREAS.length).toFixed(1));

  return (
    <div id="hrly-dashboard-preview" className="w-full bg-[#FBFAF8] border border-[#EFEAE1] rounded-3xl overflow-hidden shadow-sm">
      
      {/* Dashboard Top Ribbon / Stats summary */}
      <div className="bg-[#14183D] px-6 py-5 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#F4A574]">PULPIT ANALITYCZNY OPERACYJNY</span>
          <h4 className="font-display font-black text-xl tracking-tight">
            Wyniki Badania Zaangażowania Organizacji
          </h4>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="text-center md:text-right bg-[#3B2F8C]/40 px-4 py-2.5 rounded-xl border border-white/10">
            <span className="block text-[9px] font-mono text-[#A39AB4] uppercase">Wskaźnik ogólny</span>
            <div className="flex items-center justify-center md:justify-end gap-1.5 mt-0.5">
              <span className="text-xl font-display font-black text-white">{overallAvgScore}</span>
              <span className="text-xs text-[#A39AB4]">/5.0</span>
            </div>
          </div>
          
          <div className="text-center md:text-right bg-[#3B2F8C]/40 px-4 py-2.5 rounded-xl border border-white/10">
            <span className="block text-[9px] font-mono text-[#A39AB4] uppercase">Udział w badaniu</span>
            <span className="block text-xl font-display font-black text-[#F4A574] mt-0.5">92% <span className="text-xs text-white/60 font-mono">(46/50)</span></span>
          </div>

          <div className="text-center md:text-right bg-[#3B2F8C]/40 px-4 py-2.5 rounded-xl border border-white/10">
            <span className="block text-[9px] font-mono text-[#A39AB4] uppercase">Częstotliwość</span>
            <span className="block text-xs font-bold text-white mt-1 uppercase">Co kwartał (Q-Pulse)</span>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8 space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: List of 11 Areas */}
          <div className="lg:col-span-5 space-y-3.5">
            <label className="text-[11px] uppercase tracking-wider font-mono font-extrabold text-[#A39AB4]">
              Obszary badania (Wybierz obszar, by zobaczyć szczegóły)
            </label>
            
            <div className="space-y-2">
              {HR_AREAS.map((area) => {
                const isSelected = area.id === selectedAreaId;
                const statusColors = getStatusColors(area.overallStatus);
                const IconComponent = iconMap[area.iconName as IconName] || Info;

                return (
                  <button
                    key={area.id}
                    onClick={() => setSelectedAreaId(area.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'bg-white border-[#3B2F8C] shadow-sm ring-1 ring-[#3B2F8C]/15 translate-x-1' 
                        : 'bg-white hover:bg-white/60 hover:border-gray-300 border-[#EFEAE1]/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl transition-colors ${
                        isSelected ? 'bg-[#3B2F8C] text-white' : 'bg-[#F4F1EC] text-[#14183D]'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="block text-xs font-extrabold text-[#14183D] leading-tight">
                          {area.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                          <span className="text-[10px] text-gray-500 font-mono">
                            Status: {area.overallStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-display font-black ${
                        area.averageScore >= 3.8 ? 'text-emerald-600' : area.averageScore >= 3.0 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {area.averageScore.toFixed(1)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Redesigned Detailed Area Score Card */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. WYNIK (Header card displaying average score, status, and brief overview) */}
            <div className="bg-white border border-[#EFEAE1] rounded-2xl p-6 space-y-4 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B2F8C]/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#F4F1EC] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#3B2F8C]/5 text-[#3B2F8C] rounded-xl border border-[#3B2F8C]/10">
                    {React.createElement(iconMap[activeArea.iconName as IconName] || Info, { className: "w-5 h-5 text-[#F4A574]" })}
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-400 font-mono tracking-widest uppercase">Karta Wyniku Obszaru</span>
                    <h5 className="font-display font-extrabold text-[#14183D] text-lg leading-tight">
                      {activeArea.title}
                    </h5>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#FBFAF8] px-3 py-1.5 rounded-xl border border-[#EFEAE1]/50">
                  <div className="text-right">
                    <span className="block text-[8px] uppercase font-mono text-gray-400">Wynik obszaru</span>
                    <span className="text-lg font-display font-black text-[#3B2F8C]">
                      {activeArea.averageScore.toFixed(1)} 
                      <span className="text-[10px] text-gray-400 font-normal"> /5.0</span>
                    </span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-md border ${
                    getStatusColors(activeArea.overallStatus).badge
                  }`}>
                    {activeArea.overallStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="relative">
                <span className="absolute -top-3 left-3 bg-white px-2 text-[9px] font-mono uppercase text-gray-400">Diagnoza syntetyczna</span>
                <p className="text-xs text-[#55506E] leading-relaxed italic bg-gray-50/70 p-4 rounded-xl border border-gray-100/80">
                  "{activeArea.summaryText}"
                </p>
              </div>
            </div>

            {/* IMPACT SECTION: WPŁYW NA PRACOWNIKA & WPŁYW NA BIZNES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 2. WPŁYW NA PRACOWNIKA */}
              <div className="bg-white border border-[#EFEAE1] rounded-2xl p-5 space-y-3 shadow-xs relative overflow-hidden group hover:border-[#F4A574]/40 transition-colors">
                <div className="flex items-center gap-2.5 text-[#14183D]">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                    <Users className="w-4 h-4 shrink-0" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-mono uppercase tracking-wider text-gray-400">Ludzie i zachowania</span>
                    <h6 className="text-xs font-black uppercase text-[#14183D] tracking-tight">
                      Wpływ na pracownika
                    </h6>
                  </div>
                </div>
                <p className="text-xs text-[#55506E] leading-relaxed">
                  {activeArea.employeeImpact}
                </p>
              </div>

              {/* 3. WPŁYW NA BIZNES */}
              <div className="bg-white border border-[#EFEAE1] rounded-2xl p-5 space-y-3 shadow-xs relative overflow-hidden group hover:border-[#3B2F8C]/40 transition-colors">
                <div className="flex items-center gap-2.5 text-[#14183D]">
                  <div className="p-2 bg-[#3B2F8C]/5 text-[#3B2F8C] rounded-lg">
                    <Briefcase className="w-4 h-4 shrink-0 text-[#F4A574]" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-mono uppercase tracking-wider text-gray-400">Finanse i operacje</span>
                    <h6 className="text-xs font-black uppercase text-[#14183D] tracking-tight">
                      Wpływ na biznes
                    </h6>
                  </div>
                </div>
                <p className="text-xs text-[#55506E] leading-relaxed">
                  {activeArea.businessImpact}
                </p>
              </div>

            </div>

            {/* 4. REKOMENDACJE (Strategic recommendations) */}
            <div className="bg-white border-l-4 border-emerald-500 border border-[#EFEAE1] rounded-r-2xl p-6 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-800">
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                  <Lightbulb className="w-4 h-4 shrink-0" />
                </div>
                <div>
                  <span className="block text-[8px] font-mono uppercase tracking-wider text-gray-400">Rozwiązanie strategiczne</span>
                  <h6 className="text-xs font-black uppercase text-[#14183D] tracking-tight">
                    Rekomendacja dla organizacji
                  </h6>
                </div>
              </div>
              
              <div className="bg-emerald-50/30 border border-emerald-100/80 rounded-xl p-4 space-y-2">
                <p className="text-xs text-[#55506E] leading-relaxed font-medium">
                  {activeArea.whatToDo}
                </p>
                
                <div className="pt-2 border-t border-emerald-100/50 flex items-start gap-2 text-[10px] text-gray-500">
                  <AlertCircle className="w-3.5 h-3.5 text-[#F4A574] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-gray-700">Główna bariera:</strong> {activeArea.whatIsWrong}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. NARZĘDZIA DLA MANAGERA */}
            <div className="bg-gradient-to-br from-[#14183D] to-[#231B5E] text-white rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#F4A574]/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/10 text-[#F4A574] rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-mono uppercase tracking-widest text-white/50">Menedżerski Toolkit</span>
                    <h6 className="text-xs font-extrabold uppercase text-white tracking-wider">
                      Narzędzia dla managera
                    </h6>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-[#F4A574] bg-[#F4A574]/10 border border-[#F4A574]/25 px-2.5 py-0.5 rounded-full font-bold">
                  PODGLĄD SZABLONÓW
                </span>
              </div>

              <p className="text-[11px] text-[#C4BBDE] leading-relaxed">
                Gotowe, operacyjne scenariusze do wdrożenia, pomagające liderom podjąć właściwy dialog z zespołem.
              </p>

              <div className="space-y-2 pt-1">
                {activeArea.managerTools.map((tool, idx) => {
                  return (
                    <div 
                      key={idx} 
                      className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-start gap-3 hover:bg-white/10 hover:border-white/20 transition-all group"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#3B2F8C]/50 flex items-center justify-center font-mono text-[10px] text-[#F4A574] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-xs text-white leading-snug font-medium">
                        {tool}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Informacja o pełnej wersji */}
              <div className="bg-[#F4A574]/15 border border-[#F4A574]/30 rounded-xl p-4 flex items-start gap-3 text-xs text-white leading-relaxed">
                <Info className="w-4 h-4 text-[#F4A574] shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-[#F4A574] block mb-0.5">Narzędzia i pełne szablony</span>
                  Wszystkie profesjonalne pliki PDF, interaktywne kwestionariusze, procedury oraz dedykowane scenariusze rozmów dla liderów są dostępne do pobrania bezpośrednio w pełnej wersji platformy HRly.
                </div>
              </div>
            </div>

            {/* 6. ROZBICIE NA CZYNNIKI */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#EFEAE1] pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#F4F1EC] text-[#14183D] rounded-md">
                    <Sliders className="w-4 h-4 shrink-0" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-mono uppercase tracking-wider text-gray-400">Szczegółowa analityka twarda</span>
                    <h6 className="text-xs font-black uppercase text-[#14183D] tracking-tight">
                      Rozbicie na czynniki cząstkowe
                    </h6>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-gray-400">
                  {activeArea.factors.length} czynniki analizowane
                </span>
              </div>

              <div className="space-y-3">
                {activeArea.factors.map((factor, idx) => {
                  const factorColors = getStatusColors(factor.status);
                  const progressColor = factor.score >= 3.8 ? 'bg-emerald-500' : factor.score >= 3.0 ? 'bg-amber-500' : 'bg-rose-500';

                  return (
                    <div key={idx} className="bg-white border border-[#EFEAE1]/75 p-4 rounded-xl space-y-3 shadow-xs hover:border-[#C4BBDE]/50 transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${factorColors.accent}`} />
                          <span className="text-xs font-extrabold text-[#14183D]">{factor.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono font-bold ${
                            factor.score >= 3.8 ? 'text-emerald-700' : factor.score >= 3.0 ? 'text-amber-700' : 'text-rose-700'
                          }`}>
                            {factor.score.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-gray-300">/5.0</span>
                        </div>
                      </div>

                      {/* Score indicator bar */}
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`${progressColor} h-full rounded-full transition-all duration-500`} style={{ width: `${(factor.score / 5) * 100}%` }} />
                      </div>

                      {/* Practical recommendation action */}
                      <div className="bg-[#FBFAF8] p-3 rounded-lg border border-[#EFEAE1]/40 text-[11px] text-[#55506E] flex gap-2">
                        <Sliders className="w-3.5 h-3.5 text-[#3B2F8C] shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-[#3B2F8C]">Dla lidera:</strong> {factor.actionableRecommendation}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
