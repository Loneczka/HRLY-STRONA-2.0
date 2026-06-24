import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ShieldCheck, Mail, ArrowRight, CheckCircle2, Download,
  MapPin, Clock, MessageSquareText, Menu, X, Users, 
  Activity, ArrowUpRight, Award, ChevronRight, HelpCircle,
  FileSpreadsheet, FileQuestion, Users2, Landmark, Compass, Target,
  ChevronDown, ChevronUp, Coins, Laptop, Heart, Coffee, GraduationCap, Zap, Key,
  User, Building
} from 'lucide-react';
import { HrlyDashboardPreview } from './components/HrlyDashboardPreview';
import { HrlyBlogSection } from './components/HrlyBlogSection';
import { HrlyPricingCalculator } from './components/HrlyPricingCalculator';
import { HrlyHeroGraphic } from './components/HrlyHeroGraphic';
import { HrlyMethodologyVisual } from './components/HrlyMethodologyVisual';

type PageRoute = 'home' | 'features' | 'pricing' | 'about' | 'blog' | 'contact';

const RESEARCH_AREAS = [
  {
    num: "01",
    title: "Wynagrodzenie i benefity",
    question: "Czy polityka płac motywuje czy frustruje Twój zespół?",
    factors: "Adekwatność płac, rynkowy benchmarking, przejrzystość premiowa, system benefitowy Cafeteria",
    metricName: "Wpływ na rotację",
    states: {
      niski: {
        status: "⚠️ Krytyczny odpływ talentów do konkurencji",
        metricValue: "+45% ryzyka odejść",
        financial: "-240 000 zł strat / rok",
        description: "Pracownicy aktywnie szukają ofert pracy z wyższym wynagrodzeniem zasadniczym. System premiowy odbierany jest jako nietransparentny i niesprawiedliwy."
      },
      sredni: {
        status: "⚡ Przeciętna rynkowa bez wyróżnika",
        metricValue: "Średnia stabilność",
        financial: "0 zł (brak strat)",
        description: "Wynagrodzenie podstawowe jest akceptowalne, lecz brak elastycznych benefitów rodzi powolne zniechęcenie i brak lojalności długoterminowej."
      },
      wysoki: {
        status: "✨ Wyjątkowy magnes rekrutacyjny",
        metricValue: "–43% redukcji rotacji",
        financial: "+180 000 zł oszczędności",
        description: "Sprawiedliwe siatki płac i realne pakiety prozdrowotne (opieka medyczna i psychologiczna) wzmacniają wizerunek pracodawcy pierwszego wyboru."
      }
    },
    action: "Przejdź na jasne, jawne widełki płacowe i zaoferuj kafeteryjny system benefitów dostosowany do generacji pracowników."
  },
  {
    num: "02",
    title: "Wpływ i znaczenie pracy",
    question: "Czy Twoi ludzie wierzą w realny sens i cel swoich codziennych zadań?",
    factors: "Przełożenie celów, poczucie sprawczości, wpływ na klienta, świadomość strategii firmy",
    metricName: "Wskaźnik zaangażowania",
    states: {
      niski: {
        status: "⚠️ Poczucie bezsensu i 'cicha rezygnacja'",
        metricValue: "-60% zaangażowania",
        financial: "-150 000 zł kosztów apatii",
        description: "Pracownicy czują się wyłącznie jako wykonawcy procedur bez realnego wpływu na końcowe efekty i strategię biznesową."
      },
      sredni: {
        status: "⚡ Zadania realizowane poprawnie, lecz bez pasji",
        metricValue: "Umiarkowane morale",
        financial: "-20 000 zł ukrytych strat",
        description: "Pracownicy wiedzą co mają robić, ale ich motywacja ogranicza się do minimalnych, wyznaczonych standardów działania."
      },
      wysoki: {
        status: "✨ Wysokie poczucie dumy i misji",
        metricValue: "3.5x wyższa inicjatywa",
        financial: "+290 000 zł wyższa wartość",
        description: "Zrozumienie wpływu swojej pracy na klientów i sukces firmy generuje naturalne innowacje oddolne i najwyższe skupienie na celach."
      }
    },
    action: "Przełóż cele firmy na jasne, zespołowe wskaźniki OKR i regularnie celebruj feedback od rzeczywistych użytkowników Twoich usług."
  },
  {
    num: "03",
    title: "Uznanie i docenianie",
    question: "Czy wysiłki i sukcesy pracowników są zauważane w codziennym pędzie?",
    factors: "Feedback przełożonego, peer-to-peer Kudos, nagrody jubileuszowe, docenianie mikro-sukcesów",
    metricName: "Zaufanie & eNPS",
    states: {
      niski: {
        status: "⚠️ Brak doceniania rodzi głęboki cynizm",
        metricValue: "-40% produktywności",
        financial: "-95 000 zł strat wydajności",
        description: "Sukcesy traktowane są jako absolutny standard, natomiast każdy błąd jest publicznie i negatywnie komentowany."
      },
      sredni: {
        status: "⚡ Docenianie okazjonalne przy wielkich sukcesach",
        metricValue: "Niestabilna satysfakcja",
        financial: "0 zł (brak mierzalnych strat)",
        description: "Docenianie odbywa się raz do roku na gali firmowej. Na co dzień brakuje drobnych słów uznania czy podziękowań."
      },
      wysoki: {
        status: "✨ Systemowa kultura wdzięczności (Kudos)",
        metricValue: "–30% mniejsza rotacja",
        financial: "+140 000 zł oszczędności HR",
        description: "Nawyk dziękowania zintegrowany ze Slackiem/Teamsami poprawia atmosferę i buduje trwałe poczucie wspólnoty."
      }
    },
    action: "Wprowadź prosty mechanizm 'Kudos' i przeszkol liderów z dawania konstruktywnego feedbacku metodą 3:1 (trzy pochwały na jedno usprawnienie)."
  },
  {
    num: "04",
    title: "Technologia i narzędzia",
    question: "Czy Twój sprzęt i systemy ułatwiają działanie, czy stawiają ciągły opór?",
    factors: "Niezawodność sprzętu, nowoczesny soft, automatyzacja procesów, szybkość supportu IT",
    metricName: "Płynność procesów",
    states: {
      niski: {
        status: "⚠️ Frustracja i bezsilność na powolnych systemach",
        metricValue: "-35% prędkości operacyjnej",
        financial: "-180 000 zł straconego czasu",
        description: "Zespoły marnują cenny czas na ręczne przepisywanie danych i walkę ze starzejącym się, zacinającym sprzętem biurowym."
      },
      sredni: {
        status: "⚡ Poprawność operacyjna z lukami cyfrowymi",
        metricValue: "Przeciętna płynność",
        financial: "-30 000 zł ukrytych strat",
        description: "Narzędzia działają, ale brak automatyzacji i konieczność ciągłego przełączania się między programami spowalniają pracę."
      },
      wysoki: {
        status: "✨ Pełna integracja i automatyzacja workflow",
        metricValue: "4x wyższy zwrot ROI",
        financial: "+410 000 zł zoptymalizowanych",
        description: "Innowacyjny stos technologiczny zwalnia ludzi z powtarzalnych, nudnych czynności, pozwalając im skupić się na celach biznesowych."
      }
    },
    action: "Zmapuj wąskie gardła i wyeliminuj mikroskrajności poprzez wdrożenie zintegrowanych systemów do automatyzacji nudnych zadań biurowych."
  },
  {
    num: "05",
    title: "Środowisko i kultura",
    question: "Czy ludzie czują psychologiczne bezpieczeństwo i mogą otwarcie rozmawiać?",
    factors: "Psychologiczne bezpieczeństwo, zaufanie w teamie, integracja, brak obwiniania",
    metricName: "Współczynnik zaufania",
    states: {
      niski: {
        status: "⚠️ Toksyczna presja i kultura ukrywania błędów",
        metricValue: "+80% poziomu stresu",
        financial: "-310 000 zł kosztów absencji",
        description: "Pracownicy boją się zgłaszać błędy, aby uniknąć publicznego wytykania winnych, co prowadzi do nawarstwiania się kryzysów."
      },
      sredni: {
        status: "⚡ Dystans i czysto formalne relacje",
        metricValue: "Przeciętna innowacyjność",
        financial: "-40 000 zł ukrytego stresu",
        description: "Pracownicy realizują swoje cele, lecz rzadko dzielą się własnym, odmiennym zdaniem z obawy o reakcję otoczenia."
      },
      wysoki: {
        status: "✨ Ekosystem bezpieczny psychologicznie",
        metricValue: "+76% wyższe zaangażowanie",
        financial: "+250 000 zł zyskowności",
        description: "Błędy analizowane są jako darmowe lekcje dla całej firmy. Otwarty feedback sprzyja innowacjom i wzajemnej pomocy."
      }
    },
    action: "Przeszkol kadrę w oparciu o zasady Nonviolent Communication (NVC) i wprowadź sesje 'Post-Mortem' ukierunkowane wyłącznie na wyciąganie wniosków."
  },
  {
    num: "06",
    title: "Work-life balance",
    question: "Czy po pracy pracownicy mogą odciąć się i w pełni zregenerować?",
    factors: "Elastyczny czas pracy, Home Office, kultura offline po godzinach, planowanie urlopów",
    metricName: "Well-being Index",
    states: {
      niski: {
        status: "⚠️ Permanentne przemęczenie i lawina zwolnień lekarskich",
        metricValue: "+65% absencji chorobowych",
        financial: "-220 000 zł kosztów nadgodzin",
        description: "Zgłaszanie spraw po godzinach i stałe oczekiwanie podłączenia pod komunikatory prowadzi do wycieńczenia zespołów."
      },
      sredni: {
        status: "⚡ Teoretyczna równowaga z okresowymi pożarami",
        metricValue: "Dostateczny balans",
        financial: "-10 000 zł sporadycznych strat",
        description: "Zasady work-life balance są deklarowane na papierze, ale błędy w planowaniu projektów zmuszają do okazjonalnego brania nadgodzin."
      },
      wysoki: {
        status: "✨ Pełna harmonia i elastyczność zadaniowa",
        metricValue: "–75% redukcji absencji",
        financial: "+190 000 zł oszczędności na zdrowiu",
        description: "Liderzy szanują czas wolny, a pracownicy wracają z weekendów wypoczęci i gotowi do efektywnego, szybkiego działania."
      }
    },
    action: "Wprowadź oficjalne 'prawo do odłączenia się' oraz zainicjuj zasadę 'Dni Skupienia' (np. środy bez jakichkolwiek wewnętrznych spotkań online)."
  },
  {
    num: "07",
    title: "Rozwój i kariera",
    question: "Czy Twoi pracownicy widzą dla siebie ścieżkę awansu i wzrostu u Ciebie?",
    factors: "Budżet szkoleniowy, przejrzyste awanse, mentoring, rozwijanie mocnych stron",
    metricName: "Lojalność talentów",
    states: {
      niski: {
        status: "⚠️ Brak perspektyw rozwoju – stagnacja",
        metricValue: "Ryzyko szybkiego odejścia",
        financial: "-290 000 zł koszty rekrutacji",
        description: "Pracownicy czują, że stoją w miejscu, a jedynym sposobem na naukę nowych rzeczy jest zmiana pracodawcy."
      },
      sredni: {
        status: "⚡ Okazjonalne szkolenia bez strategii rozwoju",
        metricValue: "Umiarkowany rozwój",
        financial: "Słaby zwrot z wydatków",
        description: "Szkolenia są kupowane reaktywnie, bez powiązania z realną siatką awansów czy ról w strukturze firmy."
      },
      wysoki: {
        status: "✨ Dynamiczny inkubator kompetencji",
        metricValue: "+76% stabilności kadr",
        financial: "+310 000 zł zysku z wiedzy",
        description: "Liderzy regularnie rozmawiają o mocnych stronach pracownika, a budżety są precyzyjnie przypisane do celów biznesowych."
      }
    },
    action: "Zbuduj jasną matrycę kompetencji (Skill Matrix) dla kluczowych ról i skoreluj postępy ze z góry zdefiniowanymi progami finansowymi."
  },
  {
    num: "08",
    title: "Perspektywy i stabilność",
    question: "Czy zespół czuje się bezpiecznie i ufa wizji oraz planom Zarządu?",
    factors: "Komunikacja strategiczna, transparentność finansowa, stabilność zatrudnienia",
    metricName: "Wpływ na rentowność",
    states: {
      niski: {
        status: "⚠️ Chaos informacyjny i lęk przed zwolnieniami",
        metricValue: "Paraliż innowacyjny",
        financial: "-350 000 zł straty decyzyjnej",
        description: "Pracownicy, nie znając rzeczywistej kondycji firmy, zaczynają panikować i wysyłać CV na rynek 'na wszelki wypadek'."
      },
      sredni: {
        status: "⚡ Podstawowe informacje o strategii raz w roku",
        metricValue: "Umiarkowane zaufanie",
        financial: "-15 000 zł utraconej inicjatywy",
        description: "Zarząd komunikuje duże zmiany wyłącznie po fakcie, co buduje poczucie odizolowania i niepewności w niższych szczeblach."
      },
      wysoki: {
        status: "✨ Pełna jasność celów i zaufanie liderom",
        metricValue: "+21% rentowności",
        financial: "+270 000 zł wyższa wartość",
        description: "Transparentność finansowa i otwartość sprawiają, że pracownicy czują pełną stabilność i wspólnie dążą do optymalizacji kosztów."
      }
    },
    action: "Uruchom cykliczne, otwarte spotkania kwartalne typu 'Town Hall' z prezesem oraz sekcją Anonymous Q&A, aby rozwiać obawy zespołu."
  },
  {
    num: "09",
    title: "Obciążenie i stres",
    question: "Czy ilość pracy i narzucona presja są na realistycznym, zdrowym poziomie?",
    factors: "Podział obowiązków, elastyczność planów, czas realizacji zadań, przeciwdziałanie wypaleniu",
    metricName: "Odporność na stres",
    states: {
      niski: {
        status: "⚠️ Skrajne przeciążenie i bliskie wypalenie teamów",
        metricValue: "Zagrożenie masową rotacją",
        financial: "-420 000 zł kosztów pomyłek",
        description: "Zadania są permanentnie planowane 'na wczoraj', co rodzi pośpiech, błędy i chroniczną drażliwość w komunikacji."
      },
      sredni: {
        status: "⚡ Znośne obciążenie z okresowym chaosem",
        metricValue: "Zadowalający poziom",
        financial: "-40 000 zł strat jakościowych",
        description: "Zespół zazwyczaj radzi sobie z obciążeniem, ale brakuje procesowych bezpieczników zapobiegających nagłym pikom stresu."
      },
      wysoki: {
        status: "✨ Zrównoważone tempo najwyższej precyzji",
        metricValue: "+25% stałej wydajności",
        financial: "+180 000 zł ochrony kapitału",
        description: "Menedżerowie racjonalnie rozdzielają zadania, budując odpowiedni bufor czasowy gwarantujący idealną jakość bez zmęczenia."
      }
    },
    action: "Wprowadź czytelne standardy szacowania pracochłonności zadań i zaimplementuj system zgłaszania przeciążenia 'Red Flag' bezpośrednio do HR."
  },
  {
    num: "10",
    title: "Komunikacja",
    question: "Czy informacje w firmie płyną swobodnie, niszcząc hermetyczne silosy?",
    factors: "Przepływ cross-department, jasność dyrektyw, otwartość na opinie pracowników",
    metricName: "Wskaźnik silosowości",
    states: {
      niski: {
        status: "⚠️ Całkowity paraliż, domysły i wojny międzyoddziałowe",
        metricValue: "+120% nieporozumień",
        financial: "-210 000 zł kosztów poprawek",
        description: "Działy pracują w silosach. Brak informacji i wzajemnych ustaleń prowadzi do ciągłego dublowania działań i opóźnień."
      },
      sredni: {
        status: "⚡ Dobry kontakt w małych grupach, słaby globalnie",
        metricValue: "Spowolniony przepływ",
        financial: "-35 000 zł opóźnień",
        description: "Informacje wewnątrz zespołów płyną dobrze, ale przekazywanie wiedzy np. między Sprzedażą a Produktem rodzi tarcia."
      },
      wysoki: {
        status: "✨ Synergia działań i brak barier komunikacyjnych",
        metricValue: "147% wyższe zaangażowanie",
        financial: "+330 000 zł szybsze wdrożenia",
        description: "Transparentność wiedzy sprawia, że każdy pracownik ma szybki dostęp do informacji niezbędnych do podjęcia samodzielnej decyzji."
      }
    },
    action: "Wdróż jednolitą i ogólnie dostępną bazę wiedzy firmy (np. Notion lub Confluence) i ustal asynchroniczne standardy komunikacji."
  },
  {
    num: "11",
    title: "Autonomia i decyzje",
    question: "Czy pracownicy mają zaufanie i samodzielność w realizacji postawionych celów?",
    factors: "Stopień mikrozarządzania, zaufanie lidera, swoboda operacyjna, decyzyjność",
    metricName: "Ownership & Odpowiedzialność",
    states: {
      niski: {
        status: "⚠️ Paraliżujący mikromanagement i bierna postawa",
        metricValue: "-55% innowacji",
        financial: "-160 000 zł kosztów biurokracji",
        description: "Każdy pojedynczy krok wymaga autoryzacji menedżera. Pracownicy tracą jakąkolwiek inicjatywę i wyłącznie czekają na rozkazy."
      },
      sredni: {
        status: "⚡ Autonomia wyłącznie na papierze",
        metricValue: "Przeciętna decyzyjność",
        financial: "-25 000 zł opóźnień operacyjnych",
        description: "Liderzy deklarują zaufanie, lecz potajemnie kontrolują najdrobniejsze detale, wywołując irytację samodzielnych ekspertów."
      },
      wysoki: {
        status: "✨ Pełne zaufanie, wysokie poczucie odpowiedzialności",
        metricValue: "+85% innowacyjności",
        financial: "+220 000 zł szybszej adaptacji",
        description: "Pracownicy są rozliczani z końcowych efektów, a nie z minut spędzonych przed ekranem. Mają pełną swobodę wyboru ścieżki do celu."
      }
    },
    action: "Przesuń ciężar oceny z 'mikro-kontroli czasu' na 'rozliczanie z celów jakościowych' (Outcome-Based Management)."
  }
];

const getAreaIcon = (num: string) => {
  switch (num) {
    case "01": return Coins;
    case "02": return Target;
    case "03": return Award;
    case "04": return Laptop;
    case "05": return Heart;
    case "06": return Coffee;
    case "07": return GraduationCap;
    case "08": return ShieldCheck;
    case "09": return Zap;
    case "10": return MessageSquareText;
    case "11": return Key;
    default: return HelpCircle;
  }
};

const getScreenshotImpactText = (num: string) => {
  switch (num) {
    case "01": return "Konkurencyjne wynagrodzenie obniża rotację o 43% i zwiększa produktywność o 25%.";
    case "02": return "Jasność celów podnosi wydajność o 56%. Pracownicy widzący wpływ są 3,5× bardziej zaangażowani.";
    case "03": return "87% pracowników uznaje, że pochwała wpływa na satysfakcję. Uznanie zmniejsza rotację o 30%.";
    case "04": return "72% firm z nowoczesnymi technologiami raportuje wzrost produktywności. $1 zainwestowany = $4 zwrotu.";
    case "05": return "Zaufanie = 76% wyższe zaangażowanie. Silna kultura = 40% wyższa retencja.";
    case "06": return "Elastyczność obniża stres o 20%, a work-life balance obniża absencję o 75%.";
    case "07": return "90% osób uważa, że szkolenia zwiększają zaangażowanie. Jasna ścieżka = +76% lojalności.";
    case "08": return "Zaufanie do organizacji = 17% wyższa produktywność i 21% większa rentowność.";
    case "09": return "Optymalne obciążenie = 25% wyższa produktywność. Wysoka presja to główny czynnik wypalenia.";
    case "10": return "Efektywna komunikacja = 147% wyższy poziom zaangażowania pracowników.";
    case "11": return "Autonomia jest jednym z najsilniejszych predyktorów zaangażowania i satysfakcji.";
    default: return "";
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<PageRoute>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroRole, setHeroRole] = useState<'director' | 'manager' | 'ceo'>('director');
  const [activeFeatureTab, setActiveFeatureTab] = useState<'cyclical' | 'pulse' | 'onboarding' | 'custom'>('cyclical');
  const [selectedFactor, setSelectedFactor] = useState<'engagement' | 'atmosphere' | 'burnout' | 'growth' | 'leadership'>('engagement');
  const [activeTile, setActiveTile] = useState<'szablony' | 'rekomendacje' | 'managerowie' | 'raport'>('szablony');
  const [selectedAreaIndex, setSelectedAreaIndex] = useState<number>(0);
  const [simulatorLevel, setSimulatorLevel] = useState<'niski' | 'sredni' | 'wysoki'>('sredni');

  // Scroll to top on route change to keep UX pristine
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Auto-rotate hero roles every 5 seconds, resetting the timer whenever heroRole changes
  useEffect(() => {
    if (activeTab !== 'home') return;

    const timer = setTimeout(() => {
      setHeroRole((prev) => {
        if (prev === 'director') return 'manager';
        if (prev === 'manager') return 'ceo';
        return 'director';
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeTab, heroRole]);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubject, setContactSubject] = useState("Zapytanie o platformę");
  const [contactConsent, setContactConsent] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Quick Demo dialog trigger state from "Jak to działa" / "Umów demo"
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);
  const [demoDate, setDemoDate] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [demoSuccess, setDemoSuccess] = useState(false);

  // State to trigger the popup for interactive research dashboard
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactConsent) return;
    setContactSuccess(true);
    // Reset state after slight delay or on close
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSuccess(true);
  };

  const handleCloseContactSuccess = () => {
    setContactName("");
    setContactEmail("");
    setContactCompany("");
    setContactMessage("");
    setContactConsent(false);
    setContactSuccess(false);
  };

  const handleCloseDemoSuccess = () => {
    setDemoEmail("");
    setDemoDate("");
    setDemoSuccess(false);
    setDemoDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FBFAF8] text-[#14183D] flex flex-col font-sans antialiased selection:bg-[#F4A574]/30 selection:text-[#14183D]">
      
      {/* Top Elegant Sticky Navigation Header */}
      <header className="w-full bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#EFEAE1] sticky top-0 z-[9900] px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand Mark */}
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 focus:outline-none text-left cursor-pointer group"
          >
            <svg 
              className="w-11 h-11 transition-transform duration-300 group-hover:scale-105" 
              viewBox="0 0 100 100" 
              xmlns="http://www.w3.org/2000/svg"
              aria-label="HRly logo"
            >
              {/* Outer concentric ring */}
              <circle cx="50" cy="50" r="41" stroke="#E2E8F0" strokeWidth="1.8" fill="none" />
              {/* Middle concentric ring */}
              <circle cx="50" cy="50" r="29" stroke="#CBD5E1" strokeWidth="2.4" fill="none" />
              {/* Inner concentric ring */}
              <circle cx="50" cy="50" r="17" stroke="#94A3B8" strokeWidth="3" fill="none" />
              {/* Center dot */}
              <circle cx="50" cy="50" r="5.5" fill="#14183D" />
            </svg>
            <div>
              <h1 className="font-display font-extrabold text-[#14183D] text-[24px] leading-none tracking-tighter lowercase">
                hrly
              </h1>
            </div>
          </button>

          {/* Desktop Navigation Link Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F4F1EC] p-1.5 rounded-xl border border-[#EFEAE1]/60">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-white text-[#3B2F8C] shadow-sm'
                  : 'text-[#55506E] hover:text-[#14183D]'
              }`}
            >
              Strona główna
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
                activeTab === 'features'
                  ? 'bg-white text-[#3B2F8C] shadow-sm'
                  : 'text-[#55506E] hover:text-[#14183D]'
              }`}
            >
              Funkcje
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-white text-[#3B2F8C] shadow-sm'
                  : 'text-[#55506E] hover:text-[#14183D]'
              }`}
            >
              Cennik
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-white text-[#3B2F8C] shadow-sm'
                  : 'text-[#55506E] hover:text-[#14183D]'
              }`}
            >
              O nas
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
                activeTab === 'blog'
                  ? 'bg-white text-[#3B2F8C] shadow-sm'
                  : 'text-[#55506E] hover:text-[#14183D]'
              }`}
            >
              Blog / Baza Wiedzy
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-white text-[#3B2F8C] shadow-sm'
                  : 'text-[#55506E] hover:text-[#14183D]'
              }`}
            >
              Kontakt
            </button>
          </nav>

          {/* Action Zone (Demo / Registration) */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => { setActiveTab('pricing'); }}
              className="text-xs font-bold bg-[#3B2F8C] hover:bg-[#231B5E] text-white px-4 py-2 rounded-xl shadow-md shadow-[#3B2F8C]/10 flex items-center gap-1.5 hover:scale-[0.98] transition-transform cursor-pointer"
            >
              Załóż darmowe konto
              <ArrowRight className="w-3.5 h-3.5 text-[#F4A574]" />
            </button>
          </div>

          {/* Mobile menu hamburger toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[#F4F1EC] text-[#14183D] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </header>

      {/* Mobile menu sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-[#EFEAE1] overflow-hidden sticky top-[73px] z-[9800]"
          >
            <nav className="flex flex-col p-4 space-y-2">
              <button 
                onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
                className={`p-3 text-left text-xs font-bold rounded-lg cursor-pointer ${activeTab === 'home' ? 'bg-[#3B2F8C] text-white' : 'text-[#55506E]'}`}
              >
                Strona główna
              </button>
              <button 
                onClick={() => { setActiveTab('features'); setMobileMenuOpen(false); }}
                className={`p-3 text-left text-xs font-bold rounded-lg cursor-pointer ${activeTab === 'features' ? 'bg-[#3B2F8C] text-white' : 'text-[#55506E]'}`}
              >
                Funkcje
              </button>
              <button 
                onClick={() => { setActiveTab('pricing'); setMobileMenuOpen(false); }}
                className={`p-3 text-left text-xs font-bold rounded-lg cursor-pointer ${activeTab === 'pricing' ? 'bg-[#3B2F8C] text-white' : 'text-[#55506E]'}`}
              >
                Cennik
              </button>
              <button 
                onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); }}
                className={`p-3 text-left text-xs font-bold rounded-lg cursor-pointer ${activeTab === 'about' ? 'bg-[#3B2F8C] text-white' : 'text-[#55506E]'}`}
              >
                O nas
              </button>
              <button 
                onClick={() => { setActiveTab('blog'); setMobileMenuOpen(false); }}
                className={`p-3 text-left text-xs font-bold rounded-lg cursor-pointer ${activeTab === 'blog' ? 'bg-[#3B2F8C] text-white' : 'text-[#55506E]'}`}
              >
                Blog / Baza wiedzy
              </button>
              <button 
                onClick={() => { setActiveTab('contact'); setMobileMenuOpen(false); }}
                className={`p-3 text-left text-xs font-bold rounded-lg cursor-pointer ${activeTab === 'contact' ? 'bg-[#3B2F8C] text-white' : 'text-[#55506E]'}`}
              >
                Kontakt
              </button>
              
              <div className="pt-3 border-t border-[#EFEAE1] flex flex-col gap-2">
                <button
                  onClick={() => { setActiveTab('pricing'); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2.5 bg-[#3B2F8C] text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Załóż darmowe konto
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dynamic Workspace / View Manager */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-12">
        <AnimatePresence mode="wait">
          
          {/* ================= STRONA GŁÓWNA (ROUTE = HOME) ================= */}
          {activeTab === 'home' && (
            <motion.div
              key="home-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-16"
            >
              
              {/* Premium Hero Section */}
              <section className="relative rounded-[32px] border border-[#C4BBDE]/55 bg-gradient-to-tr from-[#F4F1EC] via-[#FBFAF8] to-[#FFFFFF] p-6 sm:p-10 lg:p-14 flex flex-col items-center justify-between gap-12 overflow-hidden shadow-xl md:shadow-2xl grid-pattern">
                
                {/* Glowing aesthetic blurs */}
                <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-[#F4A574]/15 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-[#E3DEEE]/40 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />
                
                <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
                  <div className="space-y-6 max-w-xl text-center lg:text-left flex flex-col items-center lg:items-start">
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-[#E3DEEE]/85 text-[#3B2F8C] px-3.5 py-1.5 rounded-full border border-[#C4BBDE]/60 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#F4A574]" />
                      01 · ANALITYKA I REKOMENDACJE HR W KILKA MINUT
                    </div>

                    {/* Interactive Role Selector Toggles */}
                    <div className="flex flex-wrap gap-1 p-1 bg-[#EFEAE1]/80 rounded-2xl border border-[#C4BBDE]/35 shadow-inner">
                      {[
                        { id: 'director', label: 'Dla Dyrektorów HR' },
                        { id: 'manager', label: 'Dla Menedżerów' },
                        { id: 'ceo', label: 'Dla Zarządu & CEO' }
                      ].map((roleItem) => (
                        <button
                          key={roleItem.id}
                          onClick={() => setHeroRole(roleItem.id as 'director' | 'manager' | 'ceo')}
                          className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold tracking-tight transition-all cursor-pointer ${
                            heroRole === roleItem.id
                              ? 'bg-[#3B2F8C] text-white shadow-sm'
                              : 'text-[#55506E] hover:text-[#14183D] hover:bg-white/40'
                          }`}
                        >
                          {roleItem.label}
                        </button>
                      ))}
                    </div>

                    {/* Dynamic Headline depending on Role */}
                    <div className="min-h-[140px] sm:min-h-[160px] lg:min-h-[180px] flex flex-col justify-center">
                      <AnimatePresence mode="wait">
                        {heroRole === 'director' && (
                          <motion.div
                            key="director-headline"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                          >
                            <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-[42px] text-[#14183D] tracking-tight leading-[1.1] uppercase">
                              Skróć analizę HR <br />z tygodni do{" "}
                              <span className="relative inline-block normal-case">
                                <span className="font-script italic font-medium text-[#3B2F8C] text-[1.12em] tracking-normal lowercase relative z-10 select-none">
                                  kilku minut
                                </span>
                                <svg 
                                  className="absolute -bottom-1.5 left-0 w-full h-[8px] text-[#F4A574] opacity-80 pointer-events-none" 
                                  viewBox="0 0 100 10" 
                                  preserveAspectRatio="none"
                                >
                                  <path 
                                    d="M 3,6 Q 50,9 97,4" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="3.5" 
                                    strokeLinecap="round" 
                                  />
                                </svg>
                              </span>
                              .
                            </h2>
                            <p className="text-xs sm:text-sm text-[#55506E] leading-relaxed">
                              HRly zbiera wyniki badań, automatycznie diagnozuje 58 czynników w 11 obszarach i od ręki generuje gotowe raporty. Oszczędź dziesiątki godzin pracy w każdym kwartale.
                            </p>
                          </motion.div>
                        )}

                        {heroRole === 'manager' && (
                          <motion.div
                            key="manager-headline"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                          >
                            <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-[42px] text-[#14183D] tracking-tight leading-[1.1] uppercase">
                              Zrozum emocje i <br />potrzeby{" "}
                              <span className="relative inline-block normal-case">
                                <span className="font-script italic font-medium text-[#3B2F8C] text-[1.12em] tracking-normal lowercase relative z-10 select-none">
                                  swojego zespołu
                                </span>
                                <svg 
                                  className="absolute -bottom-1.5 left-0 w-full h-[8px] text-[#F4A574] opacity-80 pointer-events-none" 
                                  viewBox="0 0 100 10" 
                                  preserveAspectRatio="none"
                                >
                                  <path 
                                    d="M 3,6 Q 50,9 97,4" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="3.5" 
                                    strokeLinecap="round" 
                                  />
                                </svg>
                              </span>
                              .
                            </h2>
                            <p className="text-xs sm:text-sm text-[#55506E] leading-relaxed">
                              Zidentyfikuj przyczyny wypalenia, popraw atmosferę i podnoś zaangażowanie dzięki gotowym, spersonalizowanym rekomendacjom i checklistom dla liderów.
                            </p>
                          </motion.div>
                        )}

                        {heroRole === 'ceo' && (
                          <motion.div
                            key="ceo-headline"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                          >
                            <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-[42px] text-[#14183D] tracking-tight leading-[1.1] uppercase">
                              Zredukuj rotację i <br />zabezpiecz{" "}
                              <span className="relative inline-block normal-case">
                                <span className="font-script italic font-medium text-[#3B2F8C] text-[1.12em] tracking-normal lowercase relative z-10 select-none">
                                  kluczowy talent
                                </span>
                                <svg 
                                  className="absolute -bottom-1.5 left-0 w-full h-[8px] text-[#F4A574] opacity-80 pointer-events-none" 
                                  viewBox="0 0 100 10" 
                                  preserveAspectRatio="none"
                                >
                                  <path 
                                    d="M 3,6 Q 50,9 97,4" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="3.5" 
                                    strokeLinecap="round" 
                                  />
                                </svg>
                              </span>
                              .
                            </h2>
                            <p className="text-xs sm:text-sm text-[#55506E] leading-relaxed">
                              Przełóż zadowolenie pracowników na twarde wskaźniki biznesowe i mierzalne oszczędności finansowe. Zyskaj pełen obraz kondycji organizacji.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto pt-2">
                      <button
                        onClick={() => setActiveTab('pricing')}
                        className="w-full sm:w-auto py-3.5 px-6 bg-[#3B2F8C] hover:bg-[#231B5E] text-white rounded-xl text-xs font-bold tracking-tight shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                      >
                        Załóż darmowe konto
                        <ArrowRight className="w-4 h-4 text-[#F4A574]" />
                      </button>
                      
                      <a
                        href="#interactive-demo"
                        className="w-full sm:w-auto py-3.5 px-6 bg-white hover:bg-[#F4F1EC] text-[#3B2F8C] border border-[#C4BBDE] rounded-xl text-xs font-bold tracking-tight text-center transition-colors block cursor-pointer hover:scale-[1.02]"
                      >
                        Jak to działa →
                      </a>
                    </div>

                    {/* Trust small indicators */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 pt-4 border-t border-[#EFEAE1] text-[11px] text-[#A39AB4] font-mono w-full">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F4A574]" />
                        14 dni za darmo
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F4A574]" />
                        Bez podpinania karty
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F4A574]" />
                        Pełna zgodność z RODO
                      </span>
                    </div>
                  </div>

                  {/* Modern Hero Graphic directly rendered */}
                  <div className="relative w-full lg:w-[440px] shrink-0">
                    <HrlyHeroGraphic />
                  </div>
                </div>

                {/* Social Proof Brand Logobar */}
                <div className="pt-6 border-t border-[#EFEAE1] w-full relative z-10">
                  <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#A39AB4] text-center lg:text-left mb-3">
                    Zaufali nam liderzy nowoczesnych organizacji w Polsce:
                  </p>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3 opacity-65 grayscale hover:opacity-95 transition-opacity">
                    {[
                      { name: "RETAIL TECH", icon: "🛒" },
                      { name: "FINTECH LEADERS", icon: "💳" },
                      { name: "SAAS ENTERPRISE", icon: "⚡" },
                      { name: "E-COMMERCE HUB", icon: "📦" },
                      { name: "LOGISTICS PRO", icon: "🚛" }
                    ].map((brand, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-1.5 text-xs font-display font-black text-[#14183D] tracking-wider uppercase">
                        <span className="text-sm grayscale-0">{brand.icon}</span>
                        <span className="text-[10px] tracking-widest font-mono text-[#55506E]">{brand.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </section>

              {/* SECTION: Interactive Dashboard preview explorer */}
              <section className="space-y-6">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <span className="text-[10px] text-[#F4A574] font-mono font-bold uppercase tracking-widest bg-[#F4F1EC] px-3 py-1 rounded-full border border-[#EFEAE1]">
                    Eksploruj dynamicznie
                  </span>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[#14183D] tracking-tight uppercase">
                    Twój interaktywny pulpit badawczy
                  </h3>
                  <p className="text-xs sm:text-sm text-[#55506E]">
                    Zobacz jak platforma diagnozuje słabsze punkty oraz dostarcza gotowe scenariusze rekomendacji.
                  </p>
                </div>

                {/* Elegant visual trigger card with animated pointing arrow */}
                <div 
                  onClick={() => setIsDashboardOpen(true)}
                  className="max-w-4xl mx-auto bg-gradient-to-br from-[#14183D] to-[#252A60] rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden shadow-xl border border-white/10 group cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all duration-300"
                >
                  {/* Backdrop decorative shapes */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B2F8C]/40 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#F4A574]/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 max-w-md text-left">
                      <span className="inline-flex items-center gap-1.5 bg-[#F4A574]/10 text-[#F4A574] px-3 py-1.5 rounded-full border border-[#F4A574]/20 text-[10px] font-bold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Interaktywny Demonstrator
                      </span>
                      <h4 className="font-sans font-black text-2xl sm:text-3xl text-white tracking-tight leading-none uppercase">
                        Przetestuj pełen pulpit badawczy
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        Uruchom demo i przekonaj się, jak precyzyjnie diagnozujemy 11 kluczowych obszarów organizacji (w tym poczucie sensu, dopasowanie ról czy relacje) oraz jak automatycznie generujemy gotowe, mierzalne plany działań dla liderów.
                      </p>
                    </div>

                    {/* Animated arrow & trigger button container */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 shrink-0 w-full sm:w-auto">
                      {/* Animated pointing arrow on the left */}
                      <motion.div 
                        animate={{ x: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="hidden md:flex items-center gap-2 text-[#F4A574]"
                      >
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F4A574]">Zobacz HRly w akcji</span>
                        <ArrowRight className="w-5 h-5 text-[#F4A574] stroke-[2.5]" />
                      </motion.div>

                      {/* Main interactive button */}
                      <button className="w-full sm:w-auto py-4 px-8 bg-[#F4A574] hover:bg-[#E08F5A] text-white rounded-xl text-xs font-display font-extrabold uppercase tracking-wider shadow-md shadow-[#F4A574]/20 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] duration-200 cursor-pointer">
                        Otwórz pulpit badawczy
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Decorative faint mini UI outline just to hint at the complexity inside */}
                  <div className="mt-8 border-t border-white/10 pt-6 opacity-35 group-hover:opacity-50 transition-opacity duration-300 hidden sm:block">
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                      <span>PULPIT BADANIA ZAANGAŻOWANIA · AKTUALNY WIDOK OPERACYJNY</span>
                      <div className="flex gap-4">
                        <span>● 11 Obszarów Badawczych</span>
                        <span>● Gotowe Scenariusze Rekomendacji</span>
                        <span>● Real-time Raporty</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION: Od wyniku do działania (02) */}
              <section className="bg-white border border-[#EFEAE1] rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-4 space-y-4">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#3B2F8C] bg-[#E3DEEE] px-2.5 py-1 rounded-full">
                    02 · OD WYNIKU DO DZIAŁANIA
                  </span>
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-[#14183D] tracking-tight uppercase leading-none">
                    Dane, które zamieniają się w decyzje.
                  </h3>
                  <p className="text-xs text-[#55506E] leading-relaxed">
                    HRly nie kończy pracy na wygenerowanym raporcie. Największa wartość pojawia się wtedy, gdy wyniki ankiety automatycznie przekładają się na konkretną rozmowę, strukturę motywacyjną i bezpośrednie kroki menedżera.
                  </p>
                </div>

                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 font-normal">
                  <div className="p-5 rounded-2xl border border-[#EFEAE1] bg-[#FBFAF8]/40 space-y-3 hover:translate-y-[-2px] transition-transform">
                    <span className="text-2xl font-black text-[#F4A574] font-mono">01</span>
                    <h4 className="font-bold text-sm text-[#14183D] uppercase tracking-tight">Wynik</h4>
                    <p className="text-xs text-[#55506E] leading-relaxed">
                      Raport od razu i precyzyjnie wskazuje obszary z najniższą oceną kapitału ludzkiego. Od razu widać, gdzie w zespole narasta napięcie.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-[#EFEAE1] bg-[#FBFAF8]/40 space-y-3 hover:translate-y-[-2px] transition-transform">
                    <span className="text-2xl font-black text-[#3B2F8C] font-mono">02</span>
                    <h4 className="font-bold text-sm text-[#14183D] uppercase tracking-tight">Priorytet</h4>
                    <p className="text-xs text-[#55506E] leading-relaxed">
                      Intuicyjny algorytm pomaga ustalić hierarchię działań. Dokładnie wiesz, które negatywne czynniki wymagają reakcji w pierwszej kolejności.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-[#EFEAE1] bg-[#FBFAF8]/40 space-y-3 hover:translate-y-[-2px] transition-transform">
                    <span className="text-2xl font-black text-[#3B2F8C] font-mono">03</span>
                    <h4 className="font-bold text-sm text-[#14183D] uppercase tracking-tight">Narzędzie</h4>
                    <p className="text-xs text-[#55506E] leading-relaxed">
                      Liderzy otrzymują kompletny toolkit wspierający ich w rozmowach z podwładnymi i tworzeniu jasnej odpowiedzi zwrotnej zespołowi.
                    </p>
                  </div>
                </div>
              </section>

              {/* SECTION: Wyzwania, które rozwiązujemy (03) */}
              <section className="space-y-6">
                <div className="text-center max-w-2xl mx-auto space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#3B2F8C] bg-[#E3DEEE] px-2.5 py-1 rounded-full">
                    03 · Wyzwania, które rozwiązujemy
                  </span>
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-[#14183D] tracking-tight uppercase leading-none">
                    Dlaczego tradycyjny HR zawodzi?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#55506E] leading-relaxed">
                    HRly to odpowiedź na codzienne zagubienie w tabelkach. Zamieniamy suche dane ankietowe w gotowe, mierzalne rozwiązania biznesowe.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: Wysoka rotacja (spans 2 columns) */}
                  <motion.div 
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, delay: 0.0, ease: "easeOut" }}
                    whileHover={{ y: -4 }}
                    className="bg-[#14183D] text-white p-6 md:p-10 rounded-[32px] md:col-span-2 space-y-5 flex flex-col justify-between shadow-sm relative overflow-hidden group transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#F4A574]/15 text-[#F4A574] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-sans font-black text-lg md:text-xl text-white tracking-tight">
                          Wysoka rotacja
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
                          Tracisz kluczowych ludzi i nie wiesz dlaczego. Koszty rekrutacji rosną, a wiedza odchodzi z firmy.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 2: Brak danych */}
                  <motion.div 
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    whileHover={{ y: -4 }}
                    className="bg-white border border-[#EFEAE1]/70 p-6 md:p-10 rounded-[32px] space-y-5 flex flex-col justify-between shadow-sm hover:border-[#C4BBDE]/50 transition-all duration-300 group"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#F4F1EC] text-[#3B2F8C] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <Download className="w-5 h-5" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-sans font-black text-lg md:text-xl text-[#14183D] tracking-tight">
                          Brak danych
                        </h4>
                        <p className="text-xs sm:text-sm text-[#55506E] leading-relaxed">
                          Zarząd chce liczb, ale nikt nie dał Ci narzędzi, żeby je zebrać.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 3: Brak czasu */}
                  <motion.div 
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    whileHover={{ y: -4 }}
                    className="bg-white border border-[#EFEAE1]/70 p-6 md:p-10 rounded-[32px] space-y-5 flex flex-col justify-between shadow-sm hover:border-[#C4BBDE]/50 transition-all duration-300 group"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#F4F1EC] text-[#3B2F8C] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-sans font-black text-lg md:text-xl text-[#14183D] tracking-tight">
                          Brak czasu
                        </h4>
                        <p className="text-xs sm:text-sm text-[#55506E] leading-relaxed">
                          Na analizy brakuje tygodni, a budżet zależy od Twojej prezentacji.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 4: Intuicja zamiast danych */}
                  <motion.div 
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                    whileHover={{ y: -4 }}
                    className="bg-white border border-[#EFEAE1]/70 p-6 md:p-10 rounded-[32px] space-y-5 flex flex-col justify-between shadow-sm hover:border-[#C4BBDE]/50 transition-all duration-300 group"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#F4F1EC] text-[#3B2F8C] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-sans font-black text-lg md:text-xl text-[#14183D] tracking-tight">
                          Intuicja zamiast danych
                        </h4>
                        <p className="text-xs sm:text-sm text-[#55506E] leading-relaxed">
                          Zgadywanie w biznesie zawsze kończy się kosztem.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 5: Brak gotowych rozwiązań */}
                  <motion.div 
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    whileHover={{ y: -4 }}
                    className="bg-white border border-[#EFEAE1]/70 p-6 md:p-10 rounded-[32px] space-y-5 flex flex-col justify-between shadow-sm hover:border-[#C4BBDE]/50 transition-all duration-300 group"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#F4F1EC] text-[#3B2F8C] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-sans font-black text-lg md:text-xl text-[#14183D] tracking-tight">
                          Brak gotowych rozwiązań
                        </h4>
                        <p className="text-xs sm:text-sm text-[#55506E] leading-relaxed">
                          Menedżerowie chcą konkretów - nie kolejnego raportu, ale gotowej odpowiedzi: co zrobić, żeby poprawić wyniki zespołu.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* SECTION: Co otrzymujesz (04) */}
              <section className="bg-[#FBFAF8] border border-[#EFEAE1] rounded-3xl p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B2F8C]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5 space-y-4">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#3B2F8C] bg-[#E3DEEE] px-2.5 py-1 rounded-full">
                      04 · CO OTRZYMUJESZ
                    </span>
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-[#14183D] tracking-tight uppercase leading-none">
                      Wzmocnij swoją pozycję. Mów językiem biznesu.
                    </h3>
                    <p className="text-xs text-[#55506E] leading-relaxed">
                      Zmień postrzeganie HR w swojej firmie. Pokaż zarządowi jasne dowody rynkowe i poprowadź organizację do mierzalnego wzrostu stabilności.
                    </p>

                    <div className="bg-white border border-[#EFEAE1] p-4 rounded-xl space-y-2">
                      <span className="text-[10px] uppercase font-mono font-bold text-[#A39AB4] block">Kluczowy wyróżnik</span>
                      <p className="text-xs text-[#14183D] font-bold">
                        Język biznesu — pokazujemy wpływ zaangażowania pracowników bezpośrednio na ubytek lub przyrost wyników finansowych przedsiębiorstwa.
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-3 font-normal text-xs">
                    {[
                      { title: "Raporty w kilka minut", desc: "Całkowicie bez żmudnych wielodniowych analiz i manualnych obliczeń formularzy ankietowych." },
                      { title: "Gotowe rekomendacje strategii", desc: "Zawsze wskazujemy nie tylko to „co jest źle”, ale precyzyjnie „co zrobić, gdzie i jak”." },
                      { title: "Pełny kontekst mikroorganizacji", desc: "Diagnozujemy nastroje w poszczególnych komórkach, wskazując różnice kultur między działami." },
                      { title: "Narzędzia operacyjne dla menedżerów", desc: "Liderzy średniego szczebla otrzymują przetestowane scenariusze rozmów 1-on-1 i checklisty wsparcia." }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white border border-[#EFEAE1]/70 p-4 rounded-xl flex items-start gap-3 hover:border-[#C4BBDE] transition-colors">
                        <CheckCircle2 className="w-5 h-5 text-[#F4A574] shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-xs text-[#14183D] uppercase tracking-tight">{item.title}</h4>
                          <p className="text-[11px] text-[#55506E] leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* SECTION: Metodologia (05) */}
              <section className="bg-gradient-to-br from-[#14183D] to-[#252A60] text-white rounded-[32px] p-8 sm:p-12 md:p-16 relative overflow-hidden border border-white/10 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B2F8C]/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#F4A574]/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 space-y-12">
                  {/* Top Header Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-8 border-b border-white/10">
                    <div className="lg:col-span-7 space-y-4">
                      <span className="inline-flex items-center gap-1.5 bg-[#F4A574]/10 text-[#F4A574] px-3 py-1.5 rounded-full border border-[#F4A574]/20 text-[10px] font-bold uppercase tracking-wider">
                        05 · METODOLOGIA BADANIA
                      </span>
                      <h3 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight uppercase leading-none">
                        Z teorii pracy do konkretnych pytań i decyzji.
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl">
                        HRly łączy najważniejsze teorie pracy, zaangażowania i motywacji ludzkiej w jeden komplementarny, przejrzysty framework badawczy. Nasz wynik to zintegrowany, w pełni obiektywny obraz zespołu, który pozwala błyskawicznie sprawdzić, co naprawdę czują Twoi ludzie.
                      </p>
                    </div>

                    <div className="lg:col-span-5 grid grid-cols-3 gap-3 w-full">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1 text-center">
                        <span className="font-sans font-black text-lg sm:text-2xl text-[#F4A574] block">58</span>
                        <p className="text-[9px] text-gray-400 uppercase font-mono tracking-tight font-bold">Czynników</p>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1 text-center">
                        <span className="font-sans font-black text-lg sm:text-2xl text-[#F4A574] block">11</span>
                        <p className="text-[9px] text-gray-400 uppercase font-mono tracking-tight font-bold">Obszarów</p>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1 text-center">
                        <span className="font-sans font-black text-lg sm:text-2xl text-[#F4A574] block">11</span>
                        <p className="text-[9px] text-gray-400 uppercase font-mono tracking-tight font-bold">Teorii</p>
                      </div>
                    </div>
                  </div>

                  {/* Full width interactive selector & visualizer */}
                  <div className="w-full">
                    <HrlyMethodologyVisual />
                  </div>
                </div>
              </section>

              {/* SECTION: Jak to działa (06) */}
              <section className="space-y-10 py-4" id="interactive-demo">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                  <span className="inline-flex items-center gap-1 bg-[#E3DEEE] text-[#3B2F8C] px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    06 · JAK TO DZIAŁA
                  </span>
                  <h3 className="font-display font-black text-2xl sm:text-4xl text-[#14183D] tracking-tight uppercase leading-none">
                    Prosta ścieżka do dojrzałego HR
                  </h3>
                  <p className="text-xs sm:text-sm text-[#55506E] leading-relaxed max-w-2xl mx-auto">
                    Zmień oblicze swojej firmy w 3 prostych bazowych krokach. Bez instalowania skomplikowanego kodu, bez potrzeby posiadania sztabu analityków rynkowych.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {[
                    { num: "01", title: "Zbierz dane", desc: "Skorzystaj z gotowych szablonów ankiet zaprojektowanych przez psychologów pracy lub stwórz własne pytania za pomocą elastycznego kreatora." },
                    { num: "02", title: "Inteligentna analiza", desc: "Nasz automat natychmiast klastruje i analizuje 58 kluczowych czynników w 11 obszarach, zdejmując z Twojej głowy pracę statystyczną." },
                    { num: "03", title: "Plan działania", desc: "Zarząd i menedżerowie otrzymują automatyczny, spersonalizowany raport zawierający gotowe narzędzia komunikacyjne, checklisty oraz rekomendacje." }
                  ].map((step, sIdx) => (
                    <div key={sIdx} className="bg-[#FBFAF8] border border-[#EFEAE1] hover:border-[#C4BBDE] p-6 rounded-2xl space-y-4 transition-all hover:shadow-md relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#F4A574]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#3B2F8C]/5 transition-colors" />
                      
                      <div className="w-10 h-10 rounded-xl bg-[#3B2F8C] text-white flex items-center justify-center font-mono font-black text-sm shadow-sm">
                        {step.num}
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-sans font-black text-sm text-[#14183D] uppercase tracking-tight">{step.title}</h4>
                        <p className="text-xs text-[#55506E] leading-relaxed font-normal">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: CTA Końcowe (07) */}
              <section className="bg-[#F4F1EC] border border-[#C4BBDE]/50 rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-[#F4A574]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#3B2F8C]/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="max-w-2xl mx-auto space-y-4 relative z-10">
                  <span className="text-[11px] font-mono font-bold uppercase text-[#3B2F8C]">
                    07 · GOTOWI NA ZMIANĘ?
                  </span>
                  
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-[#14183D] tracking-tight uppercase leading-none">
                    Zacznij podejmować trafne decyzje HR już dziś.
                  </h3>

                  <p className="text-xs sm:text-sm text-[#55506E] leading-relaxed">
                    Analiza 58 czynników HR, intuicyjne dashboardy, gotowe rekomendacje i praktyczne plany ułatwiające pracę menedżerów — wszystko w kilka minut. Bez analityka. Prosto do biznesowego celu.
                  </p>

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => { setActiveTab('pricing'); }}
                      className="py-4 px-8 text-xs bg-[#3B2F8C] hover:bg-[#231B5E] text-white font-display font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] duration-200 cursor-pointer"
                    >
                      Załóż darmowe konto
                    </button>
                  </div>

                  <p className="text-[10px] text-[#A39AB4] italic font-medium">
                    Inteligentna platforma analityki HR, która błyskawicznie zamienia surowe dane ankietowe w strategiczne decyzje biznesowe i realny zysk.
                  </p>
                </div>
              </section>

            </motion.div>
          )}

          {/* ================= FEATURES (ROUTE = FEATURES) ================= */}
          {activeTab === 'features' && (
            <motion.div
              key="features-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12 animate-fade-in"
            >
              {/* Premium Features Hero Section */}
              <div className="relative rounded-[32px] border border-[#C4BBDE]/55 bg-gradient-to-tr from-[#F4F1EC] via-[#FBFAF8] to-[#FFFFFF] p-6 sm:p-10 lg:p-14 overflow-hidden shadow-xl bg-[linear-gradient(to_right,rgba(196,187,222,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(196,187,222,0.12)_1px,transparent_1px)] bg-[size:24px_24px]">
                
                {/* Glowing aesthetic blurs */}
                <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-[#F4A574]/15 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-[#E3DEEE]/40 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                  <div className="space-y-6 max-w-xl text-center lg:text-left flex flex-col items-center lg:items-start">
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-[#E3DEEE]/85 text-[#3B2F8C] px-3.5 py-1.5 rounded-full border border-[#C4BBDE]/60 text-[10px] font-bold uppercase tracking-wider shadow-xs leading-none">
                      <Sparkles className="w-3.5 h-3.5 text-[#F4A574]" />
                      02 · PEŁNA ELASTYCZNOŚĆ BADAŃ
                    </div>

                    <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-[42px] text-[#14183D] tracking-tight leading-[1.1] uppercase">
                      Głębokie zrozumienie <br />
                      <span className="relative inline-block normal-case">
                        <span className="font-script italic font-medium text-[#3B2F8C] text-[1.12em] tracking-normal lowercase relative z-10 select-none">
                          potrzeb Twoich ludzi
                        </span>
                        <svg 
                          className="absolute -bottom-1.5 left-0 w-full h-[8px] text-[#F4A574] opacity-80 pointer-events-none" 
                          viewBox="0 0 100 10" 
                          preserveAspectRatio="none"
                        >
                          <path 
                            d="M 3,6 Q 50,9 97,4" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="3.5" 
                            strokeLinecap="round" 
                          />
                        </svg>
                      </span>
                    </h2>

                    <p className="text-xs sm:text-sm text-[#55506E] leading-relaxed">
                      HRly dostarcza w pełni konfigurowalne narzędzia badawcze dostosowane do rytmu Twojej firmy. Od precyzyjnych badań kwartalnych o wysokiej frekwencji, przez elastyczne i szybkie pulse-checki, aż po dedykowane ankiety onboardingowe. Wszystko zaprojektowane tak, by gwarantować bezpieczeństwo i zachęcać do szczerego feedbacku.
                    </p>

                    {/* Trust indicators */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 pt-4 border-t border-[#EFEAE1] text-[11px] text-[#A39AB4] font-mono w-full">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        Pełna swoboda konfiguracji
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        Dowolna długość i skala pytań
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        Naukowa metodologia
                      </span>
                    </div>
                  </div>

                  {/* Modern Abstract Floating Features Area */}
                  <div className="w-full lg:w-[440px] shrink-0 h-[400px] relative overflow-visible">
                    
                    {/* Decorative grid layers */}
                    <div className="absolute inset-0 bg-[radial-gradient(#C4BBDE_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />
                    <div className="absolute w-72 h-72 border border-dashed border-[#C4BBDE]/15 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    
                    {/* 1. GOTOWE SZABLONY */}
                    <motion.div
                      animate={{ y: [-4, 4] }}
                      transition={{ repeat: Infinity, repeatType: "reverse", duration: 3.4, ease: "easeInOut" }}
                      className="absolute left-[3%] top-[4%] w-[200px] bg-white border border-[#EFEAE1] rounded-2xl p-3 shadow-md hover:border-[#C4BBDE] hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1 rounded-lg bg-[#E3DEEE]/50 text-[#3B2F8C]">
                          <FileQuestion className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-mono text-[#A39AB4] font-bold uppercase">Gotowe Szablony</span>
                      </div>
                      <h4 className="font-sans font-black text-[11px] text-[#14183D] uppercase leading-tight">
                        Naukowa baza pytań
                      </h4>
                      <div className="mt-1.5 space-y-1">
                        <div className="flex items-center justify-between text-[8.5px] font-mono text-[#55506E] bg-[#FBFAF8] px-1.5 py-0.5 rounded border border-[#EFEAE1]/40">
                          <span>• eNPS & Satysfakcja</span>
                          <span className="text-[#047857] font-bold">Standard</span>
                        </div>
                        <div className="flex items-center justify-between text-[8.5px] font-mono text-[#55506E] bg-[#FBFAF8] px-1.5 py-0.5 rounded border border-[#EFEAE1]/40">
                          <span>• Puls Atmosfery</span>
                          <span className="text-[#047857] font-bold">Quick</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* 2. REKOMENDACJE */}
                    <motion.div
                      animate={{ y: [4, -4] }}
                      transition={{ repeat: Infinity, repeatType: "reverse", duration: 3.8, ease: "easeInOut" }}
                      className="absolute right-[3%] top-[12%] w-[190px] bg-[#3B2F8C] text-white border border-[#3B2F8C] rounded-2xl p-3 shadow-md hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1 rounded-lg bg-white/20 text-[#F4A574]">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-mono text-white/70 font-bold uppercase">Rekomendacje</span>
                      </div>
                      <h4 className="font-sans font-black text-[11px] text-white uppercase leading-tight">
                        AI Action Plan
                      </h4>
                      <p className="text-[9px] text-[#E3DEEE] leading-normal mt-1 italic">
                        "Wprowadź Dzień Skupienia bez spotkań w środę"
                      </p>
                      <div className="mt-1.5 flex items-center gap-1 text-[8px] font-mono text-[#047857]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#047857] animate-pulse" />
                        Zalecana akcja HR
                      </div>
                    </motion.div>

                    {/* 3. NARZĘDZIA DLA MANAGERÓW */}
                    <motion.div
                      animate={{ y: [-5, 5] }}
                      transition={{ repeat: Infinity, repeatType: "reverse", duration: 4.2, ease: "easeInOut", delay: 0.3 }}
                      className="absolute left-[4%] bottom-[5%] w-[205px] bg-white border border-[#EFEAE1] rounded-2xl p-3 shadow-md hover:border-[#C4BBDE] hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1 rounded-lg bg-[#D1FAE5] text-[#047857]">
                          <Users2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-mono text-[#A39AB4] font-bold uppercase">Narzędzia Lidera</span>
                      </div>
                      <h4 className="font-sans font-black text-[11px] text-[#14183D] uppercase leading-tight">
                        Wsparcie Managerów
                      </h4>
                      <div className="mt-1.5 text-[9px] text-[#55506E] space-y-1">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-[#047857] shrink-0" />
                          <span>Checklisty 1-on-1</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-[#047857] shrink-0" />
                          <span>Wskazówki managerskie</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* 4. RAPORT */}
                    <motion.div
                      animate={{ y: [3, -3] }}
                      transition={{ repeat: Infinity, repeatType: "reverse", duration: 3.6, ease: "easeInOut", delay: 0.6 }}
                      className="absolute right-[4%] bottom-[14%] w-[180px] bg-white border border-[#EFEAE1] rounded-2xl p-3 shadow-md hover:border-[#C4BBDE] hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1 rounded-lg bg-[#B45309]/10 text-[#B45309]">
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-mono text-[#A39AB4] font-bold uppercase">Raporty</span>
                      </div>
                      <h4 className="font-sans font-black text-[11px] text-[#14183D] uppercase leading-tight">
                        Statystyki i trendy
                      </h4>
                      
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-[8px] font-mono text-[#55506E] mb-0.5">
                          <span>Wskaźnik eNPS</span>
                          <span className="font-bold text-[#3B2F8C]">+42</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#EFEAE1] rounded-full overflow-hidden">
                          <div className="h-full bg-[#3B2F8C] rounded-full" style={{ width: '75%' }} />
                        </div>
                      </div>
                    </motion.div>

                  </div>
                </div>
              </div>

              {/* Kluczowe funkcje list copy */}
              <div className="space-y-6 pt-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#A39AB4] font-mono border-b border-[#EFEAE1] pb-2">
                  Kluczowe funkcje, które zmieniają sposób delegacji pracy
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { num: "01", title: "Inteligentna analiza", desc: "Zintegrowane badanie 58 czynników w 11 obszarach — zaangażowanie, satysfakcja, preferowany styl zarządzania, komunikacja operacyjna, ścieżki rozwoju i wiele więcej." },
                    { num: "02", title: "Rekomendacje działań", desc: "Sztuczna inteligencja dostarcza konkretne, opracowane scenariusze działań, checklisty i narzędzia dla liderów dostosowane do najgłębszych symptomów." },
                    { num: "03", title: "Benchmarking rynkowy", desc: "Bezpieczne porównanie wyników między zróżnicowanymi działami wewnętrznymi oraz zewnętrznymi wskaźnikami rynkowymi dla Twojej branży." },
                    { num: "04", title: "Predykcja wypalenia", desc: "Analiza predykcyjna pozwala wykryć kluczowe ryzyka kadrowe znacznie wcześniej — rotację, wypalenie zawodowe czy narastające spięcia międzyoddziałowe." },
                    { num: "05", title: "Gotowe ankiety naukowe", desc: "Błyskawiczne uruchomienie standardowych badań: badanie miesięczne (17 pytań) • kwartalne (25 pytań) • roczne badanie głębokie (72 pytania)." }
                  ].map((feat, fidx) => (
                    <div key={fidx} className="bg-white border border-[#EFEAE1] p-6 rounded-2xl space-y-3 shadow-sm hover:border-[#C4BBDE] transition-colors relative">
                      <span className="text-sm font-bold text-[#F4A574] font-mono block">/ {feat.num}</span>
                      <h4 className="font-sans font-black text-sm text-[#14183D] uppercase tracking-tight">{feat.title}</h4>
                      <p className="text-xs text-[#55506E] leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 11 areas overview block - BEAUTIFUL AUTO-SCROLLING LAYOUT INSPIRED BY ATTACHED SCREENSHOT */}
              <div className="bg-[#14183D] border border-[#3B2F8C]/30 p-6 sm:p-10 lg:p-12 rounded-[32px] overflow-hidden relative bg-[radial-gradient(#3B2F8C_1px,transparent_1px)] [background-size:24px_24px]">
                {/* Custom styling for the seamless infinite vertical marquee */}
                <style>{`
                  @keyframes marquee-scroll-up {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                  }
                  .animate-marquee-scroll-up {
                    animation: marquee-scroll-up 130s linear infinite;
                  }
                `}</style>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  
                  {/* Left Column: Purpose-built copy + indicators + CTA */}
                  <div className="lg:col-span-5 space-y-6 sm:space-y-8">
                    <div className="space-y-3.5">
                      <span className="text-[10px] font-mono text-[#F4A574] uppercase font-bold tracking-wider block">
                        Metodologia Badania Satysfakcji i eNPS
                      </span>
                      <h3 className="font-sans font-black text-2xl sm:text-3xl lg:text-4xl text-white uppercase tracking-tight leading-[1.1]">
                        Badanie <span className="text-[#F4A574]">11 obszarów</span>, które budują silną organizację.
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl pt-2">
                        Nasz system analityczny pokrywa pełny przekrój doświadczenia zawodowego pracowników. Zamiast chaotycznych, pojedynczych ankiet, HRly bada 58 precyzyjnie dobranych czynników. Każde badanie automatycznie zasila centralny dashboard, pozwalając liderom natychmiast wychwycić rodzące się problemy.
                      </p>
                    </div>

                    {/* Grid of 4 key attributes inspired by the screenshot's subtext layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 border-t border-[#3B2F8C]/40 pt-6">
                      <div>
                        <h4 className="font-sans font-black text-xs text-[#FBFAF8] uppercase tracking-wider">
                          Naukowa struktura
                        </h4>
                        <p className="text-[11px] text-gray-400 leading-normal mt-1">
                          Metodologia oparta o standardy psychologii pracy, eNPS oraz kluczowe mierniki zaangażowania Gallupa.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-sans font-black text-xs text-[#FBFAF8] uppercase tracking-wider">
                          Mierzalny wpływ
                        </h4>
                        <p className="text-[11px] text-gray-400 leading-normal mt-1">
                          Każdy zbadany czynnik jest powiązany z symulowanym kosztem rotacji oraz wskaźnikami produktywności.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-sans font-black text-xs text-[#FBFAF8] uppercase tracking-wider">
                          AI Action Plan
                        </h4>
                        <p className="text-[11px] text-gray-400 leading-normal mt-1">
                          Menedżerowie nie otrzymują wyłącznie suchych liczb – system generuje natychmiastowe wskazówki operacyjne.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-sans font-black text-xs text-[#FBFAF8] uppercase tracking-wider">
                          Szybka konfiguracja
                        </h4>
                        <p className="text-[11px] text-gray-400 leading-normal mt-1">
                          Gotowe szablony badań pulse-check, kwartalnych i rocznych uruchomisz w mniej niż minutę.
                        </p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => setActiveTab('pricing')}
                        className="px-6 py-3 bg-white hover:bg-[#F4A574] text-[#14183D] hover:text-white text-[11px] font-mono font-bold uppercase rounded-full transition-all flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer select-none"
                      >
                        Zobacz naszą ofertę
                        <ArrowRight className="w-3.5 h-3.5 text-[#F4A574]" />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Auto-sliding column of cards (Continuous marquee) */}
                  <div className="lg:col-span-7 relative h-[520px] sm:h-[580px] overflow-hidden">
                    
                    {/* Decorative subtle top/bottom fade overlays to blend the scrolling seamlessly */}
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#14183D] via-[#14183D]/85 to-transparent z-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#14183D] via-[#14183D]/85 to-transparent z-10 pointer-events-none" />

                    {/* Marquee Container with duplicate list to loop perfectly */}
                    <div className="absolute w-full px-2 sm:px-4 py-6 flex flex-col gap-4 animate-marquee-scroll-up hover:[animation-play-state:paused]">
                      {[...RESEARCH_AREAS, ...RESEARCH_AREAS].map((area, idx) => {
                        const AreaIcon = getAreaIcon(area.num);
                        return (
                          <div 
                            key={idx}
                            className="bg-[#1D2254] border border-[#3B2F8C]/30 hover:border-[#F4A574]/50 p-4.5 rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 flex items-center gap-4 select-none relative group"
                          >
                            {/* Accent indicator bar on the left */}
                            <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-transparent group-hover:bg-[#F4A574] rounded-r transition-all" />

                            {/* Icon container with soft colored background to mimic the screenshot's premium feel */}
                            <div className="p-3 bg-[#14183D] border border-[#3B2F8C]/30 rounded-xl text-[#F4A574] shadow-xs group-hover:scale-105 transition-transform shrink-0">
                              <AreaIcon className="w-5 h-5" />
                            </div>

                            {/* Card text content */}
                            <div className="space-y-1 flex-1 min-w-0">
                              <h4 className="font-sans font-extrabold text-sm text-[#FBFAF8] uppercase tracking-tight truncate">
                                {area.title}
                              </h4>

                              {/* Styled arrow sub-impact line matching screenshot */}
                              <div className="flex items-start gap-1.5 text-xs text-gray-300 leading-snug">
                                <span className="text-[#F4A574] font-black shrink-0">↳</span>
                                <span className="text-[11px] font-sans font-medium text-gray-300/90">
                                  {getScreenshotImpactText(area.num)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>



              {/* Quick Call to Action features banner */}
              <div className="bg-[#F4F1EC] p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-[#14183D] uppercase">Poznaj wszystkie zaawansowane funkcje HRly</h4>
                  <p className="text-[11px] text-[#55506E] mt-0.5">Wdrożenie zajmuje mniej niż godzinę. Brak ukrytych barier wejściowych.</p>
                </div>
                <button
                  onClick={() => setActiveTab('pricing')}
                  className="px-5 py-2.5 bg-[#3B2F8C] hover:bg-[#231B5E] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  Załóż darmowe konto
                  <ArrowRight className="w-4 h-4 text-[#F4A574]" />
                </button>
              </div>

            </motion.div>
          )}

          {/* ================= PRICING (ROUTE = PRICING) ================= */}
          {activeTab === 'pricing' && (
            <motion.div
              key="pricing-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Premium Pricing Hero Section */}
              <div className="relative rounded-[32px] border border-[#C4BBDE]/55 bg-gradient-to-tr from-[#F4F1EC] via-[#FBFAF8] to-[#FFFFFF] p-6 sm:p-10 lg:p-14 overflow-hidden shadow-xl bg-[linear-gradient(to_right,rgba(196,187,222,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(196,187,222,0.12)_1px,transparent_1px)] bg-[size:24px_24px]">
                
                {/* Glowing aesthetic blurs */}
                <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-[#F4A574]/15 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-[#E3DEEE]/40 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-10">
                  <div className="space-y-6 max-w-xl text-center lg:text-left flex flex-col items-center lg:items-start">
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-[#E3DEEE]/85 text-[#3B2F8C] px-3.5 py-1.5 rounded-full border border-[#C4BBDE]/60 text-[10px] font-bold uppercase tracking-wider shadow-xs leading-none">
                      <Sparkles className="w-3.5 h-3.5 text-[#F4A574]" />
                      Cennik i Pakiety HRly
                    </div>

                    <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-[42px] text-[#14183D] tracking-tight leading-[1.1] uppercase">
                      Proste plany dopasowane do <br />
                      <span className="relative inline-block normal-case">
                        <span className="font-script italic font-medium text-[#3B2F8C] text-[1.12em] tracking-normal lowercase relative z-10 select-none">
                          rozmiaru Twojego zespołu
                        </span>
                        <svg 
                          className="absolute -bottom-1.5 left-0 w-full h-[8px] text-[#F4A574] opacity-80 pointer-events-none" 
                          viewBox="0 0 100 10" 
                          preserveAspectRatio="none"
                        >
                          <path 
                            d="M 3,6 Q 50,9 97,4" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="3.5" 
                            strokeLinecap="round" 
                          />
                        </svg>
                      </span>
                    </h2>

                    <p className="text-xs sm:text-sm text-[#55506E] leading-relaxed">
                      Zmień kulturę organizacyjną w oparciu o rzetelne badania zaangażowania i satysfakcji. Zacznij od optymalnego pakietu dla Twojego zespołu. Ceny są całkowicie transparentne i nie zawierają ukrytych opłat.
                    </p>

                    {/* Trust indicators */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 pt-4 border-t border-[#EFEAE1] text-[11px] text-[#A39AB4] font-mono w-full">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        Elastyczna zmiana planu
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        Miesięczna subskrypcja
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        Pełna faktura VAT
                      </span>
                    </div>
                  </div>

                  {/* Promo Banner Card inside Hero */}
                  <div className="w-full lg:w-80 bg-[#FBFAF8]/95 border border-[#C4BBDE]/60 rounded-2xl p-5 sm:p-6 shadow-lg relative shrink-0 backdrop-blur-xs flex flex-col justify-between">
                    <div className="absolute -top-3 -right-2.5 bg-[#F4A574] text-white text-[9px] font-mono font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider animate-bounce">
                      LIMITOWANA PROMOCJA
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-[#F4A574] bg-[#F4A574]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                          Gwarancja Ceny -50%
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-sans font-black text-[#14183D] text-sm sm:text-base uppercase tracking-tight leading-tight">
                          Zapisz się dziś, zachowaj rabat na zawsze
                        </h3>
                        <p className="text-[11px] text-[#55506E] leading-relaxed">
                          Dołącz do grona zadowolonych klientów korzystających ze specjalnej, długoterminowej zniżki <strong>50%</strong>. Ceny promocyjne zostaną przypisane do Twojego konta na stałe.
                        </p>
                      </div>
                      
                      <div className="pt-3 border-t border-[#EFEAE1]/80 space-y-2 text-[10px] text-[#A39AB4] font-mono">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                          <span>Brak długoterminowych zobowiązań</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                          <span>14-dniowy okres gwarancyjny</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculator component containing standard plans cards and slider */}
              <HrlyPricingCalculator onNavigate={setActiveTab} />

              {/* Contact Box copy from page 6 */}
              <section className="bg-white border border-[#EFEAE1] rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#F4A574]">Złożona struktura?</span>
                  <h3 className="font-display font-black text-lg text-[#14183D] uppercase tracking-tight leading-tight">
                    POTRZEBUJESZ DOPASOWANIA PLANU DLA DUŻEGO BIZNESU?
                  </h3>
                  <p className="text-xs text-[#55506E] leading-relaxed">
                    Porozmawiajmy o dedykowanym planie dla Twojej organizacji. Pomożemy dobrać precyzyjny zakres HRly do liczby pracowników na pokładzie, specyfiki przeprowadzania badań i wymaganego poziomu wsparcia analitycznego.
                  </p>
                </div>

                <div className="md:col-span-4 text-center md:text-right">
                  <button
                    onClick={() => setActiveTab('contact')}
                    className="w-full md:w-auto py-3.5 px-6 bg-[#3B2F8C] hover:bg-[#231B5E] text-white text-xs font-display font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] duration-200 cursor-pointer"
                  >
                    Skontaktuj się z nami →
                  </button>
                </div>
              </section>

            </motion.div>
          )}

          {/* ================= ABOUT (ROUTE = ABOUT) ================= */}
          {activeTab === 'about' && (
            <motion.div
              key="about-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12 animate-fade-in text-xs leading-relaxed text-[#55506E]"
            >
              {/* Premium About Us Hero Section */}
              <div className="relative rounded-[32px] border border-[#C4BBDE]/55 bg-gradient-to-tr from-[#F4F1EC] via-[#FBFAF8] to-[#FFFFFF] p-6 sm:p-10 lg:p-14 overflow-hidden shadow-xl bg-[linear-gradient(to_right,rgba(196,187,222,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(196,187,222,0.12)_1px,transparent_1px)] bg-[size:24px_24px]">
                
                {/* Glowing aesthetic blurs */}
                <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-[#F4A574]/15 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-[#3B2F8C]/10 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />
                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  {/* Left content block */}
                  <div className="lg:col-span-7 space-y-6 text-left flex flex-col items-start">
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-[#E3DEEE]/85 text-[#3B2F8C] px-3.5 py-1.5 rounded-full border border-[#C4BBDE]/60 text-[10px] font-bold uppercase tracking-wider shadow-xs leading-none">
                      <Users className="w-3.5 h-3.5 text-[#F4A574]" />
                      POZNAJ NASZĄ HISTORIĘ • O NAS
                    </div>

                    <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-[40px] text-[#14183D] tracking-tight leading-[1.1] uppercase">
                      Stworzone przez <br />
                      <span className="text-[#3B2F8C]">praktyków HR</span> dla tych,<br />
                      którzy napędzają biznes
                    </h2>

                    <p className="text-xs sm:text-sm text-[#55506E] leading-relaxed max-w-xl">
                      Założyliśmy HRly, ponieważ sami przez lata siedzieliśmy po Twojej stronie biurka. Widzieliśmy na własne oczy, jak organizacje toną w morzu surowych danych i chaotycznych ankiet, które nigdy nie przekładają się na merytoryczne działania operacyjne. Naszą misją jest dać liderom gotowe, zwięzłe odpowiedzi.
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={() => setActiveTab('contact')}
                        className="py-3 px-5 bg-[#3B2F8C] hover:bg-[#231B5E] text-white text-xs font-display font-extrabold uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] duration-200 cursor-pointer shadow-md"
                      >
                        Napisz do nas
                      </button>
                      <button
                        onClick={() => setIsDashboardOpen(true)}
                        className="py-3 px-5 bg-white border border-[#C4BBDE] hover:bg-[#F4F1EC] text-[#3B2F8C] text-xs font-display font-extrabold uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] duration-200 cursor-pointer shadow-sm"
                      >
                        Uruchom demo
                      </button>
                    </div>
                  </div>

                  {/* Right side: Modern Key Pillars block */}
                  <div className="lg:col-span-5 space-y-3.5">
                    
                    <div className="bg-white/90 border border-[#C4BBDE]/50 rounded-2xl p-5 shadow-md backdrop-blur-xs flex items-start gap-4">
                      <div className="p-2.5 bg-[#F4A574]/10 rounded-xl text-[#F4A574] shrink-0">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-sans font-extrabold text-[#14183D] text-xs uppercase tracking-wider">
                          Ludzkie podejście, twarde liczby
                        </h4>
                        <p className="text-[11px] text-[#55506E] leading-relaxed">
                          Łączymy ekspercką wiedzę z psychologii organizacji z twardą statystyką i wskaźnikami ROI.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/90 border border-[#C4BBDE]/50 rounded-2xl p-5 shadow-md backdrop-blur-xs flex items-start gap-4">
                      <div className="p-2.5 bg-[#3B2F8C]/10 rounded-xl text-[#3B2F8C] shrink-0">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-sans font-extrabold text-[#14183D] text-xs uppercase tracking-wider">
                          0% pustego raportowania
                        </h4>
                        <p className="text-[11px] text-[#55506E] leading-relaxed">
                          Menedżerowie nie dostają wyłącznie wykresów – system natychmiast generuje zwięzłe i mądre porady.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/90 border border-[#C4BBDE]/50 rounded-2xl p-5 shadow-md backdrop-blur-xs flex items-start gap-4">
                      <div className="p-2.5 bg-[#D1FAE5] text-[#047857] rounded-xl shrink-0">
                        <Target className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-sans font-extrabold text-[#14183D] text-xs uppercase tracking-wider">
                          Stałe doskonalenie
                        </h4>
                        <p className="text-[11px] text-[#55506E] leading-relaxed">
                          Stale kalibrujemy 58 mierzonych czynników, dopasowując je do wyzwań nowoczesnego rynku pracy.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Grid 01. Geneza & 02. Filozofia copy from page 6 & 7 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                
                <div className="space-y-3 bg-white border border-[#EFEAE1] p-6 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#3B2F8C]">
                    01 · GENEZA (DLACZEGO HRLY?)
                  </span>
                  <h3 className="font-sans font-bold text-[#14183D] text-sm uppercase tracking-tight">
                    Zagubieni w gąszczu statystyk bez przełożenia
                  </h3>
                  <p>
                    Wielokrotnie obserwowaliśmy ubiegające lata, w których specjaliści HR z doskonałą kobiecą lub męską intuicją nie mieli w rękach twardych, merytorycznych argumentów liczbowych, by skutecznie przeforsować zmiany na posiedzeniu zarządu. 
                  </p>
                  <p>
                    Postanowiliśmy to raz na zawsze odmienić. Dlatego wspólnie zbudowaliśmy autonomiczne narzędzie badawcze, którego sami jako dyrektorzy personalni i architekci chcielibyśmy na co dzień używać w naszych organizacjach.
                  </p>
                </div>

                <div className="space-y-3 bg-[#F4F1EC]/60 border border-[#C4BBDE]/50 p-6 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#3B2F8C]">
                    02 · FILOZOFIA DZIAŁANIA
                  </span>
                  <h3 className="font-sans font-bold text-[#14183D] text-sm uppercase tracking-tight">
                    Technologia, która staje się niewidzialna
                  </h3>
                  <p>
                    Dobra technologia to taka, która wykonuje najcięższą pracę statystyczną i matematyczną dyskretnie w tle, tak abyś Ty mógł całkowicie skupić się na żywych ludziach i budowie długoterminowej strategii kapitałowej.
                  </p>
                  <p>
                    HRly powstało na unikalnym szczeblu, na przecięciu wieloletniego doświadczenia w branży kadr, zaawansowanej analityki algebraicznej oraz asysty sztucznej inteligencji. Rezultat? Platforma, która nie tylko raportuje błędy, ale przede wszystkim szczerze doradza menedżerom.
                  </p>
                </div>

              </div>

              {/* Co-founder Quotation - BEAUTIFULLY STYLED PIECE */}
              <div className="relative max-w-3xl mx-auto my-6 px-4">
                <blockquote className="relative bg-gradient-to-br from-[#FBFAF8] to-[#F4F1EC] border border-[#EFEAE1] p-8 sm:p-10 rounded-[32px] text-center shadow-lg shadow-[#3B2F8C]/5 overflow-hidden">
                  {/* Decorative quote marks */}
                  <span className="absolute -top-4 -left-2 text-[120px] font-serif font-black text-[#F4A574]/15 pointer-events-none select-none">“</span>
                  <span className="absolute -bottom-16 right-4 text-[120px] font-serif font-black text-[#3B2F8C]/10 pointer-events-none select-none">”</span>
                  
                  <p className="relative z-10 font-sans italic text-[#14183D] text-xs sm:text-sm font-medium leading-relaxed md:px-6">
                    „Chcieliśmy stworzyć narzędzie, które każdy lider i specjalista HR może z pełnym przekonaniem przedstawić zarządowi, mówiąc: <span className="font-extrabold not-italic text-[#3B2F8C]">„Oto konkretny plan działania i rekomendacje na najbliższy poniedziałek”</span>. Bez przedzierania się przez skomplikowane wykresy, bez zatrudniania zewnętrznych analityków i bez tygodni żmudnego, ręcznego przetwarzania danych.”
                  </p>
                  
                  <div className="relative z-10 mt-6 pt-4 border-t border-[#EFEAE1]/80 inline-block mx-auto">
                    <cite className="block text-[10px] text-[#3B2F8C] font-mono uppercase font-black tracking-wider not-italic">
                      — Współtwórcy Platformy HRly
                    </cite>
                  </div>
                </blockquote>
              </div>

              {/* Statistics Pane Page 7 */}
              <div className="bg-white border border-[#EFEAE1] rounded-2xl p-6 text-center grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#A39AB4] font-mono block uppercase">ZESPÓŁ</span>
                  <strong className="text-2xl font-black text-[#14183D]">Ekspercki team</strong>
                  <p className="text-[11px] text-[#55506E]">Zróżnicowane kompetencje strategiczne</p>
                </div>
                <div className="border-t sm:border-t-0 sm:border-x border-[#EFEAE1] pt-4 sm:pt-0 space-y-1">
                  <span className="text-[10px] text-[#A39AB4] font-mono block uppercase">DOŚWIADCZENIE HR</span>
                  <strong className="text-2xl font-black text-[#14183D]">30+ Lat w branży</strong>
                  <p className="text-[11px] text-[#55506E]">Doświadczenia na stanowiskach kadr</p>
                </div>
                <div className="border-t sm:border-t-0 pt-4 sm:pt-0 space-y-1">
                  <span className="text-[10px] text-[#A39AB4] font-mono block uppercase">GŁÓWNY CEL</span>
                  <strong className="text-2xl font-black text-[#14183D]">1 Misja: dane w działanie</strong>
                  <p className="text-[11px] text-[#55506E]">Eliminujemy puste statystyki bez pokrycia</p>
                </div>
              </div>

              {/* Team Profile cards page 7 */}
              <div className="space-y-6 pt-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#A39AB4] font-mono border-b border-[#EFEAE1] pb-2 text-center">
                  Poznaj nasz zespół operacyjny
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Monika Ćwikła */}
                  <div className="bg-white border border-[#EFEAE1] p-5.5 rounded-2xl space-y-3 relative shadow-sm group hover:border-[#C4BBDE] transition-all">
                    <div className="w-12 h-12 rounded-full bg-[#E3DEEE] text-[#3B2F8C] flex items-center justify-center text-lg font-black shrink-0 shadow-inner">
                      MĆ
                    </div>
                    <div>
                      <h4 className="font-sans font-black text-sm text-[#14183D] leading-none">Monika Ćwikła</h4>
                      <p className="text-[10px] text-[#F4A574] font-bold mt-1 uppercase font-mono">HR i Strategia</p>
                    </div>
                    <p className="text-[11px] text-[#55506E] leading-relaxed">
                      Ponad 10 lat doświadczenia w HR, budowaniu i zarządzaniu zespołami. Łączy perspektywę HR i biznesu, dbając o to, żeby HRly dostarczało realną wartość managerom i organizacjom.
                    </p>
                  </div>

                  {/* Anna Kępczyńska */}
                  <div className="bg-white border border-[#EFEAE1] p-5.5 rounded-2xl space-y-3 relative shadow-sm group hover:border-[#C4BBDE] transition-all">
                    <div className="w-12 h-12 rounded-full bg-[#E3DEEE] text-[#3B2F8C] flex items-center justify-center text-lg font-black shrink-0 shadow-inner">
                      AK
                    </div>
                    <div>
                      <h4 className="font-sans font-black text-sm text-[#14183D] leading-none">Anna Kępczyńska</h4>
                      <p className="text-[10px] text-[#F4A574] font-bold mt-1 uppercase font-mono">Psychologia i Management</p>
                    </div>
                    <p className="text-[11px] text-[#55506E] leading-relaxed">
                      Doświadczony psycholog i menedżer z wieloletnim doświadczeniem w konsultingu personalnym. Na co dzień odpowiada za przyjazny w odbiorze, głęboko empatyczny i strategicznie zrozumiały język ankiet oraz komunikacji z liderami.
                    </p>
                  </div>

                  {/* Jakub Zacios */}
                  <div className="bg-white border border-[#EFEAE1] p-5.5 rounded-2xl space-y-3 relative shadow-sm group hover:border-[#C4BBDE] transition-all">
                    <div className="w-12 h-12 rounded-full bg-[#E3DEEE] text-[#3B2F8C] flex items-center justify-center text-lg font-black shrink-0 shadow-inner">
                      JZ
                    </div>
                    <div>
                      <h4 className="font-sans font-black text-sm text-[#14183D] leading-none">Jakub Zacios</h4>
                      <p className="text-[10px] text-[#F4A574] font-bold mt-1 uppercase font-mono">Technologia i Analiza</p>
                    </div>
                    <p className="text-[11px] text-[#55506E] leading-relaxed">
                      Zdolny architekt technologiczny, główny twórca nowatorskiego matematycznego silnika analitycznego oraz metodologii badania 58 czynników. Odpowiada za integrację z bazami danych i sprawne wyciąganie automatycznych raportów.
                    </p>
                  </div>

                </div>
              </div>

              {/* Misja i Wizja blocks page 7 */}
              <div className="bg-gradient-to-br from-[#3B2F8C] to-[#231B5E] text-white p-6 sm:p-10 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-[#F4A574] block uppercase">GŁÓWNA MISJA SPÓŁKI</span>
                  <h4 className="font-sans font-black text-sm tracking-tight text-white uppercase">Pomagamy firmom podejmować trafne decyzje</h4>
                  <p className="text-[#F4F1EC] leading-relaxed text-[11px]">
                    Pomagamy firmom i zarządom podejmować trafne, merytoryczne decyzje biznesowe oparte o rzeczywiste, zweryfikowane dane — tak, aby budowanie i rozwijanie wyjątkowych zespołów stało się dokładną nauką, a nie losową sztuką.
                  </p>
                </div>

                <div className="space-y-2 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
                  <span className="text-[10px] font-mono font-bold text-[#F4A574] block uppercase">SPÓJNA WIZJA ŚWIATA</span>
                  <h4 className="font-sans font-black text-sm tracking-tight text-white uppercase">Gdzie HR mówi uniwersalnym językiem biznesu</h4>
                  <p className="text-[#F4F1EC] leading-relaxed text-[11px]">
                    Świat, w którym dział personalny mówi zrozumiałym, twardym językiem finansów i biznesu, a każda nowoczesna organizacja ma swobodny dostęp do narzędzi budujących zaangażowane, produktywne i zdrowe zespoły.
                  </p>
                </div>
              </div>

            </motion.div>
          )}

          {/* ================= BLOG (ROUTE = BLOG) ================= */}
          {activeTab === 'blog' && (
            <motion.div
              key="blog-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <HrlyBlogSection />
            </motion.div>
          )}

          {/* ================= CONTACT (ROUTE = CONTACT) ================= */}
          {activeTab === 'contact' && (
            <motion.div
              key="contact-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
            >
              
              {/* Left Column: Coordinates details with Trust cards */}
              <div className="lg:col-span-5 bg-gradient-to-b from-[#FBFAF8] to-[#FFFFFF] border border-[#EFEAE1]/85 rounded-[28px] p-6 sm:p-8 flex flex-col justify-between space-y-8 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F4A574]/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#3B2F8C]/4 rounded-full blur-2xl pointer-events-none" />
                
                <div className="space-y-6 relative z-10">
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] tracking-widest font-extrabold uppercase bg-[#E3DEEE] text-[#3B2F8C] px-3.5 py-1.5 rounded-full border border-[#C4BBDE]/40 shadow-2xs leading-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F4A574]" />
                      BEZPOŚREDNI KONTAKT
                    </span>
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-[#14183D] uppercase tracking-tight">
                      Porozmawiajmy o <br className="hidden sm:inline" />
                      <span className="text-[#3B2F8C]">zaangażowaniu</span>
                    </h2>
                    <p className="text-xs text-[#55506E] leading-relaxed">
                      Chętnie odpowiemy na Twoje pytania, zaprezentujemy interaktywny pulpit menedżerski na żywo lub przygotujemy dedykowaną wycenę dla Twojej organizacji.
                    </p>
                  </div>

                  <div className="space-y-3">
                    
                    <a href="mailto:kontakt@hrly.pl" className="bg-white border border-[#EFEAE1]/60 rounded-xl p-4 flex gap-3.5 items-center hover:border-[#C4BBDE] hover:shadow-2xs transition-all group cursor-pointer block">
                      <div className="w-10 h-10 rounded-xl bg-[#3B2F8C]/10 text-[#3B2F8C] flex items-center justify-center shrink-0 group-hover:bg-[#3B2F8C] group-hover:text-white transition-colors duration-300">
                        <Mail className="w-5 h-5 text-[#F4A574]" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A39AB4] font-mono block uppercase font-bold tracking-wider">Napisz e-mail</span>
                        <strong className="text-xs text-[#14183D] group-hover:text-[#3B2F8C] transition-colors">kontakt@hrly.pl</strong>
                      </div>
                    </a>

                    <div className="bg-white border border-[#EFEAE1]/60 rounded-xl p-4 flex gap-3.5 items-center hover:border-[#C4BBDE] hover:shadow-2xs transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-[#3B2F8C]/10 text-[#3B2F8C] flex items-center justify-center shrink-0 group-hover:bg-[#3B2F8C] group-hover:text-white transition-colors duration-300">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A39AB4] font-mono block uppercase font-bold tracking-wider">Czas odpowiedzi</span>
                        <strong className="text-xs text-[#14183D]">Maksymalnie 24 godziny</strong>
                      </div>
                    </div>

                    <div className="bg-white border border-[#EFEAE1]/60 rounded-xl p-4 flex gap-3.5 items-center hover:border-[#C4BBDE] hover:shadow-2xs transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-[#3B2F8C]/10 text-[#3B2F8C] flex items-center justify-center shrink-0 group-hover:bg-[#3B2F8C] group-hover:text-white transition-colors duration-300">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#A39AB4] font-mono block uppercase font-bold tracking-wider">Lokalizacja spółki</span>
                        <strong className="text-xs text-[#14183D]">Warszawa, Polska</strong>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-[#EFEAE1]/70 relative z-10">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/50 border border-[#EFEAE1]/55 rounded-lg p-3 text-center">
                      <span className="text-[14px] font-black text-[#3B2F8C] block">100%</span>
                      <span className="text-[9px] uppercase font-bold text-[#A39AB4] font-mono">Poufność danych</span>
                    </div>
                    <div className="bg-white/50 border border-[#EFEAE1]/55 rounded-lg p-3 text-center">
                      <span className="text-[14px] font-black text-[#3B2F8C] block">RODO</span>
                      <span className="text-[9px] uppercase font-bold text-[#A39AB4] font-mono">Zgodność prawna</span>
                    </div>
                  </div>

                  <p className="text-[9.5px] text-[#A39AB4] leading-relaxed text-center font-medium">
                    Właścicielem platformy i praw autorskich do kwestionariuszy jest podmiot prawny: <strong className="text-[#55506E]">HRLY Sp. z o.o.</strong> z siedzibą w Warszawie.
                  </p>
                </div>

              </div>

              {/* Right Column: Contact Form */}
              <div className="lg:col-span-7 relative flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#3B2F8C]/3 rounded-full blur-3xl pointer-events-none" />
                
                {!contactSuccess ? (
                  <form onSubmit={handleContactSubmit} className="space-y-5 relative z-10">
                    
                    <div className="border-b border-[#EFEAE1] pb-3.5">
                      <h3 className="font-sans font-black text-sm text-[#14183D] uppercase tracking-wider">
                        Formularz zapytania
                      </h3>
                      <p className="text-[10px] text-[#A39AB4] font-mono mt-1 uppercase font-bold">
                        Wypełnij wymagane pola, odpowiemy ekspresowo
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-extrabold text-[#55506E] font-mono tracking-wider block">Twoje Imię *</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="np. Anna Kępczyńska"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full text-xs bg-[#FBFAF8] border border-[#EFEAE1] rounded-xl pl-9 pr-3 py-2.5 text-[#14183D] focus:border-[#3B2F8C] focus:bg-white focus:outline-none placeholder-[#A39AB4]/60 transition-all shadow-2xs"
                          />
                          <User className="w-4 h-4 text-[#A39AB4] absolute left-3 top-3" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-extrabold text-[#55506E] font-mono tracking-wider block">Adres Email *</label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            placeholder="np. analityka@twojafirma.pl"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full text-xs bg-[#FBFAF8] border border-[#EFEAE1] rounded-xl pl-9 pr-3 py-2.5 text-[#14183D] focus:border-[#3B2F8C] focus:bg-white focus:outline-none placeholder-[#A39AB4]/60 transition-all shadow-2xs"
                          />
                          <Mail className="w-4 h-4 text-[#A39AB4] absolute left-3 top-3" />
                        </div>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-extrabold text-[#55506E] font-mono tracking-wider block">Nazwa Firmy</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="np. HRLY Sp. z o.o."
                            value={contactCompany}
                            onChange={(e) => setContactCompany(e.target.value)}
                            className="w-full text-xs bg-[#FBFAF8] border border-[#EFEAE1] rounded-xl pl-9 pr-3 py-2.5 text-[#14183D] focus:border-[#3B2F8C] focus:bg-white focus:outline-none placeholder-[#A39AB4]/60 transition-all shadow-2xs"
                          />
                          <Building className="w-4 h-4 text-[#A39AB4] absolute left-3 top-3" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-extrabold text-[#55506E] font-mono tracking-wider block">Temat rozmowy</label>
                        <div className="relative">
                          <select
                            value={contactSubject}
                            onChange={(e) => setContactSubject(e.target.value)}
                            className="w-full text-xs bg-[#FBFAF8] border border-[#EFEAE1] rounded-xl pl-9 pr-8 py-2.5 text-[#14183D] focus:border-[#3B2F8C] focus:bg-white focus:outline-none cursor-pointer appearance-none shadow-2xs font-medium"
                          >
                            <option value="Zapytanie o platformę">Demo platformy analitycznej</option>
                            <option value="Pytanie o ofertę">Wycena wdrożenia i cennik</option>
                            <option value="Wsparcie techniczne">Współpraca partnerska / Doradztwo</option>
                            <option value="Inne">Inne zapytanie</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-[#55506E] absolute right-3 top-3 pointer-events-none" />
                          <HelpCircle className="w-4 h-4 text-[#A39AB4] absolute left-3 top-3" />
                        </div>
                      </div>

                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-extrabold text-[#55506E] font-mono tracking-wider block">Wiadomość *</label>
                      <div className="relative">
                        <textarea
                          required
                          rows={4}
                          placeholder="Opisz krótko potrzeby Twojej organizacji, liczbę pracowników lub obszary, które chcesz zbadać (np. rotacja, wypalenie zawodowe)..."
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          className="w-full text-xs bg-[#FBFAF8] border border-[#EFEAE1] rounded-xl pl-9 pr-3 py-2.5 text-[#14183D] focus:border-[#3B2F8C] focus:bg-white focus:outline-none resize-none placeholder-[#A39AB4]/60 transition-all shadow-2xs"
                        />
                        <MessageSquareText className="w-4 h-4 text-[#A39AB4] absolute left-3 top-3" />
                      </div>
                    </div>

                    {/* RODO Consent Checkbox */}
                    <div className="flex items-start gap-2.5 pt-1 font-normal text-[10px] text-[#55506E] leading-relaxed">
                      <input
                        type="checkbox"
                        id="form-consent"
                        required
                        checked={contactConsent}
                        onChange={(e) => setContactConsent(e.target.checked)}
                        className="w-4 h-4 rounded border-[#C4BBDE]/50 text-[#3B2F8C] focus:ring-[#3B2F8C] cursor-pointer mt-0.5 accent-[#3B2F8C]"
                      />
                      <label htmlFor="form-consent" className="select-none cursor-pointer">
                        * Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z polityką prywatności HRly w celu obsługi korespondencji i udzielenia odpowiedzi rynkowej.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={!contactConsent}
                      className="w-full py-3 px-4 bg-[#3B2F8C] hover:bg-[#231B5E] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-tight shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Wyślij zapytanie do konsultanta</span>
                      <ArrowRight className="w-4 h-4 text-[#F4A574]" />
                    </button>

                  </form>
                ) : (
                  <div className="text-center py-10 space-y-5">
                    <div className="w-16 h-16 bg-[#D1FAE5] text-[#047857] border border-[#047857]/30 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#047857] font-mono block">Dziękujemy za kontakt!</span>
                      <h3 className="font-sans font-black text-xl text-[#14183D] tracking-tight">Wiadomość została wysłana!</h3>
                      <p className="text-xs text-[#55506E] max-w-md mx-auto leading-relaxed">
                        Droga / Drogi <strong>{contactName}</strong>, Twoje zapytanie dotyczące tematu <strong>{contactSubject}</strong> zostało zapisane. Nasz zespół (kontakt@hrly.pl) skontaktuje się z Tobą w ciągu najbliższych 24 godzin z odpowiedzią rynkową.
                      </p>
                    </div>

                    <button
                      onClick={handleCloseContactSuccess}
                      className="px-6 py-2.5 bg-[#F4F1EC] hover:bg-[#EFEAE1] text-[#3B2F8C] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Napisz kolejną wiadomość
                    </button>
                  </div>
                )}

              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ================= FOOTER COMPONENT SPEC (Page 3 & 10) ================= */}
      <footer className="w-full bg-[#14183D] border-t border-[#3B2F8C]/35 mt-16 py-12 text-xs text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand block */}
          <div className="md:col-span-7 space-y-3.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <svg 
                className="w-8 h-8" 
                viewBox="0 0 100 100" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="41" stroke="#3B2F8C" strokeWidth="1.8" fill="none" />
                <circle cx="50" cy="50" r="29" stroke="#3B2F8C" strokeWidth="2.4" fill="none" opacity="0.6" />
                <circle cx="50" cy="50" r="17" stroke="#F4A574" strokeWidth="2" fill="none" opacity="0.8" />
                <circle cx="50" cy="50" r="5.5" fill="#F4A574" />
              </svg>
              <span className="font-display font-extrabold text-white text-[18px] tracking-tighter lowercase">
                hrly
              </span>
            </div>
            
            <p className="text-[11px] leading-relaxed max-w-sm text-gray-300">
              Inteligentna platforma analityki kapitału ludzkiego i pulsów zaangażowania pracowników firmy. Spójne raportowanie i toolkit menedżerski.
            </p>

            <p className="text-[9px] text-[#A5ADC6] font-mono leading-none">
              HRLY Sp. z o.o. • Made with Human Care in Poland • All rights reserved.
            </p>
          </div>

          {/* Quick link matrices */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4 text-center md:text-left font-semibold text-[11px] text-gray-300">
            <div className="space-y-2">
              <span className="text-[10px] text-[#F4A574] font-mono uppercase font-bold tracking-wider block">Opcje menu</span>
              <button onClick={() => setActiveTab('features')} className="block hover:text-[#F4A574] focus:outline-none w-full md:text-left transition-colors cursor-pointer">Funkcje</button>
              <button onClick={() => setActiveTab('pricing')} className="block hover:text-[#F4A574] focus:outline-none w-full md:text-left transition-colors cursor-pointer">Cennik</button>
              <button onClick={() => setActiveTab('about')} className="block hover:text-[#F4A574] focus:outline-none w-full md:text-left transition-colors cursor-pointer">O nas</button>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] text-[#F4A574] font-mono uppercase font-bold tracking-wider block">Baza wiedzy</span>
              <button onClick={() => setActiveTab('blog')} className="block hover:text-[#F4A574] focus:outline-none w-full md:text-left transition-colors cursor-pointer">Blog / Baza wiedzy</button>
              <button onClick={() => setActiveTab('contact')} className="block hover:text-[#F4A574] focus:outline-none w-full md:text-left transition-colors cursor-pointer">Kontakt z nami</button>
              <a href="#privacy" className="block hover:text-[#F4A574] w-full md:text-left transition-colors cursor-not-allowed">Polityka prywatności</a>
              <a href="#rules" className="block hover:text-[#F4A574] w-full md:text-left transition-colors cursor-not-allowed">Regulamin</a>
            </div>
          </div>

        </div>
      </footer>

      {/* ================= OPTIONAL DEMO CALENDAR DIALOG (Lightbox) ================= */}
      {demoDialogOpen && (
        <div className="fixed inset-0 bg-[#14183D]/65 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white border border-[#EFEAE1] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            
            <button 
              onClick={() => setDemoDialogOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-[#F4F1EC] text-[#55506E] rounded-full cursor-pointer"
              title="Zamknij okno"
            >
              <X className="w-5 h-5" />
            </button>

            {!demoSuccess ? (
              <form onSubmit={handleDemoSubmit} className="space-y-4 pt-1.5">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#F4A574] font-mono">Konsultacja HR</span>
                  <h3 className="font-sans font-black text-base text-[#14183D] tracking-tight">
                    Umów spotkanie Demo HRly
                  </h3>
                  <p className="text-[11px] text-[#55506E] leading-relaxed">
                    Nasz starszy doradca personalny skontaktuje się, by zaprezentować interaktywny pulpit dla Twojej kadry.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#55506E] block">Służbowy adres Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="menedzer@twojaorganizacja.pl"
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      className="w-full text-xs bg-[#FBFAF8] border border-[#EFEAE1] rounded-lg p-2.5 text-[#14183D] focus:border-[#3B2F8C]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#55506E] block">Sugerowany termin (Dzień) *</label>
                    <input
                      type="date"
                      required
                      value={demoDate}
                      onChange={(e) => setDemoDate(e.target.value)}
                      className="w-full text-xs bg-[#FBFAF8] border border-[#EFEAE1] rounded-lg p-2.5 text-[#14183D] focus:border-[#3B2F8C] cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#3B2F8C] hover:bg-[#231B5E] text-white rounded-xl text-xs font-display font-extrabold uppercase tracking-wider shadow transition-all active:scale-[0.98] duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Potwierdź i rezerwuj termin
                  <ArrowRight className="w-4 h-4 text-[#F4A574]" />
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 bg-[#D1FAE5] text-[#047857] rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-mono font-bold text-[#047857]">Termin zablokowany!</span>
                  <h4 className="font-sans font-bold text-sm text-[#14183D]">Demo zarezerwowane na dzień {demoDate}!</h4>
                  <p className="text-[11px] text-[#55506E] leading-relaxed mx-auto max-w-xs">
                    Wysłaliśmy natychmiastowe zaproszenie do wideokonferencji Google Meet na podany adres e-mail: <strong>{demoEmail}</strong>. Do zobaczenia w akcji!
                  </p>
                </div>
                <button
                  onClick={handleCloseDemoSuccess}
                  className="px-4 py-2 bg-[#F4F1EC] text-[#3B2F8C] text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Powróć do strony
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ================= INTERACTIVE RESEARCH DASHBOARD LIGHTBOX MODAL ================= */}
      <AnimatePresence>
        {isDashboardOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Dark blur backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDashboardOpen(false)}
              className="fixed inset-0 bg-[#14183D]/80 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Body Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="relative bg-[#FBFAF8] w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl border border-[#EFEAE1]/80 z-10 flex flex-col custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header inside Modal with close action */}
              <div className="sticky top-0 bg-[#FBFAF8] z-30 px-6 py-4 border-b border-[#EFEAE1] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F4A574]" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3B2F8C]">Interaktywne Demo HRly</span>
                </div>
                <button 
                  onClick={() => setIsDashboardOpen(false)}
                  className="p-2 bg-[#14183D]/5 hover:bg-[#14183D]/10 text-[#14183D] rounded-full transition-all cursor-pointer flex items-center justify-center"
                  title="Zamknij pulpit"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Render Dashboard Component */}
              <div className="p-4 sm:p-6">
                <HrlyDashboardPreview />
              </div>

              {/* Subtle Footer inside Modal */}
              <div className="bg-[#F4F1EC]/40 px-6 py-4.5 border-t border-[#EFEAE1] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-[#55506E] text-center sm:text-left">
                  To jest rzeczywisty podgląd działania modułu analitycznego HRly. Chcesz dostosować ankiety do swojej firmy?
                </p>
                <button 
                  onClick={() => {
                    setIsDashboardOpen(false);
                    setActiveTab('pricing');
                  }}
                  className="px-5 py-2.5 bg-[#3B2F8C] hover:bg-[#231B5E] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Załóż darmowe konto
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
