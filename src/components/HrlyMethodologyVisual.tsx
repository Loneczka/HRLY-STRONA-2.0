import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Layers, Award, Activity, Target, Check, 
  TrendingUp, Heart, BookOpen, Compass, Scale, Shield, Sparkles
} from 'lucide-react';

interface TheoryItem {
  id: string;
  name: string;
  category: 'engagement' | 'satisfaction';
  subtitle: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  points: { title: string; text: string }[];
  hrlyText: string;
}

export function HrlyMethodologyVisual() {
  const [activeTab, setActiveTab] = useState<string>('kahn');

  const theories: TheoryItem[] = [
    // --- ENGAGEMENT THEORIES ---
    {
      id: 'kahn',
      name: 'Teoria Zaangażowania Kahna',
      category: 'engagement',
      subtitle: 'Fizyczny, poznawczy i emocjonalny wymiar obecności',
      tagline: 'Głęboka obecność psychologiczna w roli',
      description: 'Zgodnie z klasyczną teorią Williama Kahna, pracownicy angażują się w realizację zadań na trzech poziomach jednocześnie, pod warunkiem, że środowisko pracy zapewnia im poczucie bezpieczeństwa i sensu.',
      icon: User,
      color: '#F4A574',
      points: [
        { title: 'Wymiar Fizyczny', text: 'Poziom energii, witalności i zaangażowania sił fizycznych w wykonywanie zadań.' },
        { title: 'Wymiar Poznawczy', text: 'Zrozumienie celów organizacji, jasność własnej roli zawodowej i jej granic.' },
        { title: 'Wymiar Emocjonalny', text: 'Autentyczna, pozytywna więź emocjonalna z zespołem, liderem oraz marką.' },
        { title: 'Czynniki Sprzyjające', text: 'Poczucie znaczenia pracy, psychologiczne bezpieczeństwo oraz dostępność zasobów.' }
      ],
      hrlyText: 'HRly analizuje poczucie bezpieczeństwa psychologicznego i dopasowanie ról, by sprawdzić, czy pracownicy czują wolność wyrażania siebie bez obaw o konsekwencje.'
    },
    {
      id: 'maslow_eng',
      name: 'Hierarchia Potrzeb Maslowa',
      category: 'engagement',
      subtitle: 'Ewolucja potrzeb pracownika od higieny do wpływu',
      tagline: 'Od stabilizacji finansowej do samorealizacji',
      description: 'Klasyczna piramida potrzeb Abrahama Maslowa zaadaptowana do realiów organizacji. Pokazuje, że stabilność zatrudnienia i relacje stanowią bazę, na której buduje się poczucie misji.',
      icon: Layers,
      color: '#3B2F8C',
      points: [
        { title: 'Potrzeby Fizjologiczne & Bezpieczeństwa', text: 'Adekwatne wynagrodzenie podstawowe, stabilność zatrudnienia i bezpieczne warunki fizyczne.' },
        { title: 'Potrzeby Przynależności & Szacunku', text: 'Atmosfera akceptacji, silne relacje w zespole, szacunek dla wiedzy oraz uznanie lidera.' },
        { title: 'Potrzeby Samorealizacji', text: 'Możliwość pełnego wykorzystania talentów, autonomicznego podejmowania decyzji i stałego rozwoju.' }
      ],
      hrlyText: 'HRly pozwala precyzyjnie zdiagnozować, na którym poziomie piramidy Maslowa leży ewentualne źródło spadku motywacji zespołu.'
    },
    {
      id: 'aon_hewitt',
      name: 'Model Zaangażowania AON-Hewitt',
      category: 'engagement',
      subtitle: 'Klasyczny, zintegrowany model korporacyjny',
      tagline: '6 motorów napędowych zachowań efektywnych',
      description: 'Szeroki framework określający czynniki kształtujące zachowania kluczowe dla retencji i produktywności: "Say" (mów dobrze), "Stay" (pozostań), "Strive" (daj z siebie więcej).',
      icon: TrendingUp,
      color: '#E08F5A',
      points: [
        { title: 'Ludzie & Przywództwo', text: 'Zaufanie do kadry zarządzającej, bezpośrednich przełożonych oraz współpraca.' },
        { title: 'Możliwości & Praca', text: 'Szanse na rozwój kariery, ciekawe zadania oraz elastyczność operacyjna.' },
        { title: 'Wynagrodzenie & Praktyki', text: 'Sprawiedliwy system finansowy, benefity, kultura firmy oraz dbałość o jakość życia.' }
      ],
      hrlyText: 'Badanie eNPS (chęci polecania pracodawcy) oraz analiza efektywności przywództwa w HRly są bezpośrednio oparte na założeniach modelu AON-Hewitt.'
    },
    {
      id: 'zinger',
      name: 'Model Energii Zingera',
      category: 'engagement',
      subtitle: 'Trzy nierozerwalne filary motywacji wewnętrznej',
      tagline: 'Dobrostan, codzienna energia i poczucie sensu',
      description: 'Skoncentrowany na codziennej psychologii pracownika model Davida Zingera wskazuje, że trwałe zaangażowanie wymaga stałego dbania o zasoby osobiste.',
      icon: Compass,
      color: '#10B981',
      points: [
        { title: 'Dobre Samopoczucie (Well-being)', text: 'Komfort psychiczny i fizyczny, dbanie o redukcję toksycznego stresu.' },
        { title: 'Energia Operacyjna', text: 'Poziom witalności, pasji i autentycznego entuzjazmu podczas wyzwań.' },
        { title: 'Znaczenie i Cel', text: 'Wyraźne i głębokie zrozumienie, jak codzienne zadania wpływają na cele firmy.' }
      ],
      hrlyText: 'HRly pomaga wychwycić pierwsze sygnały wypalenia i spadku witalności, zanim przełożą się one na chęć odejścia z organizacji.'
    },

    // --- SATISFACTION THEORIES ---
    {
      id: 'herzberg',
      name: 'Teoria Dwuczynnikowa Herzberga',
      category: 'satisfaction',
      subtitle: 'Rozróżnienie czynników higieny i motywatorów',
      tagline: 'Spokój to nie to samo co zaangażowanie',
      description: 'Zgodnie z teorią Fredericka Herzberga, czynniki higieny (np. warunki pracy, płaca) jedynie zapobiegają niezadowoleniu. Satysfakcję budują wyłącznie motywatory wewnętrzne.',
      icon: Award,
      color: '#6366F1',
      points: [
        { title: 'Czynniki Higieny (Baza)', text: 'Polityka firmy, styl zarządzania, bezpieczeństwo, relacje i płace podstawowe.' },
        { title: 'Motywatory (Rozwój)', text: 'Poczucie sukcesu, uznanie, odpowiedzialność, awanse oraz atrakcyjność zadań.' }
      ],
      hrlyText: 'HRly pomaga odróżnić czynniki higieny od motywatorów, wskazując, kiedy podnoszenie pensji nie pomoże na brak uznania czy stagnację.'
    },
    {
      id: 'jcm',
      name: 'Model Charakterystyki Pracy (JCM)',
      category: 'satisfaction',
      subtitle: 'Wpływ projektowania zadań na satysfakcję',
      tagline: 'Struktura stanowiska a motywacja wewnętrzna',
      description: 'Model Hackmana i Oldhama (Job Characteristics Model) udowadnia, że konstrukcja codziennych zadań decyduje o poczuciu odpowiedzialności i satysfakcji.',
      icon: BookOpen,
      color: '#EC4899',
      points: [
        { title: 'Tożsamość & Znaczenie Zadania', text: 'Realizowanie kompletnych, widocznych projektów mających realny wpływ na innych.' },
        { title: 'Autonomia Decyzyjna', text: 'Swoboda planowania i samodzielnego wybierania metod realizacji celów.' },
        { title: 'Informacja Zwrotna', text: 'Jasny i systematyczny feedback dotyczący rzeczywistych efektów pracy.' }
      ],
      hrlyText: 'HRly analizuje poziom autonomii i jakość informacji zwrotnej, dając liderom gotowe wskazówki, jak usprawnić strukturę zadań.'
    },
    {
      id: 'cognitive_eval',
      name: 'Teoria Oceny Poznawczej',
      category: 'satisfaction',
      subtitle: 'Relacja motywacji wewnętrznej i zewnętrznej',
      tagline: 'Jak nagrody wpływają na pasję pracownika',
      description: 'Wyjaśnia, jak czynniki zewnętrzne (np. premie, benefity) wpływają na wewnętrzną chęć działania. Nagrody nie mogą osłabiać poczucia samodzielności.',
      icon: Heart,
      color: '#F43F5E',
      points: [
        { title: 'Poczucie Kompetencji', text: 'Przekonanie pracownika, że posiada niezbędną wiedzę i stale rozwija swoje talenty.' },
        { title: 'Wewnętrzny Cel', text: 'Radość z wykonywania zadań wynikająca z ich natury, a nie tylko z obietnicy zysku.' }
      ],
      hrlyText: 'HRly pomaga zaprojektować systemy doceniania i premiowania, które wspierają, a nie gaszą, naturalną pasję zawodową.'
    },
    {
      id: 'equity',
      name: 'Teoria Sprawiedliwości Adamsa',
      category: 'satisfaction',
      subtitle: 'Subiektywna ocena sprawiedliwości w zespole',
      tagline: 'Wkład do rezultatów w porównaniu z innymi',
      description: 'Pracownicy stale porównują swój nakład pracy (wysiłek, czas) i zyski (płaca, uznanie) z sytuacją innych osób w firmie oraz na rynku.',
      icon: Scale,
      color: '#F59E0B',
      points: [
        { title: 'Wkład Pracownika', text: 'Czas, wysiłek intelektualny, doświadczenie, lojalność i zaangażowanie.' },
        { title: 'Rezultaty', text: 'Wynagrodzenie zasadnicze, premie, szacunek, awanse i publiczne docenienie.' },
        { title: 'Kontekst Społeczny', text: 'Subiektywne dążenie do zachowania równej, sprawiedliwej relacji.' }
      ],
      hrlyText: 'Silne poczucie niesprawiedliwości bywa najczęstszą przyczyną nagłych odejść z pracy. HRly bada ten czynnik obiektywnie.'
    },
    {
      id: 'vroom',
      name: 'Teoria Oczekiwań Vrooma',
      category: 'satisfaction',
      subtitle: 'Motywacja jako racjonalny wybór wysiłku',
      tagline: 'Wysiłek → Rezultat → Nagroda',
      description: 'Model Victora Vrooma zakłada, że motywacja jest iloczynem trzech stanów: wiary w sukces, pewności otrzymania nagrody oraz wartości tej nagrody.',
      icon: Target,
      color: '#3B82F6',
      points: [
        { title: 'Oczekiwanie (Expectancy)', text: 'Wiara, że dodatkowy wysiłek doprowadzi bezpośrednio do pożądanego efektu.' },
        { title: 'Instrumentalność (Instrumentality)', text: 'Pewność, że osiągnięty sukces przełoży się na sprawiedliwą nagrodę.' },
        { title: 'Walencja (Valence)', text: 'Wartość i atrakcyjność przewidzianej nagrody w oczach pracownika.' }
      ],
      hrlyText: 'HRly weryfikuje bariery kompetencyjne (blokujące oczekiwanie) oraz niejasność systemów premiowych (instrumentalność).'
    },
    {
      id: 'jdr',
      name: 'Model Wymagań-Zasobów (JD-R)',
      category: 'satisfaction',
      subtitle: 'Równoważenie obciążeń wsparciem organizacyjnym',
      tagline: 'Dwie osie: zaangażowanie a wypalenie zawodowe',
      description: 'Model JD-R (Job Demands-Resources) zakłada, że każde stanowisko ma wymagania (stresory) oraz zasoby. Balance decyduje o zdrowiu psychologicznym.',
      icon: Activity,
      color: '#10B981',
      points: [
        { title: 'Wymagania Pracy (Demands)', text: 'Presja czasu, obciążenie psychofizyczne, biurokracja, trudne warunki.' },
        { title: 'Zasoby Pracy (Resources)', text: 'Autonomia decyzyjna, wsparcie liderów, dobre narzędzia i zaufanie.' }
      ],
      hrlyText: 'HRly precyzyjnie diagnozuje przeciążenie pracą w poszczególnych działach i wskazuje, które zasoby pomogą zredukować stres.'
    },
    {
      id: 'sdt',
      name: 'Teoria Autodeterminacji (SDT)',
      category: 'satisfaction',
      subtitle: 'Trzy filary zdrowej motywacji wewnętrznej',
      tagline: 'Uniwersalne ludzkie potrzeby psychologiczne',
      description: 'Teoria Deci i Ryana wskazuje, że zaspokojenie trzech podstawowych potrzeb psychicznych gwarantuje pełną, optymalną i zdrową satysfakcję.',
      icon: Shield,
      color: '#06B6D4',
      points: [
        { title: 'Autonomia (Poczucie Wpływu)', text: 'Poczucie kontroli nad sposobem realizowania swoich zadań i decyzyjność.' },
        { title: 'Kompetencje (Mistrzostwo)', text: 'Poczucie skuteczności, stawiania czoła wyzwaniom i rozwoju osobistego.' },
        { title: 'Relacje (Przynależność)', text: 'Głębokie poczucie bycia ważną częścią zespołu i wzajemnej troski.' }
      ],
      hrlyText: 'HRly analizuje te trzy wskaźniki, pomagając budować kulturę zaufania, w której pracownicy chcą dawać z siebie wszystko.'
    }
  ];

  const active = theories.find(t => t.id === activeTab) || theories[0];
  const IconComponent = active.icon;

  // Group theories into lists
  const engagementList = theories.filter(t => t.category === 'engagement');
  const satisfactionList = theories.filter(t => t.category === 'satisfaction');

  return (
    <div className="bg-[#101435] border border-white/10 rounded-[32px] p-6 lg:p-10 text-white shadow-2xl relative overflow-hidden section-dark">
      {/* Decors */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B2F8C]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F4A574]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid: 12-column setup for maximum readability and space */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 relative z-10">
        
        {/* Left Column: Full readable lists of all 11 theories (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col h-full justify-start border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-8">
          
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-[#F4A574] tracking-widest block">
              Silnik Diagnostyczny HRly
            </span>
            <h2 className="font-display font-black text-xl text-white uppercase tracking-tight">
              11 Naukowych Teorii
            </h2>
            <p className="text-xs text-gray-300">
              Przełączaj i sprawdź, jak zintegrowaliśmy klasyczną wiedzę psychologiczną z praktycznymi pytaniami badawczymi w naszej aplikacji.
            </p>
          </div>

          {/* Group 1: Zaangażowanie (4) */}
          <div className="space-y-2.5">
            <span className="text-[9px] font-mono font-bold uppercase text-[#F4A574]/80 tracking-wider block flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Teorie Zaangażowania ({engagementList.length})
            </span>
            <div className="space-y-1.5">
              {engagementList.map((theory) => {
                const TIcon = theory.icon;
                const isSelected = activeTab === theory.id;
                return (
                  <button
                    key={theory.id}
                    onClick={() => setActiveTab(theory.id)}
                    className={`w-full py-2.5 px-3.5 rounded-xl text-left text-xs transition-all duration-200 cursor-pointer flex items-center justify-between border ${
                      isSelected 
                        ? 'bg-[#1D2254] text-white border-[#F4A574]/30 shadow-md font-bold' 
                        : 'bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-[#F4A574]/25 text-[#F4A574]' : 'bg-white/5 text-gray-400'}`}>
                        <TIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-sans font-black text-white text-[11.5px] uppercase tracking-tight truncate">
                        {theory.name}
                      </span>
                    </div>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#F4A574]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 2: Satysfakcja (7) */}
          <div className="space-y-2.5">
            <span className="text-[9px] font-mono font-bold uppercase text-[#F4A574]/80 tracking-wider block flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" /> Teorie Satysfakcji ({satisfactionList.length})
            </span>
            <div className="space-y-1.5">
              {satisfactionList.map((theory) => {
                const TIcon = theory.icon;
                const isSelected = activeTab === theory.id;
                return (
                  <button
                    key={theory.id}
                    onClick={() => setActiveTab(theory.id)}
                    className={`w-full py-2.5 px-3.5 rounded-xl text-left text-xs transition-all duration-200 cursor-pointer flex items-center justify-between border ${
                      isSelected 
                        ? 'bg-[#1D2254] text-white border-[#F4A574]/30 shadow-md font-bold' 
                        : 'bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-[#F4A574]/25 text-[#F4A574]' : 'bg-white/5 text-gray-400'}`}>
                        <TIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-sans font-black text-white text-[11.5px] uppercase tracking-tight truncate">
                        {theory.name}
                      </span>
                    </div>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#F4A574]" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Beautiful details box (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Active theory identity badge */}
              <div className="p-5 bg-[#14183D]/60 border border-white/5 rounded-[24px] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#F4A574]/15 text-[#F4A574] border border-white/10 shrink-0">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#F4A574] uppercase tracking-wider block">
                      {active.subtitle}
                    </span>
                    <h3 className="font-display font-black text-sm uppercase text-white tracking-tight mt-0.5 leading-none">
                      {active.name}
                    </h3>
                  </div>
                </div>
                <p className="text-[11.5px] text-gray-300 leading-relaxed font-normal">
                  {active.description}
                </p>
              </div>

              {/* Graphical Concept Showcase (Strictly no sliders, just static polished graphics representing the concept) */}
              <div className="bg-[#090C22] border border-white/5 rounded-[24px] p-5 space-y-4">
                <span className="text-[9px] font-mono uppercase text-gray-400 block border-b border-white/5 pb-2">
                  Graficzny zarys modelu i powiązań
                </span>

                {active.id === 'kahn' && (
                  <div className="grid grid-cols-3 gap-3 text-center text-[10px] pt-1">
                    <div className="p-3 bg-[#3B2F8C]/15 border border-white/10 rounded-xl space-y-1">
                      <span className="block font-black text-white text-[10.5px] uppercase">Wymiar Fizyczny</span>
                      <span className="text-[8.5px] text-gray-400 block">Witalność, energia i codzienne działanie</span>
                    </div>
                    <div className="p-3 bg-[#F4A574]/15 border border-white/10 rounded-xl space-y-1">
                      <span className="block font-black text-[#F4A574] text-[10.5px] uppercase">Wymiar Poznawczy</span>
                      <span className="text-[8.5px] text-gray-400 block">Jasność roli zawodowej i jej granic</span>
                    </div>
                    <div className="p-3 bg-[#10B981]/15 border border-white/10 rounded-xl space-y-1">
                      <span className="block font-black text-[#10B981] text-[10.5px] uppercase">Wymiar Emocjonalny</span>
                      <span className="text-[8.5px] text-gray-400 block">Silne więzi z zespołem i liderem</span>
                    </div>
                  </div>
                )}

                {active.id === 'maslow_eng' && (
                  <div className="flex flex-col gap-1.5 pt-1 max-w-sm mx-auto w-full">
                    <div className="py-1 px-3 bg-[#F4A574] text-[9px] text-white font-extrabold uppercase rounded-lg text-center w-[60%] mx-auto shadow-md">
                      Samorealizacja (Wpływ)
                    </div>
                    <div className="py-1 px-3 bg-[#E08F5A] text-[9px] text-white font-extrabold uppercase rounded-lg text-center w-[75%] mx-auto shadow-md">
                      Szacunek i Uznanie
                    </div>
                    <div className="py-1 px-3 bg-[#3B2F8C] text-[9px] text-white font-extrabold uppercase rounded-lg text-center w-[90%] mx-auto shadow-md">
                      Zabezpieczenie społeczne & stabilność
                    </div>
                  </div>
                )}

                {active.id === 'aon_hewitt' && (
                  <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl space-y-0.5">
                      <span className="block font-bold text-xs text-white">SAY</span>
                      <span className="text-[8px] text-gray-400 uppercase font-mono">Mów pozytywnie</span>
                    </div>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl space-y-0.5">
                      <span className="block font-bold text-xs text-white">STAY</span>
                      <span className="text-[8px] text-gray-400 uppercase font-mono">Pozostań</span>
                    </div>
                    <div className="p-2.5 bg-[#F4A574]/20 border border-white/10 rounded-xl space-y-0.5">
                      <span className="block font-bold text-xs text-[#F4A574]">STRIVE</span>
                      <span className="text-[8px] text-gray-300 uppercase font-mono">Przekraczaj oczekiwania</span>
                    </div>
                  </div>
                )}

                {active.id === 'zinger' && (
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px]">
                    <div className="p-2.5 bg-[#10B981]/15 border border-[#10B981]/25 rounded-xl">
                      <span className="block font-bold text-[#10B981] mb-0.5 uppercase tracking-wide">1. Dobrostan</span>
                      <span className="text-[8px] text-gray-400">Komfort psychiczny</span>
                    </div>
                    <div className="p-2.5 bg-[#F4A574]/15 border border-[#F4A574]/25 rounded-xl">
                      <span className="block font-bold text-[#F4A574] mb-0.5 uppercase tracking-wide">2. Energia</span>
                      <span className="text-[8px] text-gray-400">Pasja operacyjna</span>
                    </div>
                    <div className="p-2.5 bg-[#3B82F6]/15 border border-[#3B82F6]/25 rounded-xl">
                      <span className="block font-bold text-[#3B82F6] mb-0.5 uppercase tracking-wide">3. Znaczenie</span>
                      <span className="text-[8px] text-gray-400">Zrozumienie celu</span>
                    </div>
                  </div>
                )}

                {active.id === 'herzberg' && (
                  <div className="grid grid-cols-2 gap-3 pt-1 text-[10px]">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                      <span className="block font-black uppercase text-[9px] text-red-400">Czynniki Higieny</span>
                      <p className="text-[8.5px] text-gray-300">Bezpieczeństwo zatrudnienia, warunki socjalne, wynagrodzenie zasadnicze.</p>
                    </div>
                    <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl space-y-1">
                      <span className="block font-black uppercase text-[9px] text-[#10B981]">Motywatory Właściwe</span>
                      <p className="text-[8.5px] text-gray-300">Awans, osobisty rozwój kompetencji, treść zadań i publiczne docenienie.</p>
                    </div>
                  </div>
                )}

                {active.id === 'jcm' && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-5 gap-1.5 text-center text-[8.5px] font-bold">
                      <div className="p-1 bg-white/5 border border-white/5 rounded">Różnorodność</div>
                      <div className="p-1 bg-white/5 border border-white/5 rounded">Tożsamość</div>
                      <div className="p-1 bg-white/5 border border-white/5 rounded">Znaczenie</div>
                      <div className="p-1 bg-white/5 border border-white/5 rounded">Autonomia</div>
                      <div className="p-1 bg-white/5 border border-white/5 rounded">Feedback</div>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full flex items-center justify-between px-3">
                      <span className="w-2 h-2 rounded-full bg-[#F4A574]" />
                      <span className="w-2 h-2 rounded-full bg-white/30" />
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    </div>
                  </div>
                )}

                {active.id === 'cognitive_eval' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-[#F4A574] uppercase">Zewnętrzne (Premie, benefity)</span>
                      <span className="text-[#10B981] uppercase">Wewnętrzne (Pasja, sprawczość)</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#F4A574] to-[#10B981] w-[60%]" />
                    </div>
                  </div>
                )}

                {active.id === 'equity' && (
                  <div className="grid grid-cols-2 gap-4 text-center text-[10px] pt-1">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                      <span className="block font-bold text-white uppercase tracking-wider mb-0.5">WKŁAD</span>
                      <p className="text-[8.5px] text-gray-400">Czas, wiedza, lojalność, pasja, wysiłek</p>
                    </div>
                    <div className="p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl">
                      <span className="block font-bold text-[#F59E0B] uppercase tracking-wider mb-0.5">REZULTAT</span>
                      <p className="text-[8.5px] text-gray-300">Płaca, docenienie, awans, warunki</p>
                    </div>
                  </div>
                )}

                {active.id === 'vroom' && (
                  <div className="flex items-center justify-center gap-2 pt-1 font-mono text-[10px] text-gray-300">
                    <div className="p-2 bg-white/5 border border-white/10 rounded-lg text-center">
                      <span className="block text-[8px] text-gray-400 uppercase font-mono">Wysiłek → Wynik</span>
                      <span className="font-bold text-white text-[11px]">OCZEKIWANIE</span>
                    </div>
                    <span className="text-gray-400 font-bold">×</span>
                    <div className="p-2 bg-white/5 border border-white/10 rounded-lg text-center">
                      <span className="block text-[8px] text-gray-400 uppercase font-mono">Wynik → Nagroda</span>
                      <span className="font-bold text-white text-[11px]">INSTRUMENTALNOŚĆ</span>
                    </div>
                    <span className="text-gray-400 font-bold">×</span>
                    <div className="p-2 bg-[#F4A574]/15 border border-[#F4A574]/30 rounded-lg text-center">
                      <span className="block text-[8px] text-gray-400 uppercase font-mono">Wartość Nagrody</span>
                      <span className="font-bold text-[#F4A574] text-[11px]">WALENCJA</span>
                    </div>
                  </div>
                )}

                {active.id === 'maslow_sat' && (
                  <div className="flex flex-col gap-1.5 pt-1 max-w-sm mx-auto w-full">
                    <div className="py-1 px-3 bg-[#F4A574] text-[9px] text-white font-extrabold uppercase rounded-lg text-center w-[60%] mx-auto shadow-md">
                      Potrzeby Samorealizacji (Rozwój)
                    </div>
                    <div className="py-1 px-3 bg-[#3B2F8C] text-[9px] text-white font-extrabold uppercase rounded-lg text-center w-[85%] mx-auto shadow-md">
                      Relacje rówieśnicze i klimat społeczny
                    </div>
                    <div className="py-1 px-3 bg-[#18124A] text-[9px] text-white font-extrabold uppercase rounded-lg text-center w-full shadow-md">
                      Bezpieczeństwo & ergonomia pracy
                    </div>
                  </div>
                )}

                {active.id === 'jdr' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between text-[8px] font-mono text-gray-400">
                      <span>Wymagania i stresory zawodowe</span>
                      <span>Zasoby wspierające pracownika</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                      <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-400 to-[#10B981] w-[50%]" />
                    </div>
                  </div>
                )}

                {active.id === 'sdt' && (
                  <div className="grid grid-cols-3 gap-2.5 pt-1 text-center text-[10px]">
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                      <span className="block font-black text-[#06B6D4] text-[11px] uppercase">Autonomia</span>
                      <span className="text-[8px] text-gray-400 block mt-1">Poczucie sprawczości</span>
                    </div>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                      <span className="block font-black text-indigo-400 text-[11px] uppercase">Kompetencje</span>
                      <span className="text-[8px] text-gray-400 block mt-1">Strefa rozwoju</span>
                    </div>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                      <span className="block font-black text-[#F4A574] text-[11px] uppercase">Relacje</span>
                      <span className="text-[8px] text-gray-400 block mt-1">Integracja & Team</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Aspects breakdown listing (Fully visible, clean layout) */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-mono font-bold uppercase text-[#F4A574] tracking-widest block border-b border-white/5 pb-1">
                  Badane aspekty i czynniki szczegółowe:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {active.points.map((point, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 text-[#F4A574] shrink-0 mt-0.5" />
                      <div className="text-[10px]">
                        <span className="font-bold text-white uppercase text-[8.5px] tracking-wide block mb-0.5">
                          {point.title}
                        </span>
                        <p className="text-gray-300 leading-normal font-normal text-[9.5px]">
                          {point.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real World Translation */}
              <div className="p-4.5 bg-gradient-to-r from-[#14183D] to-[#1F2450] border border-white/10 rounded-[20px] space-y-1.5">
                <span className="text-[8.5px] font-mono font-bold uppercase text-[#F4A574] tracking-wider block">
                  Praktyczne zastosowanie w diagnostyce HRly:
                </span>
                <p className="text-[11px] text-gray-200 leading-relaxed font-normal">
                  {active.hrlyText}
                </p>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
