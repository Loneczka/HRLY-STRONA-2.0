import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { 
  Sparkles, ShieldCheck, Mail, ArrowRight, CheckCircle2, Download,
  MapPin, Clock, MessageSquareText, Menu, X, Users, 
  Activity, ArrowUpRight, Award, ChevronRight, HelpCircle,
  FileSpreadsheet, FileQuestion, Users2, Landmark, Compass, Target,
  ChevronDown, ChevronUp, Coins, Laptop, Heart, Coffee, GraduationCap, Zap, Key,
  User, Building, MousePointerClick
} from 'lucide-react';
import { HrlyHeroGraphic } from './components/HrlyHeroGraphic';
import { Button } from './components/Button';
import { SectionLabel } from './components/SectionLabel';
import { addLead, useSiteConfig } from './hooks/useSiteConfig';

const HrlyDashboardPreview = lazy(() => import('./components/HrlyDashboardPreview').then(m => ({ default: m.HrlyDashboardPreview })));
const HrlyBlogSection = lazy(() => import('./components/HrlyBlogSection'));
const HrlyPricingCalculator = lazy(() => import('./components/HrlyPricingCalculator').then(m => ({ default: m.HrlyPricingCalculator })));
const HrlyMethodologyVisual = lazy(() => import('./components/HrlyMethodologyVisual').then(m => ({ default: m.HrlyMethodologyVisual })));

// Admin panel is heavy (pulls in @google/genai) and only used on the /admin tab,
// so load it on demand to keep the public bundle small.
const AdminPanel = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));

type PageRoute = 'home' | 'features' | 'pricing' | 'about' | 'blog' | 'contact' | 'admin';

/** FAZA 5.4 — numer sekcji dokłada <SectionLabel>, więc z tekstu z CMS zdejmujemy prefiks „NN · ". */
const stripSectionNumber = (text: string): string => text.replace(/^\s*\d{1,2}\s*[·.\u2013-]\s*/, '');

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
  const { config, updateSection } = useSiteConfig();
  const [activeTab, setActiveTab] = useState<PageRoute>(() => {
    const hash = window.location.hash.replace('#', '');
    const validRoutes = ['home', 'features', 'pricing', 'about', 'blog', 'contact', 'admin'];
    return (validRoutes.includes(hash) ? hash : 'home') as PageRoute;
  });

  // Hash routing to allow direct URLs like /#admin, /#pricing, etc.
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validRoutes = ['home', 'features', 'pricing', 'about', 'blog', 'contact', 'admin'];
      if (validRoutes.includes(hash)) {
        setActiveTab(hash as PageRoute);
      } else if (!hash) {
        setActiveTab('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync activeTab changes to the URL hash
  useEffect(() => {
    const currentHash = window.location.hash.replace('#', '');
    if (activeTab === 'home') {
      if (window.location.hash) {
        window.history.pushState('', document.title, window.location.pathname + window.location.search);
      }
    } else if (currentHash !== activeTab) {
      window.location.hash = activeTab;
    }
  }, [activeTab]);

  // Scroll to top on route change to keep UX pristine
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [activeTab]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroRole, setHeroRole] = useState<'director' | 'manager' | 'ceo'>('director');
  const [activeFeatureTab, setActiveFeatureTab] = useState<'cyclical' | 'pulse' | 'onboarding' | 'custom'>('cyclical');
  const [selectedFactor, setSelectedFactor] = useState<'engagement' | 'atmosphere' | 'burnout' | 'growth' | 'leadership'>('engagement');
  const [activeTile, setActiveTile] = useState<'szablony' | 'rekomendacje' | 'managerowie' | 'raport'>('szablony');
  const [selectedAreaIndex, setSelectedAreaIndex] = useState<number>(0);
  const [simulatorLevel, setSimulatorLevel] = useState<'niski' | 'sredni' | 'wysoki'>('sredni');

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
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);


  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactConsent) return;
    // Save lead to localStorage for admin panel inbox
    addLead({
      name: contactName,
      email: contactEmail,
      company: contactCompany,
      subject: contactSubject,
      message: contactMessage,
      type: 'contact',
    });
    setContactSuccess(true);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save demo request to localStorage for admin panel inbox
    addLead({
      name: demoEmail,
      email: demoEmail,
      company: '',
      subject: 'Prośba o demo',
      message: demoDate ? `Preferowany termin: ${demoDate}` : 'Brak podanego terminu',
      type: 'demo',
      demoDate: demoDate,
    });
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

  // Admin panel - full screen takeover (lazy-loaded chunk)
  if (activeTab === 'admin') {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-[#FBFAF8] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#3B2F8C] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-[#55506E] animate-pulse">Ładowanie panelu administracyjnego...</p>
          </div>
        </div>
      }>
        <AdminPanel />
      </Suspense>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-neutral-bg text-text-dark flex flex-col font-sans antialiased selection:bg-accent-apricot/30 selection:text-text-dark">
      
      {/* Top Elegant Sticky Navigation Header */}
      <header className="w-full bg-neutral-surface/80 backdrop-blur-md border-b border-border-soft/60 sticky top-0 z-[9900] px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand Mark */}
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-left cursor-pointer group"
            aria-label="hrly — strona główna"
          >
            <svg 
              className="w-9 h-9 transition-transform duration-300 group-hover:scale-105" 
              viewBox="0 0 100 100" 
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Outer concentric ring */}
              <circle cx="50" cy="50" r="41" stroke="var(--color-primary-light)" strokeWidth="1.8" fill="none" />
              {/* Middle concentric ring */}
              <circle cx="50" cy="50" r="29" stroke="var(--color-border-indigo)" strokeWidth="2.4" fill="none" />
              {/* Inner concentric ring */}
              <circle cx="50" cy="50" r="17" stroke="var(--color-indigo-primary)" strokeWidth="3" fill="none" />
              {/* Center dot */}
              <circle cx="50" cy="50" r="5.5" fill="var(--color-indigo-primary)" />
            </svg>
            <div>
              <span className="block font-display font-extrabold text-text-dark text-[20px] leading-none tracking-tighter lowercase">
                hrly
              </span>
            </div>
          </button>

          {/* Desktop Navigation Link Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-primary-faint/60 p-1 rounded-xl border border-border-soft/40">
            <button
              onClick={() => setActiveTab('features')}
              className={`px-4 py-1.5 rounded-lg type-body-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'features'
                  ? 'bg-white text-indigo-primary shadow-xs'
                  : 'text-muted-purple hover:text-text-dark'
              }`}
            >
              Funkcje
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-4 py-1.5 rounded-lg type-body-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-white text-indigo-primary shadow-xs'
                  : 'text-muted-purple hover:text-text-dark'
              }`}
            >
              Cennik
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`px-4 py-1.5 rounded-lg type-body-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'blog'
                  ? 'bg-white text-indigo-primary shadow-xs'
                  : 'text-muted-purple hover:text-text-dark'
              }`}
            >
              Baza wiedzy
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-1.5 rounded-lg type-body-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-white text-indigo-primary shadow-xs'
                  : 'text-muted-purple hover:text-text-dark'
              }`}
            >
              Kontakt
            </button>
          </nav>

          {/* Action Zone (Demo / Registration) */}
          <div className="hidden lg:flex items-center gap-3">
            <Button size="md" icon={<ArrowRight />} onClick={() => { setActiveTab('pricing'); }}>
              Załóż darmowe konto
            </Button>
          </div>

          {/* Mobile menu hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            className="lg:hidden p-1.5 rounded-lg hover:bg-primary-faint text-text-dark cursor-pointer"
            aria-label={mobileMenuOpen ? "Zamknij menu nawigacyjne" : "Otwórz menu nawigacyjne"}
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
            className="lg:hidden bg-white border-b border-border-soft/60 overflow-hidden sticky top-[61px] z-[9800]"
          >
            <nav className="flex flex-col p-4 space-y-2">
              <button 
                onClick={() => { setActiveTab('features'); setMobileMenuOpen(false); }}
                className={`p-3 text-left type-body-sm font-semibold rounded-lg cursor-pointer ${activeTab === 'features' ? 'bg-indigo-primary text-white' : 'text-muted-purple'}`}
              >
                Funkcje
              </button>
              <button 
                onClick={() => { setActiveTab('pricing'); setMobileMenuOpen(false); }}
                className={`p-3 text-left type-body-sm font-semibold rounded-lg cursor-pointer ${activeTab === 'pricing' ? 'bg-indigo-primary text-white' : 'text-muted-purple'}`}
              >
                Cennik
              </button>
              <button 
                onClick={() => { setActiveTab('blog'); setMobileMenuOpen(false); }}
                className={`p-3 text-left type-body-sm font-semibold rounded-lg cursor-pointer ${activeTab === 'blog' ? 'bg-indigo-primary text-white' : 'text-muted-purple'}`}
              >
                Baza wiedzy
              </button>
              <button 
                onClick={() => { setActiveTab('contact'); setMobileMenuOpen(false); }}
                className={`p-3 text-left type-body-sm font-semibold rounded-lg cursor-pointer ${activeTab === 'contact' ? 'bg-indigo-primary text-white' : 'text-muted-purple'}`}
              >
                Kontakt
              </button>
              
              <div className="pt-3 border-t border-border-soft flex flex-col gap-2">
                <Button size="md" fullWidth onClick={() => { setActiveTab('pricing'); setMobileMenuOpen(false); }}>
                  Załóż darmowe konto
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dynamic Workspace / View Manager */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-24">
        <AnimatePresence mode="wait">
          
          {/* ================= STRONA GŁÓWNA (ROUTE = HOME) ================= */}
          {activeTab === 'home' && (
            <motion.div
              key="home-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-24"
            >
              
              {/* Premium Hero Section */}
              <section className="relative rounded-[32px] border border-border-indigo/35 bg-gradient-to-tr from-primary-faint via-neutral-bg to-neutral-surface p-6 sm:p-10 lg:p-14 flex flex-col items-center justify-between gap-12 overflow-hidden shadow-xl md:shadow-2xl">
                
                {/* Glowing aesthetic blurs */}
                <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-primary-light/40 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-primary-light/30 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />
                
                <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
                  <div className="space-y-6 max-w-xl text-center lg:text-left flex flex-col items-center lg:items-start">
                    
                    {/* Etykieta sekcji 01 (treść z CMS; numer dokłada SectionLabel) */}
                    <SectionLabel number="01" icon={<Sparkles />}>
                      {stripSectionNumber(config.hero.badge || "01 · ANALITYKA I REKOMENDACJE HR W KILKA MINUT")}
                    </SectionLabel>

                    {/* Headline & Description */}
                    <div className="space-y-4">
                      <h1 className="font-display type-display text-text-dark uppercase">
                        {config.hero.headline.includes('a nie na domysłach') ? (
                          <>
                            Decyzje HR oparte <br />na danych, <br />
                            <span className="text-indigo-primary normal-case italic font-normal">a nie na domysłach.</span>
                          </>
                        ) : config.hero.headline}
                      </h1>
                      <p className="type-body-lg text-muted-purple max-w-lg">
                        {config.hero.subheadline || "Automatyczna platforma HR Analytics, która bada nastroje zespołu, predykcyjnie wykrywa ryzyka odejść i dostarcza menedżerom gotowe plany działań oraz checklisty w kilka minut."}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto pt-2">
                      <Button size="lg" className="w-full sm:w-auto" onClick={() => setActiveTab('pricing')}>
                        {config.hero.ctaPrimaryText || "Wypróbuj bezpłatnie"}
                      </Button>
                      
                      <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => setIsDashboardModalOpen(true)}>
                        {config.hero.ctaSecondaryText || "Obejrzyj demo interaktywne"}
                      </Button>
                    </div>

                    {/* Trust small indicators */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 pt-4 border-t border-border-soft type-label text-muted-indigo font-mono w-full">
                      <span className="flex items-center gap-1">
                        <span className="text-success">✓</span>
                        14 dni testu bez karty
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-success">✓</span>
                        Pełna zgodność z RODO
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-success">✓</span>
                        Wdrożenie w 15 minut
                      </span>
                    </div>
                  </div>

                  {/* Modern Hero Graphic directly rendered */}
                  <div className="relative w-full lg:w-[440px] shrink-0">
                    <HrlyHeroGraphic />
                  </div>
                </div>

                {/* Dynamic Stats Row from CMS config */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-border-soft/60 mt-8 relative z-10">
                  <div className="bg-white/80 border border-border-soft/75 p-5 rounded-2xl shadow-2xs text-center hover:border-border-indigo/55 transition-all">
                    <div className="type-h2 text-indigo-primary font-mono">{config.stats.stat1Value || "58"}</div>
                    <div className="type-label text-muted-indigo font-mono uppercase mt-2">{config.stats.stat1Label || "Analizowanych czynników"}</div>
                  </div>
                  <div className="bg-white/80 border border-border-soft/75 p-5 rounded-2xl shadow-2xs text-center hover:border-border-indigo/55 transition-all">
                    <div className="type-h2 text-indigo-primary font-mono">{config.stats.stat2Value || "10×"}</div>
                    <div className="type-label text-muted-indigo font-mono uppercase mt-2">{config.stats.stat2Label || "Szybsze raportowanie"}</div>
                  </div>
                  <div className="bg-white/80 border border-border-soft/75 p-5 rounded-2xl shadow-2xs text-center hover:border-border-indigo/55 transition-all">
                    <div className="type-h2 text-indigo-primary font-mono">{config.stats.stat3Value || "+23%"}</div>
                    <div className="type-label text-muted-indigo font-mono uppercase mt-2">{config.stats.stat3Label || "Wzrost zaangażowania"}</div>
                  </div>
                </div>
              </section>

              {/* SECTION: Interactive Demo Trigger Banner */}
              <section className="bg-white border border-border-soft/80 rounded-[32px] p-8 sm:p-12 text-center relative overflow-hidden shadow-xs">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="max-w-2xl mx-auto space-y-6 relative z-10">
                  <SectionLabel number="02">Pulpit demonstracyjny</SectionLabel>
                  <h2 className="font-display type-h2 text-text-dark uppercase">
                    Przetestuj interaktywny pulpit HRly
                  </h2>
                  <p className="type-body-lg text-muted-purple max-w-lg mx-auto">
                    Przekonaj się, jak w prosty sposób diagnozujemy 58 czynników zaangażowania i automatycznie dostarczamy menedżerom gotowe plany działań.
                  </p>
                  <div className="flex flex-col items-center justify-center pt-4 relative">
                    <div className="relative group">
                      
                      <Button size="lg" icon={<ArrowUpRight />} className="relative z-10" onClick={() => setIsDashboardModalOpen(true)}>
                        Otwórz przykładowy raport
                      </Button>

                      {/* Small floating pointer icon to suggest clicking */}
                      <motion.div
                        className="absolute -right-4 -bottom-4 bg-text-dark border border-white/20 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg pointer-events-none z-20"
                        animate={{
                          y: [0, -4, 0],
                          x: [0, -4, 0],
                          scale: [1, 0.9, 1]
                        }}
                        transition={{
                          duration: 2.2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <MousePointerClick className="w-3.5 h-3.5 text-accent-apricot animate-pulse" />
                      </motion.div>
                    </div>
                    
                    {/* Interactive hint text below the button */}
                    <span className="type-label text-muted-indigo font-mono mt-4 flex items-center gap-1.5 uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
                      Kliknij, aby przetestować na żywo
                    </span>
                  </div>
                </div>
              </section>

              {/* SECTION: Od wyniku do działania (03) */}
              <section className="bg-white border border-border-soft rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-4 space-y-4">
                  <SectionLabel number="03">Od wyniku do działania</SectionLabel>
                  <h2 className="font-display type-h2 text-text-dark uppercase">
                    Dane, które zamieniają się w decyzje.
                  </h2>
                  <p className="type-body text-muted-purple">
                    HRly nie kończy pracy na wygenerowanym raporcie. Największa wartość pojawia się wtedy, gdy wyniki ankiety automatycznie przekładają się na konkretną rozmowę, strukturę motywacyjną i bezpośrednie kroki menedżera.
                  </p>
                </div>

                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 font-normal items-stretch">
                  <div className="h-full p-5 rounded-2xl border border-border-soft bg-neutral-bg/40 space-y-3 hover:translate-y-[-2px] transition-transform">
                    <span className="type-h3 text-indigo-primary font-mono">01</span>
                    <h3 className="font-display type-h3 text-text-dark uppercase">Wynik</h3>
                    <p className="type-body-sm text-muted-purple">
                      Raport od razu i precyzyjnie wskazuje obszary z najniższą oceną kapitału ludzkiego. Od razu widać, gdzie w zespole narasta napięcie.
                    </p>
                  </div>

                  <div className="h-full p-5 rounded-2xl border border-border-soft bg-neutral-bg/40 space-y-3 hover:translate-y-[-2px] transition-transform">
                    <span className="type-h3 text-indigo-primary font-mono">02</span>
                    <h3 className="font-display type-h3 text-text-dark uppercase">Priorytet</h3>
                    <p className="type-body-sm text-muted-purple">
                      Intuicyjny algorytm pomaga ustalić hierarchię działań. Dokładnie wiesz, które negatywne czynniki wymagają reakcji w pierwszej kolejności.
                    </p>
                  </div>

                  <div className="h-full p-5 rounded-2xl border border-border-soft bg-neutral-bg/40 space-y-3 hover:translate-y-[-2px] transition-transform">
                    <span className="type-h3 text-indigo-primary font-mono">03</span>
                    <h3 className="font-display type-h3 text-text-dark uppercase">Narzędzie</h3>
                    <p className="type-body-sm text-muted-purple">
                      Liderzy otrzymują kompletny toolkit wspierający ich w rozmowach z podwładnymi i tworzeniu jasnej odpowiedzi zwrotnej zespołowi.
                    </p>
                  </div>
                </div>
              </section>

              {/* SECTION: Wyzwania, które rozwiązujemy (04) */}
              <section className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Heading */}
                  <div className="lg:col-span-5 space-y-4">
                    <SectionLabel number="04">Wyzwania, które rozwiązujemy</SectionLabel>
                    <h2 className="font-display type-h2 text-text-dark uppercase">
                      Tradycyjne ankiety HR generują wykresy, a nie rozwiązania.
                    </h2>
                    <p className="type-body-lg text-muted-purple">
                      Większość firm bada pracowników raz w roku, otrzymując przestarzałe statystyki. HRly zamienia surowe dane w dynamiczne scenariusze działań dla liderów w czasie rzeczywistym.
                    </p>
                  </div>

                  {/* Right Column: 3 Vertical Problems Grid */}
                  <div className="lg:col-span-7 space-y-4">
                    
                    {/* Problem 1: Rotacja */}
                    <div className="bg-text-dark text-white p-6 rounded-2xl border border-white/5 shadow-md flex items-start gap-4 hover:translate-y-[-2px] transition-transform duration-200 section-dark">
                      <div className="p-2 bg-accent-apricot/20 text-accent-apricot rounded-lg shrink-0 mt-0.5">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-display type-h3 text-white uppercase">Cicha rezygnacja i kosztowna rotacja</h3>
                        <p className="type-body-sm text-on-dark-body">
                          Wypalenie i rotacja talentów kosztuje firmy średnio 240 000 zł rocznie. Zazwyczaj dowiadujesz się o problemie dopiero wtedy, gdy wypowiedzenie ląduje na biurku.
                        </p>
                      </div>
                    </div>

                    {/* Problem 2: Brak danych i czasu */}
                    <div className="bg-white border border-border-soft/80 p-6 rounded-2xl shadow-xs flex items-start gap-4 hover:border-border-indigo/50 hover:translate-y-[-2px] transition-transform duration-200">
                      <div className="p-2 bg-primary-light/60 text-indigo-primary rounded-lg shrink-0 mt-0.5">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-display type-h3 text-text-dark uppercase">Marnowanie czasu na tabelki</h3>
                        <p className="type-body-sm text-muted-purple">
                          Działy HR marnują tygodnie na przepisywanie arkuszy Excel. Zarząd oczekuje twardych decyzji biznesowych i wskaźników ROI, a Ty dysponujesz jedynie przeczuciem.
                        </p>
                      </div>
                    </div>

                    {/* Problem 3: Brak wdrożenia */}
                    <div className="bg-white border border-border-soft/80 p-6 rounded-2xl shadow-xs flex items-start gap-4 hover:border-border-indigo/50 hover:translate-y-[-2px] transition-transform duration-200">
                      <div className="p-2 bg-primary-light/60 text-indigo-primary rounded-lg shrink-0 mt-0.5">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-display type-h3 text-text-dark uppercase">Menedżerowie bez wsparcia</h3>
                        <p className="type-body-sm text-muted-purple">
                          Liderzy potrzebują konkretnych instrukcji, a nie kolejnej tabelki z wynikami zaangażowania. Brakuje narzędzi łączących ankiety z codziennymi rozmowami 1-on-1.
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              </section>

              {/* SECTION: Co otrzymujesz (05) */}
              <section className="bg-white border border-border-soft rounded-[32px] p-8 sm:p-12 relative overflow-hidden shadow-xs">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-primary/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5 space-y-5">
                    <SectionLabel number="05">Co otrzymujesz</SectionLabel>
                    <h2 className="font-display type-h2 text-text-dark uppercase">
                      Wzmocnij swoją pozycję. Mów językiem biznesu.
                    </h2>
                    <p className="type-body-lg text-muted-purple">
                      Zmień postrzeganie HR w firmie. Pokaż zarządowi twarde wskaźniki i poprowadź organizację do stabilnego wzrostu zaangażowania.
                    </p>

                    <div className="bg-neutral-bg border border-text-dark/5 shadow-[0_8px_30px_color-mix(in_oklab,var(--color-text-dark)_2%,transparent)] p-5 rounded-2xl space-y-2 hover:border-border-indigo/40 transition-colors">
                      <span className="type-label uppercase font-mono text-muted-indigo block">Kluczowy wyróżnik</span>
                      <p className="type-body font-semibold text-text-dark">
                        Język biznesu — przekładamy zaangażowanie na finanse, pokazując szacowany ubytek lub zysk dla budżetu firmy.
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: "Raporty w kilka minut", desc: "Natychmiastowe wyniki bez żmudnych analiz i ręcznego liczenia arkuszy Excel.", Icon: Zap },
                      { title: "Plan naprawczy", desc: "Nie tylko diagnozujemy problem, ale podajemy gotowy plan działań.", Icon: Compass },
                      { title: "Kontekst zespołów", desc: "Diagnoza nastrojów w konkretnych działach, bez uogólnień dla całej firmy.", Icon: Users2 },
                      { title: "Wsparcie liderów", desc: "Scenariusze rozmów 1-on-1 i checklisty dla każdego menedżera.", Icon: Award }
                    ].map((item, idx) => (
                      <div 
                        key={idx} 
                        className="h-full bg-neutral-bg rounded-2xl p-5 border border-text-dark/5 shadow-[0_8px_30px_color-mix(in_oklab,var(--color-text-dark)_2%,transparent)] flex flex-col justify-between gap-4 hover:shadow-[0_8px_30px_color-mix(in_oklab,var(--color-text-dark)_6%,transparent)] hover:border-border-indigo/50 hover:translate-y-[-2px] transition-all duration-300"
                      >
                        <div className="p-2 bg-primary-light/60 text-indigo-primary rounded-xl w-fit border border-border-indigo/30">
                          <item.Icon className="w-4 h-4 text-indigo-primary" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-display type-h3 text-text-dark uppercase">{item.title}</h3>
                          <p className="type-body-sm text-muted-purple">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* SECTION: Metodologia / 11 obszarów (06) - DARK MARQUEE LAYOUT */}
              <div className="bg-text-dark border border-indigo-primary/30 p-6 sm:p-10 lg:p-12 rounded-[32px] overflow-hidden relative bg-[radial-gradient(var(--color-indigo-primary)_1px,transparent_1px)] [background-size:24px_24px] section-dark">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  
                  {/* Left Column: Purpose-built copy + indicators + CTA */}
                  <div className="lg:col-span-5 space-y-6 sm:space-y-8">
                    <div className="space-y-3.5">
                      <SectionLabel number="06" tone="dark">Metodologia Badania Satysfakcji i eNPS</SectionLabel>
                      <h2 className="font-display type-h2 text-white uppercase">
                        Badanie <span className="text-accent-apricot">11 obszarów</span>, które budują silną organizację.
                      </h2>
                      <p className="type-body-lg text-on-dark-body max-w-xl pt-2">
                        Nasz system analityczny pokrywa pełny przekrój doświadczenia zawodowego pracowników. Zamiast chaotycznych, pojedynczych ankiet, HRly bada 58 precyzyjnie dobranych czynników. Każde badanie automatycznie zasila centralny dashboard, pozwalając liderom natychmiast wychwycić rodzące się problemy.
                      </p>
                    </div>

                    {/* Grid of 4 key attributes inspired by the screenshot's subtext layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 border-t border-indigo-primary/40 pt-6">
                      <div>
                        <h3 className="font-display type-h3 text-neutral-bg uppercase sm:min-h-[2.6em]">
                          Naukowa struktura
                        </h3>
                        <p className="type-body-sm text-on-dark-muted mt-1">
                          Metodologia oparta o standardy psychologii pracy, eNPS oraz kluczowe mierniki zaangażowania Gallupa.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-display type-h3 text-neutral-bg uppercase sm:min-h-[2.6em]">
                          Mierzalny wpływ
                        </h3>
                        <p className="type-body-sm text-on-dark-muted mt-1">
                          Każdy zbadany czynnik jest powiązany z symulowanym kosztem rotacji oraz wskaźnikami produktywności.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-display type-h3 text-neutral-bg uppercase sm:min-h-[2.6em]">
                          Action Plan
                        </h3>
                        <p className="type-body-sm text-on-dark-muted mt-1">
                          Menedżerowie nie otrzymują wyłącznie suchych liczb – system generuje natychmiastowe wskazówki operacyjne.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-display type-h3 text-neutral-bg uppercase sm:min-h-[2.6em]">
                          Szybka konfiguracja
                        </h3>
                        <p className="type-body-sm text-on-dark-muted mt-1">
                          Gotowe szablony badań pulse-check, kwartalnych i rocznych uruchomisz w mniej niż minutę.
                        </p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-2">
                      <Button variant="secondary" size="md" tone="dark" icon={<ArrowRight />} onClick={() => setActiveTab('pricing')}>
                        Zobacz naszą ofertę
                      </Button>
                    </div>
                  </div>

                  {/* Right Column: Auto-sliding column of cards (Continuous marquee) */}
                  <div className="lg:col-span-7 relative h-[520px] sm:h-[580px] overflow-hidden rounded-2xl marquee-viewport">

                    {/* FAZA 5.2: bez nakładek wygaszających — karty są przycinane twardo krawędzią
                        `overflow-hidden` (zaokrągloną), żeby żadne słowo nie było półprzezroczyste. */}

                    {/* Marquee Container with duplicate list to loop perfectly */}
                    <div className="absolute w-full px-2 sm:px-4 py-6 flex flex-col gap-4 animate-marquee-scroll-up hover:[animation-play-state:paused] marquee-track">
                      {[...RESEARCH_AREAS, ...RESEARCH_AREAS].map((area, idx) => {
                        const AreaIcon = getAreaIcon(area.num);
                        const isDup = idx >= RESEARCH_AREAS.length;
                        return (
                          <div 
                            key={idx}
                            aria-hidden={isDup || undefined}
                            className={`bg-navy-deep border border-indigo-primary/30 hover:border-white/30 p-4.5 rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 flex items-center gap-4 select-none relative group${isDup ? ' marquee-dup' : ''}`}
                          >
                            {/* Accent indicator bar on the left */}
                            <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-transparent group-hover:bg-primary-light rounded-r transition-all" />

                            {/* Icon container with soft colored background to mimic the screenshot's premium feel */}
                            <div className="p-3 bg-text-dark border border-indigo-primary/30 rounded-xl text-on-dark-muted shadow-xs group-hover:scale-105 transition-transform shrink-0">
                              <AreaIcon className="w-5 h-5" />
                            </div>

                            {/* Card text content */}
                            <div className="space-y-1 flex-1 min-w-0">
                              <h3 className="font-display type-h3 text-neutral-bg uppercase sm:truncate">
                                {area.title}
                              </h3>

                              {/* Styled arrow sub-impact line matching screenshot */}
                              <div className="flex items-start gap-1.5 type-body-sm text-on-dark-body">
                                <span className="text-on-dark-muted font-bold shrink-0">↳</span>
                                <span className="font-sans text-on-dark-body">
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

              {/* SECTION: Jak to działa (07) */}
              <section className="space-y-10 py-4" id="how-it-works">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                  <SectionLabel number="07">Jak to działa</SectionLabel>
                  <h2 className="font-display type-h2 text-text-dark uppercase">
                    Prosta ścieżka do dojrzałego HR
                  </h2>
                  <p className="type-body-lg text-muted-purple max-w-2xl mx-auto">
                    Wdróż badanie zaangażowania w 3 prostych krokach. Bez instalowania skomplikowanego kodu i bez konieczności zatrudniania analityków.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {[
                    { num: "01", title: "Wyślij ankietę", desc: "Wybierz gotowy kwestionariusz Pulse-Check zaprojektowany przez psychologów pracy i roześlij go w kilka sekund." },
                    { num: "02", title: "Odbierz analizę", desc: "System automatycznie przetwarza wyniki, grupuje je w 11 kluczowych obszarów i precyzyjnie wskazuje słabe punkty." },
                    { num: "03", title: "Działaj z planem", desc: "Zarząd i menedżerowie otrzymują automatyczne plany działań, checklisty i scenariusze gotowe do natychmiastowego wdrożenia." }
                  ].map((step, sIdx) => (
                    <div key={sIdx} className="h-full bg-white border border-text-dark/5 shadow-[0_8px_30px_color-mix(in_oklab,var(--color-text-dark)_2%,transparent)] p-6 rounded-2xl space-y-4 transition-all hover:shadow-[0_8px_30px_color-mix(in_oklab,var(--color-text-dark)_6%,transparent)] hover:border-border-indigo/50 hover:translate-y-[-2px] relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary-light/5 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-primary/5 transition-colors" />
                      
                      <div className="w-10 h-10 rounded-xl bg-indigo-primary text-white flex items-center justify-center type-body-sm font-bold font-mono shadow-sm">
                        {step.num}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-display type-h3 text-text-dark uppercase">{step.title}</h3>
                        <p className="type-body-sm text-muted-purple">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: CTA Końcowe (08) */}
              <section className="relative rounded-[32px] border border-white/10 bg-text-dark p-8 sm:p-12 text-center overflow-hidden shadow-2xl section-dark">
                {/* Glowing radial circles */}
                <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-primary/40 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-indigo-primary/40 rounded-full blur-3xl pointer-events-none" />
                
                <div className="max-w-2xl mx-auto space-y-6 relative z-10">
                  <SectionLabel number="08" tone="dark">Gotowi na zmianę?</SectionLabel>
                  
                  <h2 className="font-display type-h2 text-white uppercase">
                    Zbuduj zaangażowany zespół w 15 minut.
                  </h2>

                  <p className="type-body-lg text-on-dark-body max-w-lg mx-auto">
                    Rozpocznij darmowy test. Pierwsze badanie, diagnozę i plan działań dla menedżerów otrzymasz jeszcze dzisiaj.
                  </p>

                  <div className="flex flex-col items-center justify-center gap-4 pt-2">
                    <Button size="lg" tone="dark" onClick={() => { setActiveTab('pricing'); }}>
                      Zacznij bezpłatny test
                    </Button>
                    
                    {/* Security credentials in white/gray */}
                    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 type-label text-on-dark-muted font-mono">
                      <span className="flex items-center gap-1">
                        <span className="text-on-dark-muted">✓</span>
                        14 dni testu bez zobowiązań
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-on-dark-muted">✓</span>
                        Brak wymaganej karty płatniczej
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-on-dark-muted">✓</span>
                        Pełne bezpieczeństwo RODO
                      </span>
                    </div>
                  </div>
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

                    <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-[42px] text-[#14183D] tracking-tight leading-[1.1] uppercase">
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
                    </h1>

                    <p className="text-xs sm:text-sm text-[#55506E] leading-relaxed">
                      HRly dostarcza w pełni konfigurowalne narzędzia badawcze dostosowane do rytmu Twojej firmy. Od precyzyjnych badań kwartalnych o wysokiej frekwencji, przez elastyczne i szybkie pulse-checki, aż po dedykowane ankiety onboardingowe. Wszystko zaprojektowane tak, by gwarantować bezpieczeństwo i zachęcać do szczerego feedbacku.
                    </p>

                    {/* Trust indicators */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 pt-4 border-t border-[#EFEAE1] text-[11px] text-[#6A5E8C] font-mono w-full">
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
                        <span className="text-[9px] font-mono text-[#6A5E8C] font-bold uppercase">Gotowe Szablony</span>
                      </div>
                      <h2 className="font-sans font-black text-[11px] text-[#14183D] uppercase leading-tight">
                        Naukowa baza pytań
                      </h2>
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
                      <h2 className="font-sans font-black text-[11px] text-white uppercase leading-tight">
                        Action Plan
                      </h2>
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
                        <span className="text-[9px] font-mono text-[#6A5E8C] font-bold uppercase">Narzędzia Lidera</span>
                      </div>
                      <h2 className="font-sans font-black text-[11px] text-[#14183D] uppercase leading-tight">
                        Wsparcie Managerów
                      </h2>
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
                        <span className="text-[9px] font-mono text-[#6A5E8C] font-bold uppercase">Raporty</span>
                      </div>
                      <h2 className="font-sans font-black text-[11px] text-[#14183D] uppercase leading-tight">
                        Statystyki i trendy
                      </h2>
                      
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
                <h2 className="text-xs uppercase font-extrabold tracking-wider text-[#6A5E8C] font-mono border-b border-[#EFEAE1] pb-2">
                  Kluczowe funkcje, które zmieniają sposób delegacji pracy
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { num: "01", title: "Inteligentna analiza", desc: "Zintegrowane badanie 58 czynników w 11 obszarach — zaangażowanie, satysfakcja, preferowany styl zarządzania, komunikacja operacyjna, ścieżki rozwoju i wiele więcej." },
                    { num: "02", title: "Rekomendacje działań", desc: "Sztuczna inteligencja dostarcza konkretne, opracowane scenariusze działań, checklisty i narzędzia dla liderów dostosowane do najgłębszych symptomów." },
                    { num: "03", title: "Benchmarking rynkowy", desc: "Bezpieczne porównanie wyników między zróżnicowanymi działami wewnętrznymi oraz zewnętrznymi wskaźnikami rynkowymi dla Twojej branży." },
                    { num: "04", title: "Predykcja wypalenia", desc: "Analiza predykcyjna pozwala wykryć kluczowe ryzyka kadrowe znacznie wcześniej — rotację, wypalenie zawodowe czy narastające spięcia międzyoddziałowe." },
                    { num: "05", title: "Gotowe ankiety naukowe", desc: "Błyskawiczne uruchomienie standardowych badań: badanie miesięczne (17 pytań) • kwartalne (25 pytań) • roczne badanie głębokie (72 pytania)." }
                  ].map((feat, fidx) => (
                    <div key={fidx} className="bg-white border border-[#EFEAE1] p-6 rounded-2xl space-y-3 shadow-sm hover:border-[#C4BBDE] transition-colors relative">
                      <span className="text-sm font-bold text-[#C4672D] font-mono block">/ {feat.num}</span>
                      <h3 className="font-sans font-black text-sm text-[#14183D] uppercase tracking-tight">{feat.title}</h3>
                      <p className="text-xs text-[#55506E] leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Naukowa metodologia badawcza - 11 teorii */}
              <div className="space-y-4">
                <h2 className="text-xs uppercase font-extrabold tracking-wider text-[#6A5E8C] font-mono border-b border-[#EFEAE1] pb-2">
                  Fundamenty naukowe platformy
                </h2>
                <Suspense fallback={
                  <div className="h-48 flex flex-col items-center justify-center bg-white/50 rounded-2xl border border-[#EFEAE1]/60">
                    <div className="w-8 h-8 border-3 border-[#3B2F8C] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                }>
                  <HrlyMethodologyVisual />
                </Suspense>
              </div>

              {/* 11 areas overview block - GRID LAYOUT */}
              <section className="bg-[#F4F1EC]/40 border border-[#EFEAE1] p-6 sm:p-10 lg:p-12 rounded-[32px] relative overflow-hidden space-y-10">
                {/* Decors */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B2F8C]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F4A574]/5 rounded-full blur-3xl pointer-events-none" />

                {/* Header Info */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end border-b border-[#EFEAE1] pb-8 relative z-10">
                  <div className="lg:col-span-8 space-y-3">
                    <span className="inline-flex items-center gap-1.5 bg-[#E3DEEE]/85 text-[#3B2F8C] px-3.5 py-1.5 rounded-full border border-[#C4BBDE]/35 text-[10px] font-bold uppercase tracking-wider leading-none shadow-xs">
                      05 · Metodologia Badania Satysfakcji i eNPS
                    </span>
                    <h2 className="font-display font-black text-2xl sm:text-4xl text-[#14183D] tracking-tight uppercase leading-[1.05]">
                      Badanie <span className="text-[#3B2F8C]">11 obszarów</span>, które budują silną organizację.
                    </h2>
                  </div>
                  <div className="lg:col-span-4">
                    <p className="text-xs text-[#55506E] leading-relaxed">
                      Nasz system analityczny pokrywa pełny przekrój doświadczenia zawodowego pracowników. Zamiast chaotycznych ankiet, HRly bada 58 precyzyjnie dobranych czynników naukowych.
                    </p>
                  </div>
                </div>

                {/* 11 Areas Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                  {RESEARCH_AREAS.map((area, idx) => {
                    return (
                      <div 
                        key={idx}
                        className="bg-white border border-[#EFEAE1]/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-[#C4BBDE] transition-all flex flex-col justify-between"
                      >
                        {/* Top Info */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono font-bold tracking-widest text-[#6A5E8C] uppercase block">
                            Obszar {area.num}
                          </span>
                          <h3 className="font-display font-black text-base text-[#14183D] uppercase tracking-tight leading-tight">
                            {area.title}
                          </h3>
                          <p className="text-[11.5px] text-[#55506E] leading-relaxed min-h-[36px]">
                            {area.question}
                          </p>
                        </div>

                        {/* Bottom Impact Box (Beige box with Left Border) */}
                        <div className="mt-4 bg-[#FBFAF8] border-l-2 border-[#3B2F8C] p-3.5 rounded-r-xl rounded-l-xs text-[11px] text-[#14183D] leading-relaxed">
                          <span className="font-bold text-[#3B2F8C] block mb-0.5 uppercase tracking-wide text-[9px] font-mono">Wpływ:</span>
                          <span className="text-slate-700 font-sans font-medium">
                            {getScreenshotImpactText(area.num)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>



              {/* Quick Call to Action features banner */}
              <div className="bg-[#F4F1EC] p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-black text-[#14183D] uppercase">Poznaj wszystkie zaawansowane funkcje HRly</h3>
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

                    <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-[42px] text-[#14183D] tracking-tight leading-[1.1] uppercase">
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
                    </h1>

                    <p className="text-xs sm:text-sm text-[#55506E] leading-relaxed">
                      Zmień kulturę organizacyjną w oparciu o rzetelne badania zaangażowania i satysfakcji. Zacznij od optymalnego pakietu dla Twojego zespołu. Ceny są całkowicie transparentne i nie zawierają ukrytych opłat.
                    </p>

                    {/* Trust indicators */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 pt-4 border-t border-[#EFEAE1] text-[11px] text-[#6A5E8C] font-mono w-full">
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
                        <h2 className="font-sans font-black text-[#14183D] text-sm sm:text-base uppercase tracking-tight leading-tight">
                          Zapisz się dziś, zachowaj rabat na zawsze
                        </h2>
                        <p className="text-[11px] text-[#55506E] leading-relaxed">
                          Dołącz do grona zadowolonych klientów korzystających ze specjalnej, długoterminowej zniżki <strong>50%</strong>. Ceny promocyjne zostaną przypisane do Twojego konta na stałe.
                        </p>
                      </div>
                      
                      <div className="pt-3 border-t border-[#EFEAE1]/80 space-y-2 text-[10px] text-[#6A5E8C] font-mono">
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
              <Suspense fallback={
                <div className="h-96 flex flex-col items-center justify-center bg-white border border-[#EFEAE1] rounded-2xl">
                  <div className="w-10 h-10 border-4 border-[#3B2F8C] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-[#55506E] mt-3 animate-pulse">Ładowanie kalkulatora cennika...</p>
                </div>
              }>
                <HrlyPricingCalculator onNavigate={(tab) => setActiveTab(tab as PageRoute)} />
              </Suspense>

              {/* Contact Box copy from page 6 */}
              <section className="bg-white border border-[#EFEAE1] rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#F4A574]">Złożona struktura?</span>
                  <h2 className="font-display font-black text-lg text-[#14183D] uppercase tracking-tight leading-tight">
                    POTRZEBUJESZ DOPASOWANIA PLANU DLA DUŻEGO BIZNESU?
                  </h2>
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

                    <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-[40px] text-[#14183D] tracking-tight leading-[1.1] uppercase">
                      Stworzone przez <br />
                      <span className="text-[#3B2F8C]">praktyków HR</span> dla tych,<br />
                      którzy napędzają biznes
                    </h1>

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
                        onClick={() => {
                          setActiveTab('home');
                          setIsDashboardModalOpen(true);
                        }}
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
                        <h2 className="font-sans font-extrabold text-[#14183D] text-xs uppercase tracking-wider">
                          Ludzkie podejście, twarde liczby
                        </h2>
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
                        <h2 className="font-sans font-extrabold text-[#14183D] text-xs uppercase tracking-wider">
                          0% pustego raportowania
                        </h2>
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
                        <h2 className="font-sans font-extrabold text-[#14183D] text-xs uppercase tracking-wider">
                          Stałe doskonalenie
                        </h2>
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
                  <h2 className="font-sans font-bold text-[#14183D] text-sm uppercase tracking-tight">
                    Zagubieni w gąszczu statystyk bez przełożenia
                  </h2>
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
                  <h2 className="font-sans font-bold text-[#14183D] text-sm uppercase tracking-tight">
                    Technologia, która staje się niewidzialna
                  </h2>
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
                  <span className="text-[10px] text-[#6A5E8C] font-mono block uppercase">ZESPÓŁ</span>
                  <strong className="text-2xl font-black text-[#14183D]">Ekspercki team</strong>
                  <p className="text-[11px] text-[#55506E]">Zróżnicowane kompetencje strategiczne</p>
                </div>
                <div className="border-t sm:border-t-0 sm:border-x border-[#EFEAE1] pt-4 sm:pt-0 space-y-1">
                  <span className="text-[10px] text-[#6A5E8C] font-mono block uppercase">DOŚWIADCZENIE HR</span>
                  <strong className="text-2xl font-black text-[#14183D]">30+ Lat w branży</strong>
                  <p className="text-[11px] text-[#55506E]">Doświadczenia na stanowiskach kadr</p>
                </div>
                <div className="border-t sm:border-t-0 pt-4 sm:pt-0 space-y-1">
                  <span className="text-[10px] text-[#6A5E8C] font-mono block uppercase">GŁÓWNY CEL</span>
                  <strong className="text-2xl font-black text-[#14183D]">1 Misja: dane w działanie</strong>
                  <p className="text-[11px] text-[#55506E]">Eliminujemy puste statystyki bez pokrycia</p>
                </div>
              </div>

              {/* Team Profile cards page 7 */}
              <div className="space-y-6 pt-4">
                <h2 className="text-xs uppercase font-extrabold tracking-wider text-[#6A5E8C] font-mono border-b border-[#EFEAE1] pb-2 text-center">
                  Poznaj nasz zespół operacyjny
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Monika Ćwikła */}
                  <div className="bg-white border border-[#EFEAE1] p-5.5 rounded-2xl space-y-3 relative shadow-sm group hover:border-[#C4BBDE] transition-all">
                    <div className="w-12 h-12 rounded-full bg-[#E3DEEE] text-[#3B2F8C] flex items-center justify-center text-lg font-black shrink-0 shadow-inner">
                      MĆ
                    </div>
                    <div>
                      <h3 className="font-sans font-black text-sm text-[#14183D] leading-none">Monika Ćwikła</h3>
                      <p className="text-[10px] text-[#C4672D] font-bold mt-1 uppercase font-mono">HR i Strategia</p>
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
                      <h3 className="font-sans font-black text-sm text-[#14183D] leading-none">Anna Kępczyńska</h3>
                      <p className="text-[10px] text-[#C4672D] font-bold mt-1 uppercase font-mono">Psychologia i Management</p>
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
                      <h3 className="font-sans font-black text-sm text-[#14183D] leading-none">Jakub Zacios</h3>
                      <p className="text-[10px] text-[#C4672D] font-bold mt-1 uppercase font-mono">Technologia i Analiza</p>
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
                  <span className="text-[10px] font-mono font-bold text-[#C4672D] block uppercase">GŁÓWNA MISJA SPÓŁKI</span>
                  <h3 className="font-sans font-black text-sm tracking-tight text-white uppercase">Pomagamy firmom podejmować trafne decyzje</h3>
                  <p className="text-[#F4F1EC] leading-relaxed text-[11px]">
                    Pomagamy firmom i zarządom podejmować trafne, merytoryczne decyzje biznesowe oparte o rzeczywiste, zweryfikowane dane — tak, aby budowanie i rozwijanie wyjątkowych zespołów stało się dokładną nauką, a nie losową sztuką.
                  </p>
                </div>

                <div className="space-y-2 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
                  <span className="text-[10px] font-mono font-bold text-[#C4672D] block uppercase">SPÓJNA WIZJA ŚWIATA</span>
                  <h3 className="font-sans font-black text-sm tracking-tight text-white uppercase">Gdzie HR mówi uniwersalnym językiem biznesu</h3>
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
              <Suspense fallback={
                <div className="min-h-[50vh] flex flex-col items-center justify-center bg-[#FBFAF8]">
                  <div className="w-10 h-10 border-4 border-[#3B2F8C] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-[#55506E] mt-3 animate-pulse">Ładowanie artykułów blogowych...</p>
                </div>
              }>
                <HrlyBlogSection />
              </Suspense>
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
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C4672D]/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#3B2F8C]/4 rounded-full blur-2xl pointer-events-none" />
                
                <div className="space-y-6 relative z-10">
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] tracking-widest font-extrabold uppercase bg-[#E3DEEE] text-[#3B2F8C] px-3.5 py-1.5 rounded-full border border-[#C4BBDE]/40 shadow-2xs leading-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C4672D]" />
                      BEZPOŚREDNI KONTAKT
                    </span>
                    <h1 className="font-display font-black text-2xl sm:text-3xl text-[#14183D] uppercase tracking-tight">
                      Porozmawiajmy o <br className="hidden sm:inline" />
                      <span className="text-[#3B2F8C]">zaangażowaniu</span>
                    </h1>
                    <p className="text-xs text-[#55506E] leading-relaxed">
                      Chętnie odpowiemy na Twoje pytania, zaprezentujemy interaktywny pulpit menedżerski na żywo lub przygotujemy dedykowaną wycenę dla Twojej organizacji.
                    </p>
                  </div>

                  <div className="space-y-3">
                    
                    <a href="mailto:kontakt@hrly.pl" className="bg-white border border-[#EFEAE1]/60 rounded-xl p-4 flex gap-3.5 items-center hover:border-[#C4BBDE] hover:shadow-2xs transition-all group cursor-pointer block">
                      <div className="w-10 h-10 rounded-xl bg-[#3B2F8C]/10 text-[#3B2F8C] flex items-center justify-center shrink-0 group-hover:bg-[#3B2F8C] group-hover:text-white transition-colors duration-300">
                        <Mail className="w-5 h-5 text-[#C4672D]" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#6A5E8C] font-mono block uppercase font-bold tracking-wider">Napisz e-mail</span>
                        <strong className="text-xs text-[#14183D] group-hover:text-[#3B2F8C] transition-colors">kontakt@hrly.pl</strong>
                      </div>
                    </a>

                    <div className="bg-white border border-[#EFEAE1]/60 rounded-xl p-4 flex gap-3.5 items-center hover:border-[#C4BBDE] hover:shadow-2xs transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-[#3B2F8C]/10 text-[#3B2F8C] flex items-center justify-center shrink-0 group-hover:bg-[#3B2F8C] group-hover:text-white transition-colors duration-300">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#6A5E8C] font-mono block uppercase font-bold tracking-wider">Czas odpowiedzi</span>
                        <strong className="text-xs text-[#14183D]">Maksymalnie 24 godziny</strong>
                      </div>
                    </div>

                    <div className="bg-white border border-[#EFEAE1]/60 rounded-xl p-4 flex gap-3.5 items-center hover:border-[#C4BBDE] hover:shadow-2xs transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-[#3B2F8C]/10 text-[#3B2F8C] flex items-center justify-center shrink-0 group-hover:bg-[#3B2F8C] group-hover:text-white transition-colors duration-300">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#6A5E8C] font-mono block uppercase font-bold tracking-wider">Lokalizacja spółki</span>
                        <strong className="text-xs text-[#14183D]">Warszawa, Polska</strong>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-[#EFEAE1]/70 relative z-10">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/50 border border-[#EFEAE1]/55 rounded-lg p-3 text-center">
                      <span className="text-[14px] font-black text-[#3B2F8C] block">100%</span>
                      <span className="text-[9px] uppercase font-bold text-[#6A5E8C] font-mono">Poufność danych</span>
                    </div>
                    <div className="bg-white/50 border border-[#EFEAE1]/55 rounded-lg p-3 text-center">
                      <span className="text-[14px] font-black text-[#3B2F8C] block">RODO</span>
                      <span className="text-[9px] uppercase font-bold text-[#6A5E8C] font-mono">Zgodność prawna</span>
                    </div>
                  </div>

                  <p className="text-[9.5px] text-[#6A5E8C] leading-relaxed text-center font-medium">
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
                      <h2 className="font-sans font-black text-sm text-[#14183D] uppercase tracking-wider">
                        Formularz zapytania
                      </h2>
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
                            className="w-full text-xs bg-[#FBFAF8] border border-[#EFEAE1] rounded-xl pl-9 pr-3 py-2.5 text-[#14183D] focus:border-[#3B2F8C] focus:bg-white placeholder-[#A39AB4]/60 transition-all shadow-2xs"
                          />
                          <User className="w-4 h-4 text-[#6A5E8C] absolute left-3 top-3" />
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
                            className="w-full text-xs bg-[#FBFAF8] border border-[#EFEAE1] rounded-xl pl-9 pr-3 py-2.5 text-[#14183D] focus:border-[#3B2F8C] focus:bg-white placeholder-[#A39AB4]/60 transition-all shadow-2xs"
                          />
                          <Mail className="w-4 h-4 text-[#6A5E8C] absolute left-3 top-3" />
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
                            className="w-full text-xs bg-[#FBFAF8] border border-[#EFEAE1] rounded-xl pl-9 pr-3 py-2.5 text-[#14183D] focus:border-[#3B2F8C] focus:bg-white placeholder-[#A39AB4]/60 transition-all shadow-2xs"
                          />
                          <Building className="w-4 h-4 text-[#6A5E8C] absolute left-3 top-3" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-extrabold text-[#55506E] font-mono tracking-wider block">Temat rozmowy</label>
                        <div className="relative">
                          <select
                            value={contactSubject}
                            onChange={(e) => setContactSubject(e.target.value)}
                            className="w-full text-xs bg-[#FBFAF8] border border-[#EFEAE1] rounded-xl pl-9 pr-8 py-2.5 text-[#14183D] focus:border-[#3B2F8C] focus:bg-white cursor-pointer appearance-none shadow-2xs font-medium"
                          >
                            <option value="Zapytanie o platformę">Demo platformy analitycznej</option>
                            <option value="Pytanie o ofertę">Wycena wdrożenia i cennik</option>
                            <option value="Wsparcie techniczne">Współpraca partnerska / Doradztwo</option>
                            <option value="Inne">Inne zapytanie</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-[#55506E] absolute right-3 top-3 pointer-events-none" />
                          <HelpCircle className="w-4 h-4 text-[#6A5E8C] absolute left-3 top-3" />
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
                          className="w-full text-xs bg-[#FBFAF8] border border-[#EFEAE1] rounded-xl pl-9 pr-3 py-2.5 text-[#14183D] focus:border-[#3B2F8C] focus:bg-white resize-none placeholder-[#A39AB4]/60 transition-all shadow-2xs"
                        />
                        <MessageSquareText className="w-4 h-4 text-[#6A5E8C] absolute left-3 top-3" />
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
                      <h2 className="font-sans font-black text-xl text-[#14183D] tracking-tight">Wiadomość została wysłana!</h2>
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
      <footer className="w-full bg-text-dark border-t border-indigo-primary/35 mt-16 py-12 text-on-dark-body section-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand block */}
          <div className="md:col-span-7 space-y-3.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <svg 
                className="w-8 h-8" 
                viewBox="0 0 100 100" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="41" stroke="var(--color-border-indigo)" strokeWidth="1.8" fill="none" />
                <circle cx="50" cy="50" r="29" stroke="var(--color-border-indigo)" strokeWidth="2.4" fill="none" opacity="0.6" />
                <circle cx="50" cy="50" r="17" stroke="var(--color-accent-apricot)" strokeWidth="2" fill="none" opacity="0.8" />
                <circle cx="50" cy="50" r="5.5" fill="var(--color-accent-apricot)" />
              </svg>
              <span className="font-display font-extrabold text-white text-[18px] tracking-tighter lowercase">
                hrly
              </span>
            </div>
            
            <p className="type-body-sm max-w-sm text-on-dark-body">
              Inteligentna platforma analityki kapitału ludzkiego i pulsów zaangażowania pracowników firmy. Spójne raportowanie i toolkit menedżerski.
            </p>

            <p className="type-label text-on-dark-muted font-mono">
              HRLY Sp. z o.o. • Made with Human Care in Poland • All rights reserved.
            </p>
          </div>

          {/* Quick link matrices */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4 text-center md:text-left type-body-sm font-semibold text-on-dark-body">
            <div className="space-y-1">
              <span className="type-label text-on-dark-muted font-mono uppercase block mb-1">Opcje menu</span>
              <button onClick={() => setActiveTab('features')} className="block py-2 hover:text-white hover:underline underline-offset-4 w-full md:text-left transition-colors cursor-pointer">Funkcje</button>
              <button onClick={() => setActiveTab('pricing')} className="block py-2 hover:text-white hover:underline underline-offset-4 w-full md:text-left transition-colors cursor-pointer">Cennik</button>
              <button onClick={() => setActiveTab('about')} className="block py-2 hover:text-white hover:underline underline-offset-4 w-full md:text-left transition-colors cursor-pointer">O nas</button>
            </div>
            <div className="space-y-1">
              <span className="type-label text-on-dark-muted font-mono uppercase block mb-1">Baza wiedzy</span>
              <button onClick={() => setActiveTab('blog')} className="block py-2 hover:text-white hover:underline underline-offset-4 w-full md:text-left transition-colors cursor-pointer">Blog / Baza wiedzy</button>
              <button onClick={() => setActiveTab('contact')} className="block py-2 hover:text-white hover:underline underline-offset-4 w-full md:text-left transition-colors cursor-pointer">Kontakt z nami</button>
              <a href="#privacy" className="block py-2 hover:text-white hover:underline underline-offset-4 w-full md:text-left transition-colors cursor-not-allowed">Polityka prywatności</a>
              <a href="#rules" className="block py-2 hover:text-white hover:underline underline-offset-4 w-full md:text-left transition-colors cursor-not-allowed">Regulamin</a>
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
                  <h2 className="font-sans font-black text-base text-[#14183D] tracking-tight">
                    Umów spotkanie Demo HRly
                  </h2>
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
                  <h3 className="font-sans font-bold text-sm text-[#14183D]">Demo zarezerwowane na dzień {demoDate}!</h3>
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

      {/* ================= INTERACTIVE DASHBOARD MODAL DIALOG (Lightbox) ================= */}
      <AnimatePresence>
        {isDashboardModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-text-dark/80 backdrop-blur-md p-4 sm:p-6 md:p-10"
            onClick={() => setIsDashboardModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              className="relative bg-neutral-bg w-full max-w-6xl max-h-[90vh] rounded-[32px] shadow-2xl border border-border-indigo/35 overflow-y-auto p-4 sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsDashboardModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white hover:bg-primary-faint text-text-dark border border-border-soft/80 hover:border-border-indigo transition-colors shadow-xs z-50 cursor-pointer"
                aria-label="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Inside content */}
              <div className="pt-8">
                <Suspense fallback={
                  <div className="h-[70vh] flex flex-col items-center justify-center bg-neutral-bg">
                    <div className="w-10 h-10 border-4 border-indigo-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="type-body-sm text-muted-purple mt-3 animate-pulse">Generowanie podglądu interaktywnego panelu...</p>
                  </div>
                }>
                  <HrlyDashboardPreview />
                </Suspense>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
    </MotionConfig>
  );
}
