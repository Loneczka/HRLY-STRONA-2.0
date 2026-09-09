import React, { useState } from 'react';
import { 
  Coins, Target, Award, Laptop, Heart, ShieldCheck, 
  TrendingUp, Zap, MessageSquareText, Fingerprint, Info,
  AlertTriangle, Lightbulb, CheckCircle2, ShieldAlert,
  Sliders, ChevronRight, ChevronDown, BarChart2, Star, BrainCircuit,
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
          bg: 'bg-success-soft border-success/20',
          text: 'text-success',
          accent: 'text-success',
          border: 'border-success/20',
          badge: 'bg-success-soft text-success border-success/20',
          dot: 'bg-success'
        };
      case 'Średni':
        return {
          bg: 'bg-warning-soft border-warning-orange/20',
          text: 'text-warning-orange',
          accent: 'text-warning-orange',
          border: 'border-warning-orange/20',
          badge: 'bg-warning-soft text-warning-orange border-warning-orange/20',
          dot: 'bg-warning-orange'
        };
      case 'Niski':
      case 'Wymaga uwagi':
        return {
          bg: 'bg-danger-soft border-danger-red/20',
          text: 'text-danger-red',
          accent: 'text-danger-red',
          border: 'border-danger-red/20',
          badge: 'bg-danger-soft text-danger-red border-danger-red/20',
          dot: 'bg-danger-red'
        };
      default:
        return {
          bg: 'bg-primary-faint border-border-soft',
          text: 'text-text-dark',
          accent: 'text-muted-purple',
          border: 'border-border-soft',
          badge: 'bg-primary-faint text-text-dark border-border-soft',
          dot: 'bg-muted-purple'
        };
    }
  };

  const overallAvgScore = Number((HR_AREAS.reduce((sum, a) => sum + a.averageScore, 0) / HR_AREAS.length).toFixed(1));

  return (
    <div id="hrly-dashboard-preview" className="w-full bg-neutral-bg border border-border-soft rounded-3xl overflow-hidden shadow-sm">
      
      {/* Dashboard Top Ribbon / Stats summary */}
      <div className="bg-text-dark px-6 py-5 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <span className="type-label uppercase font-mono text-on-dark-muted">PULPIT ANALITYCZNY OPERACYJNY</span>
          <h2 className="font-display type-h3">
            Wyniki Badania Zaangażowania Organizacji
          </h2>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="text-center md:text-right bg-indigo-primary/40 px-4 py-2.5 rounded-xl border border-white/10">
            <span className="block type-label font-mono text-on-dark-muted uppercase">Wskaźnik ogólny</span>
            <div className="flex items-center justify-center md:justify-end gap-1.5 mt-0.5">
              <span className="type-h3 font-display text-white">{overallAvgScore}</span>
              <span className="type-body-sm text-on-dark-muted">/5.0</span>
            </div>
          </div>
          
          <div className="text-center md:text-right bg-indigo-primary/40 px-4 py-2.5 rounded-xl border border-white/10">
            <span className="block type-label font-mono text-on-dark-muted uppercase">Udział w badaniu</span>
            <span className="block type-h3 font-display text-accent-apricot mt-0.5">92% <span className="type-body-sm text-on-dark-muted font-mono">(46/50)</span></span>
          </div>

          <div className="text-center md:text-right bg-indigo-primary/40 px-4 py-2.5 rounded-xl border border-white/10">
            <span className="block type-label font-mono text-on-dark-muted uppercase">Częstotliwość</span>
            <span className="block type-label text-white mt-1 uppercase">Co kwartał (Q-Pulse)</span>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8 space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: List of 11 Areas */}
          <div className="lg:col-span-5 space-y-3.5">
            <label className="type-label uppercase font-mono text-muted-purple">
              Obszary badania (Wybierz obszar, by zobaczyć szczegóły)
            </label>
            
            {/* Mobile Dropdown Selector */}
            <div className="block lg:hidden">
              <div className="relative">
                <select
                  value={selectedAreaId}
                  onChange={(e) => setSelectedAreaId(Number(e.target.value))}
                  className="w-full p-4 rounded-2xl border border-border-indigo/35 bg-neutral-surface type-body-sm font-semibold text-text-dark appearance-none cursor-pointer focus:ring-1 focus:ring-indigo-primary shadow-xs"
                >
                  {HR_AREAS.map((area) => (
                    <option key={area.id} value={area.id}>
                      {String(area.id).padStart(2, '0')} · {area.title} ({area.averageScore.toFixed(1)})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-indigo-primary">
                  <ChevronDown className="w-4 h-4 text-indigo-primary" />
                </div>
              </div>
            </div>

            {/* Desktop List of 11 Areas */}
            <div className="hidden lg:block space-y-2">
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
                        ? 'bg-neutral-surface border-indigo-primary shadow-sm ring-1 ring-indigo-primary/15 translate-x-1' 
                        : 'bg-neutral-surface hover:bg-neutral-surface/60 hover:border-border-indigo border-border-soft/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl transition-colors ${
                        isSelected ? 'bg-indigo-primary text-white' : 'bg-primary-faint text-text-dark'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="block type-body-sm font-semibold text-text-dark">
                          {area.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                          <span className="type-label text-muted-purple font-mono">
                            Status: {area.overallStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`type-body font-bold font-display ${
                        area.averageScore >= 3.8 ? 'text-success' : area.averageScore >= 3.0 ? 'text-warning-orange' : 'text-danger-red'
                      }`}>
                        {area.averageScore.toFixed(1)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-indigo" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Redesigned Detailed Area Score Card */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. WYNIK (Header card displaying average score, status, and brief overview) */}
            <div className="bg-neutral-surface border border-border-soft rounded-2xl p-6 space-y-4 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-primary/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-primary-faint pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-primary/5 text-indigo-primary rounded-xl border border-indigo-primary/10">
                    {React.createElement(iconMap[activeArea.iconName as IconName] || Info, { className: "w-5 h-5 text-indigo-primary" })}
                  </div>
                  <div>
                    <span className="block type-label text-muted-purple font-mono uppercase">Karta Wyniku Obszaru</span>
                    <h3 className="font-display type-h3 text-text-dark">
                      {activeArea.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-neutral-bg px-3 py-1.5 rounded-xl border border-border-soft/50">
                  <div className="text-right">
                    <span className="block type-label uppercase font-mono text-muted-purple">Wynik obszaru</span>
                    <span className="type-h3 font-display text-indigo-primary">
                      {activeArea.averageScore.toFixed(1)} 
                      <span className="type-body-sm text-muted-purple"> /5.0</span>
                    </span>
                  </div>
                  <span className={`type-label font-mono px-2.5 py-1 rounded-md border ${
                    getStatusColors(activeArea.overallStatus).badge
                  }`}>
                    {activeArea.overallStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="relative">
                <span className="absolute -top-3 left-3 bg-neutral-surface px-2 type-label font-mono uppercase text-muted-purple">Diagnoza syntetyczna</span>
                <p className="type-body-sm text-muted-purple italic bg-neutral-bg/70 p-4 rounded-xl border border-border-soft/80">
                  "{activeArea.summaryText}"
                </p>
              </div>
            </div>

            {/* IMPACT SECTION: WPŁYW NA PRACOWNIKA & WPŁYW NA BIZNES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 2. WPŁYW NA PRACOWNIKA */}
              <div className="bg-neutral-surface border border-border-soft rounded-2xl p-5 space-y-3 shadow-xs relative overflow-hidden group hover:border-indigo-primary/40 transition-colors">
                <div className="flex items-center gap-2.5 text-text-dark">
                  <div className="p-2 bg-indigo-primary/5 text-indigo-primary rounded-lg">
                    <Users className="w-4 h-4 shrink-0" />
                  </div>
                  <div>
                    <span className="block type-label font-mono uppercase text-muted-purple">Ludzie i zachowania</span>
                    <h4 className="type-body font-bold uppercase text-text-dark">
                      Wpływ na pracownika
                    </h4>
                  </div>
                </div>
                <p className="type-body-sm text-muted-purple">
                  {activeArea.employeeImpact}
                </p>
              </div>

              {/* 3. WPŁYW NA BIZNES */}
              <div className="bg-neutral-surface border border-border-soft rounded-2xl p-5 space-y-3 shadow-xs relative overflow-hidden group hover:border-indigo-primary/40 transition-colors">
                <div className="flex items-center gap-2.5 text-text-dark">
                  <div className="p-2 bg-indigo-primary/5 text-indigo-primary rounded-lg">
                    <Briefcase className="w-4 h-4 shrink-0 text-indigo-primary" />
                  </div>
                  <div>
                    <span className="block type-label font-mono uppercase text-muted-purple">Finanse i operacje</span>
                    <h4 className="type-body font-bold uppercase text-text-dark">
                      Wpływ na biznes
                    </h4>
                  </div>
                </div>
                <p className="type-body-sm text-muted-purple">
                  {activeArea.businessImpact}
                </p>
              </div>

            </div>

            {/* 4. REKOMENDACJE (Strategic recommendations) */}
            <div className="bg-neutral-surface border-l-4 border-success border border-border-soft rounded-r-2xl p-6 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-success">
                <div className="p-1.5 bg-success-soft text-success rounded-md">
                  <Lightbulb className="w-4 h-4 shrink-0" />
                </div>
                <div>
                  <span className="block type-label font-mono uppercase text-muted-purple">Rozwiązanie strategiczne</span>
                  <h4 className="type-body font-bold uppercase text-text-dark">
                    Rekomendacja dla organizacji
                  </h4>
                </div>
              </div>
              
              <div className="bg-success-soft/30 border border-success-soft/80 rounded-xl p-4 space-y-2">
                <p className="type-body-sm text-muted-purple">
                  {activeArea.whatToDo}
                </p>
                
                <div className="pt-2 border-t border-success-soft/50 flex items-start gap-2 type-body-sm text-muted-purple">
                  <AlertCircle className="w-3.5 h-3.5 text-indigo-primary shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-text-dark">Główna bariera:</strong> {activeArea.whatIsWrong}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. NARZĘDZIA DLA MANAGERA */}
            <div className="bg-text-dark bg-gradient-to-br from-text-dark to-indigo-hover text-white rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-primary/30 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-wrap gap-y-2 items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/10 text-on-dark-muted rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block type-label font-mono uppercase text-on-dark-muted">Menedżerski Toolkit</span>
                    <h4 className="type-body font-bold uppercase text-white">
                      Narzędzia dla managera
                    </h4>
                  </div>
                </div>
                <span className="type-label font-mono text-on-dark-muted bg-white/5 border border-white/15 px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                  PODGLĄD SZABLONÓW
                </span>
              </div>

              <p className="type-body-sm text-on-dark-body">
                Gotowe, operacyjne scenariusze do wdrożenia, pomagające liderom podjąć właściwy dialog z zespołem.
              </p>

              <div className="space-y-2 pt-1">
                {activeArea.managerTools.map((tool, idx) => {
                  return (
                    <div 
                      key={idx} 
                      className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-start gap-3 hover:bg-white/10 hover:border-white/20 transition-all group"
                    >
                      <div className="w-5 h-5 rounded-full bg-indigo-primary/50 flex items-center justify-center font-mono type-label text-on-dark-muted shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="type-body-sm text-white">
                        {tool}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Informacja o pełnej wersji */}
              <div className="bg-white/5 border border-white/15 rounded-xl p-4 flex items-start gap-3 type-body-sm text-white">
                <Info className="w-4 h-4 text-on-dark-muted shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">Narzędzia i pełne szablony</span>
                  Wszystkie profesjonalne pliki PDF, interaktywne kwestionariusze, procedury oraz dedykowane scenariusze rozmów dla liderów są dostępne do pobrania bezpośrednio w pełnej wersji platformy HRly.
                </div>
              </div>
            </div>

            {/* 6. ROZBICIE NA CZYNNIKI */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-y-2 items-center justify-between border-b border-border-soft pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary-faint text-text-dark rounded-md">
                    <Sliders className="w-4 h-4 shrink-0" />
                  </div>
                  <div>
                    <span className="block type-label font-mono uppercase text-muted-purple">Szczegółowa analityka twarda</span>
                    <h4 className="type-body font-bold uppercase text-text-dark">
                      Rozbicie na czynniki cząstkowe
                    </h4>
                  </div>
                </div>
                <span className="type-label font-mono text-muted-purple shrink-0 whitespace-nowrap">
                  {activeArea.factors.length} czynniki analizowane
                </span>
              </div>

              <div className="space-y-3">
                {activeArea.factors.map((factor, idx) => {
                  const factorColors = getStatusColors(factor.status);
                  const progressColor = factor.score >= 3.8 ? 'bg-success' : factor.score >= 3.0 ? 'bg-warning-orange' : 'bg-danger-red';

                  return (
                    <div key={idx} className="bg-neutral-surface border border-border-soft/75 p-4 rounded-xl space-y-3 shadow-xs hover:border-border-indigo/50 transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${factorColors.accent}`} />
                          <span className="type-body-sm font-semibold text-text-dark">{factor.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`type-body-sm font-mono font-bold ${
                            factor.score >= 3.8 ? 'text-success' : factor.score >= 3.0 ? 'text-warning-orange' : 'text-danger-red'
                          }`}>
                            {factor.score.toFixed(1)}
                          </span>
                          <span className="type-body-sm text-muted-purple">/5.0</span>
                        </div>
                      </div>

                      {/* Score indicator bar */}
                      <div className="w-full bg-primary-faint h-1.5 rounded-full overflow-hidden">
                        <div className={`${progressColor} h-full rounded-full transition-all duration-500`} style={{ width: `${(factor.score / 5) * 100}%` }} />
                      </div>

                      {/* Practical recommendation action */}
                      <div className="bg-neutral-bg p-3 rounded-lg border border-border-soft/40 type-body-sm text-muted-purple flex gap-2">
                        <Sliders className="w-3.5 h-3.5 text-indigo-primary shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-indigo-primary">Dla lidera:</strong> {factor.actionableRecommendation}
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
