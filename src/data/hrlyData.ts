// HRly platform static datasets aligned with the official Polish copywriting copy

export interface HRFactor {
  name: string;
  score: number;
  status: 'Dobry' | 'Średni' | 'Wymaga uwagi';
  actionableRecommendation: string;
}

export interface HRArea {
  id: number;
  title: string;
  iconName: string;
  description: string;
  averageScore: number;
  overallStatus: 'Wysoki' | 'Średni' | 'Niski';
  summaryText: string;
  whatIsWrong: string;
  whatToDo: string;
  factors: HRFactor[];
  employeeImpact: string;
  businessImpact: string;
  managerTools: string[];
}

export const HR_AREAS: HRArea[] = [
  {
    id: 1,
    title: "Wynagrodzenie i benefity",
    iconName: "Coins",
    description: "Zadowolenie z płacy zasadniczej, premii, benefitów pozapłacowych oraz przejrzystości siatki płac.",
    averageScore: 3.4,
    overallStatus: "Średni",
    summaryText: "Pracownicy oceniają działy płac jako stabilne, jednak dostrzegają brak powiązania efektów pracy z premiowaniem.",
    whatIsWrong: "Odczuwalny brak przejrzystości w zasadach przyznawania podwyżek oraz niedopasowanie systemu świadczeń socjalnych do realnych potrzeb zespołu.",
    whatToDo: "Wprowadź jasne przedziały płacowe skorelowane ze stanowiskami i zorganizuj ankietę wyboru benefitów elastycznych (cafeteria).",
    employeeImpact: "Generuje spadek poczucia bezpieczeństwa, stłumione niezadowolenie i podatność na oferty konkurencyjne z rynku (zagrożenie cichą rotacją).",
    businessImpact: "Przekłada się na trudności w rekrutacji, spadek motywacji do przekraczania celów sprzedażowych oraz nagły odpływ unikalnego know-how.",
    managerTools: [
      "Przewodnik rozmów płacowych dla lidera (scenariusz 1-on-1)",
      "Kalkulator budżetu premiowego i wyrównawczego zespołu",
      "Szablon badania preferencji benefitów metodą koszyka (cafeteria)"
    ],
    factors: [
      { name: "Płaca zasadnicza", score: 3.5, status: "Średni", actionableRecommendation: "Porównaj stawki z rynkowym raportem płacowym." },
      { name: "System bonusów i premii", score: 2.8, status: "Wymaga uwagi", actionableRecommendation: "Powiąż cele OKR bezpośrednio z jasnymi bonusami kwartalnymi." },
      { name: "Benefity pozapłacowe", score: 3.9, status: "Dobry", actionableRecommendation: "Utrzymaj aktualne pakiety medyczne, są dobrze oceniane." }
    ]
  },
  {
    id: 2,
    title: "Wpływ i znaczenie pracy",
    iconName: "Target",
    description: "Poczucie misji, wkładu w sukces firmy oraz rozumienie strategicznych celów organizacji.",
    averageScore: 3.8,
    overallStatus: "Wysoki",
    summaryText: "Wysokie utożsamianie się z produktem rynkowym, niemniej brakuje bezpośrednich sygnałów o wkładzie jednostki.",
    whatIsWrong: "Komunikacja strategiczna od zarządu rzadko dociera do szczebla operacyjnego, co rozmywa poczucie osobistego celu.",
    whatToDo: "Podczas podsumowań miesięcznych prezentuj bezpośrednie case-study klientów i przypisuj sukcesy konkretnym zespołom projektowym.",
    employeeImpact: "Może prowadzić do utraty poczucia sensu codziennej rutyny, spadku motywacji wewnętrznej oraz szybkiego wypalenia emocjonalnego.",
    businessImpact: "Skutkuje spadkiem innowacyjności operacyjnej, mechanicznym wykonywaniem zadań i brakiem proaktywnego ulepszania procesów.",
    managerTools: [
      "Kwestionariusz dopasowania zadań do talentów (Job Crafting Toolkit)",
      "Agenda warsztatu 'Misja w praktyce' dla liderów i zespołów",
      "Szablon struktury feedbacku łączący cele biznesu z pracą jednostki"
    ],
    factors: [
      { name: "Rozumienie misji firmy", score: 4.1, status: "Dobry", actionableRecommendation: "Kontynuuj wprowadzanie kwartalnych spotkań All-Hands." },
      { name: "Osobisty wkład w sukces", score: 3.2, status: "Średni", actionableRecommendation: "Wprowadź regularne spotkania 1-on-1 pokazujące indywidualny wpływ." },
      { name: "Spójność wartości", score: 4.0, status: "Dobry", actionableRecommendation: "Organizuj cykliczne aktywności pro-społeczne (CSR)." }
    ]
  },
  {
    id: 3,
    title: "Uznanie i docenianie",
    iconName: "Award",
    description: "Częstotliwość i jakość pochwał, kultura feedbacku oraz docenianie wysiłków przez bezpośredniego lidera.",
    averageScore: 2.9,
    overallStatus: "Niski",
    summaryText: "Zrównoważone wyniki w ankietach wykazują głód doceniania słownego. Feedback pojawia się głównie przy problemach.",
    whatIsWrong: "Menedżerowie rzadko chwalą na bieżąco, skupiając się wyłącznie na gaszeniu pożarów i wyłapywaniu uchybień.",
    whatToDo: "Wdrożyć kulturę pochwał rówieśniczych (Peer-to-peer recognition) oraz przeszkolić liderów z modelu konstruktywnej pochwały.",
    employeeImpact: "Prowadzi do poczucia bycia 'niewidzialnym', narastającej frustracji i gwałtownego spadku zaangażowania po zrealizowaniu trudnego projektu.",
    businessImpact: "Skutkuje obniżoną lojalnością wobec marki, zimną kulturą organizacyjną oraz spadkiem chęci do wzajemnej pomocy w zespołach.",
    managerTools: [
      "Standard Pochwały w 4 Krokach (oparty o sprawdzony model SBI)",
      "Instrukcja wdrożenia i moderowania kanału #kudos na komunikatorze",
      "Tygodniowy arkusz monitorowania doceniania (tracker dla lidera)"
    ],
    factors: [
      { name: "Pochwała od przełożonego", score: 2.5, status: "Wymaga uwagi", actionableRecommendation: "Ustal jako standard min. jedną konstruktywną pochwałę w tygodniu per pracownik." },
      { name: "Kultura doceniania w zespole", score: 3.1, status: "Średni", actionableRecommendation: "Wprowadź na Slacku/Teamsach kanał #kudos do publicznego podziękowania." },
      { name: "Przejrzystość kryteriów wyróżnień", score: 3.1, status: "Średni", actionableRecommendation: "Spisz jasny regulamin nagród kwartalnych i upublicznij go." }
    ]
  },
  {
    id: 4,
    title: "Technologia i narzędzia",
    iconName: "Laptop",
    description: "Jakość systemów IT, ergonomia stanowisk pracy, oprogramowanie i automatyzacja żmudnych zadań.",
    averageScore: 4.1,
    overallStatus: "Wysoki",
    summaryText: "Technologiczny standard jest zadowalający. Narzędzia biurowe i chmurowe ułatwiają codzienność organizacyjną.",
    whatIsWrong: "Niektóre procesy administracyjne, jak rozliczanie delegacji czy wnioski urlopowe, wciąż wymagają papierowej biurokracji.",
    whatToDo: "Zdigitalizuj do końca obieg dokumentów wewnętrznych i zaimplementuj system samoobsługi pracowniczej (Employee Self-Service).",
    employeeImpact: "Wywołuje powtarzającą się codzienną frustrację z powodu powolnych systemów i poczucie straty czasu na proste, manualne zadania.",
    businessImpact: "Ogranicza sprawność operacyjną, tworzy niepotrzebne wąskie gardła informacyjne i zwiększa liczbę błędów w raportach.",
    managerTools: [
      "Lista kontrolna cyfryzacji procesów (szybki audit micro-narzędzi)",
      "Szablon i uzasadnienie wniosku do IT o modernizację stanowisk",
      "Przewodnik asynchronicznego wdrażania nowo pozyskanych narzędzi"
    ],
    factors: [
      { name: "Sprzęt i ergonomia", score: 4.3, status: "Dobry", actionableRecommendation: "Utrzymuj cykl wymiany sprzętu co 3 lata." },
      { name: "Pakiet oprogramowania", score: 4.2, status: "Dobry", actionableRecommendation: "Upewnij się, że zespół przechodzi szkolenia z nowo wdrażanych narzędzi." },
      { name: "Automatyzacja procesów", score: 3.8, status: "Średni", actionableRecommendation: "Zastąp resztki arkuszy Excel jednym prostym narzędziem chmurowym." }
    ]
  },
  {
    id: 5,
    title: "Środowisko i kultura",
    iconName: "Heart",
    description: "Bezpieczeństwo psychologiczne, relacje międzypracownicze, poziom zaufania i przeciwdziałanie toksyczności.",
    averageScore: 3.7,
    overallStatus: "Średni",
    summaryText: "Zaufanie wewnątrz mniejszych zespołów jest silne, ale komunikacja między-działami generuje silosowość i tarcie.",
    whatIsWrong: "Zauważalny dystans między działem sprzedaży a działem wdrożeń, wywołany brakiem wspólnego zrozumienia procesów klientów.",
    whatToDo: "Urządź rotacyjne spotkania shadowingowe, by pracownicy innych działów zobaczyli codzienność operacyjną swoich kolegów.",
    employeeImpact: "Poczucie niepewności, obawy przed przyznaniem się do błędu, powstawania plotek oraz wycofywania się ze współodpowiedzialności.",
    businessImpact: "Tworzy silosy kompetencyjne, blokuje wymianę dobrych praktyk między działami i spowalnia realizację dużych projektów.",
    managerTools: [
      "Scenariusz retrospektywy bez obwiniania (Blameless Post-mortem)",
      "Zasady budowania bezpieczeństwa psychologicznego dla zespołu (karta)",
      "Instrukcja organizacji sesji shadowingowych 'Zrozum drugą stronę'"
    ],
    factors: [
      { name: "Bezpieczeństwo psychologiczne", score: 3.9, status: "Dobry", actionableRecommendation: "Utrzymuj anonimowe kanały zadawania trudnych pytań zarządowi." },
      { name: "Zaufanie do liderów", score: 3.6, status: "Średni", actionableRecommendation: "Organizuj kwartalne sesje Q&A z zarządem na żywo." },
      { name: "Współpraca silosowa", score: 3.6, status: "Średni", actionableRecommendation: "Zorganizuj wspólny warsztat projektowy dla skłóconych działów." }
    ]
  },
  {
    id: 6,
    title: "Work-life balance",
    iconName: "ShieldCheck",
    description: "Nadgodziny, elastyczność i możliwość pracy zdalnej, rozłączenie od spraw firmowych po godzinach.",
    averageScore: 3.1,
    overallStatus: "Średni",
    summaryText: "Możliwość pracy hybrydowej jest doceniana, lecz granice czasu wolnego zacierają się przez późne e-maile.",
    whatIsWrong: "Napisane wieczorem wiadomości wywołują u odbiorców poczucie przymusu natychmiastowej odpowiedzi i stres.",
    whatToDo: "Wdrożyć zasadę 'opóźnionej wysyłki maili/Slack' w godzinach 18:00 - 8:00 oraz jasny manifest poszanowania czasu wolnego.",
    employeeImpact: "Wpływa na przewlekłe zmęczenie, bezsenność, brak czasu na regenerację psychiczną i narastające napięcie w sferze osobistej.",
    businessImpact: "Drastycznie podnosi absencję chorobową (L4), zwiększa ryzyko błędów w krytycznych zadaniach i obniża jakość decyzji.",
    managerTools: [
      "Karta i manifest 'Prawo do odłączenia się' (zasady komunikacji po 17:00)",
      "Metodologia optymalizacji i skracania spotkań zespołu z 60 do 45 min",
      "Przewodnik asertywności w planowaniu obciążeń zadaniowych"
    ],
    factors: [
      { name: "Elastyczność godzin", score: 4.0, status: "Dobry", actionableRecommendation: "Pozostaw szerokie okno godzin startu pracy (7:00-10:00)." },
      { name: "Obciążenie nadgodzinami", score: 2.8, status: "Wymaga uwagi", actionableRecommendation: "Przeanalizuj wąskie gardła projektowe generujące spiętrzenia zadań." },
      { name: "Cyfrowy detoks", score: 2.5, status: "Wymaga uwagi", actionableRecommendation: "Wprowadź techniczną blokadę powiadomień po godzinie 19 w dni powszednie." }
    ]
  },
  {
    id: 7,
    title: "Rozwój i kariera",
    iconName: "TrendingUp",
    description: "Budżety szkoleniowe, jasne ścieżki awansów i rozwój kompetencji dostosowany do talentów pracownika.",
    averageScore: 3.0,
    overallStatus: "Średni",
    summaryText: "Zróżnicowane oceny wskazują na potrzebę jasnego mapowania ról i ujednolicenia dostępu do wiedzy zewnętrznej.",
    whatIsWrong: "Pracownicy postrzegają awanse jako proces uznaniowy i nieprzewidywalny, z brakiem merytorycznej ścieżki rozwoju.",
    whatToDo: "Opracuj uniwersalną matrycę kompetencji (Matrix model I, T i M-shaped) dla kluczowych stanowisk w spółce.",
    employeeImpact: "Poczucie stania w miejscu, rezygnacja z podnoszenia kwalifikacji oraz ukradkowe poszukiwanie ofert dających lepsze perspektywy.",
    businessImpact: "Starzenie się kompetencji wewnątrz organizacji, utrata najbardziej obiecujących talentów i wysoki koszt rekrutacji zewnętrznych.",
    managerTools: [
      "Szablon Indywidualnego Planu Rozwoju (IDP - Individual Development Plan)",
      "Przewodnik po rozmowach rozwojowych w oparciu o uniwersalny model GROW",
      "Matryca kompetencji zespołu (narzędzie do planowania rozwoju skilli)"
    ],
    factors: [
      { name: "Planowanie awansów", score: 2.7, status: "Wymaga uwagi", actionableRecommendation: "Wprowadź jasne roczne okienka oceny i promocji stanowiskowej." },
      { name: "Budżet na szkolenia", score: 3.3, status: "Średni", actionableRecommendation: "Zrezygnuj z centralnej akceptacji mikro-szkoleń do kwoty 1500 zł na rzecz autonomii liderów." },
      { name: "Rozwój kompetencji", score: 3.0, status: "Średni", actionableRecommendation: "Stwórz wewnętrzną bibliotekę materiałów wideo i subskrypcje platform edukacyjnych." }
    ]
  },
  {
    id: 8,
    title: "Perspektywy i stabilność",
    iconName: "Zap",
    description: "Poczucie pewności zatrudnienia, kondycja finansowa firmy w oczach zespołu i perspektywy rynkowe.",
    averageScore: 3.9,
    overallStatus: "Wysoki",
    summaryText: "Silna pozycja rynkowa i stabilne zatrudnienie sprawiają, że rotacja deklaratywna na tym tle jest znikoma.",
    whatIsWrong: "Niewystarczająca transparentność w informowaniu o dużych kontraktach i kondycji spółki w okresach spowolnienia.",
    whatToDo: "Publikuj comiesięczny newsletter operacyjny z informacjami o przychodach, zyskach oraz planowanych kamieniach milowych.",
    employeeImpact: "Niskie zaangażowanie w ambitne, długoterminowe projekty, asekuranctwo i obawa przed podejmowaniem skalkulowanego ryzyka.",
    businessImpact: "Spadek lojalności pracowników w trudniejszych rynkowo okresach, niepotrzebny szum informacyjny i plotki obniżające morale.",
    managerTools: [
      "Zestaw uniwersalnych pytań i odpowiedzi (Q&A) o stabilności spółki",
      "Szablon uproszczonej prezentacji wyników finansowych dla zespołu",
      "Procedura transparentnej komunikacji zmian organizacyjnych"
    ],
    factors: [
      { name: "Pewność zatrudnienia", score: 4.2, status: "Dobry", actionableRecommendation: "Dbaj o zawieranie umów długoterminowych z kluczowymi ludźmi." },
      { name: "Wizerunek kondycji firmy", score: 3.8, status: "Średni", actionableRecommendation: "Wprowadź kwartalne sprawozdania finansowe wyjaśniane prostym językiem." },
      { name: "Perspektywy rozwoju branży", score: 3.7, status: "Średni", actionableRecommendation: "Inwestuj w budowanie innowacji (R&D) i komunikuj to zespołom." }
    ]
  },
  {
    id: 9,
    title: "Obciążenie i stres",
    iconName: "BrainCircuit",
    description: "Stres codzienny, stopień presji terminowej oraz wsparcie psychologiczne ze strony organizacji.",
    averageScore: 2.8,
    overallStatus: "Niski",
    summaryText: "Niepokojąco wysokie wskaźniki stresu korelują bezpośrednio z nierealnymi terminami dostarczeń (deadlines).",
    whatIsWrong: "Praca pod ciągłym wpływem presji czasu, co skutkuje poczuciem wypalenia zawodowego oraz spadkiem koncentracji.",
    whatToDo: "Wdróż warsztaty zarządzania czasem i asertywności, zrewiduj proces szacowania czasu zadań (planning poker z buforem bezpieczeństwa).",
    employeeImpact: "Wyczerpanie fizyczne i emocjonalne, stany lękowe, spadek zaufania do własnych umiejętności oraz szybkie, całkowite wypalenie.",
    businessImpact: "Wzrost rotacji (nawet o 25%), drastyczny spadek produktywności, błędy w komunikacji z klientem oraz psucie atmosfery w zespole.",
    managerTools: [
      "Zasada planowania projektów z obowiązkowym buforem bezpieczeństwa (+20%)",
      "Kwestionariusz wczesnej identyfikacji objawów wypalenia (checklist lidera)",
      "Poradnik pierwszej pomocy psychologicznej w nagłych kryzysach"
    ],
    factors: [
      { name: "Presja czasu i deadline", score: 2.1, status: "Wymaga uwagi", actionableRecommendation: "Wprowadź obowiązkowy bufor +20% czasu do każdego estymowanego projektu." },
      { name: "Profilaktyka wypalenia", score: 3.1, status: "Średni", actionableRecommendation: "Zaplanuj program wsparcia psychologicznego i konsultacje darmowe 1-on-1 z ekspertami." },
      { name: "Organizacja pracy codziennej", score: 3.2, status: "Średni", actionableRecommendation: "Likwiduj statusowe spotkania 'status check' na rzecz krótkich asynchronicznych notatek." }
    ]
  },
  {
    id: 10,
    title: "Komunikacja",
    iconName: "MessageSquareText",
    description: "Przepływ informacji góra-dół, otwartość na krytykę ze strony liderów oraz skuteczność narzędzi komunikacji.",
    averageScore: 3.6,
    overallStatus: "Średni",
    summaryText: "Komunikacja operacyjna przebiega poprawnie, ale informacja zwrotna o decyzjach zarządczych jest niepełna.",
    whatIsWrong: "Częste zmiany kierunku projektów ogłaszane bez dogłębnego wyjaśnienia przyczyn biznesowych, co budzi opór.",
    whatToDo: "Każdą dużą zmianę strategiczną ogłaszaj wraz dżentelmeńskim dokumentem 'FAQ' wyjaśniającym motywacje rynkowe i finansowe.",
    employeeImpact: "Chaos poznawczy, domysły, poczucie bycia pomijanym w ważnych decyzjach i spadek zaufania do kierownictwa.",
    businessImpact: "Zdublowana praca w różnych komórkach, opóźnienia w implementacji procedur i nieefektywne zarządzanie zmianą.",
    managerTools: [
      "Szablon notatki asynchronicznej zastępującej codzienne spotkanie statusowe",
      "Przewodnik kaskadowania informacji strategicznych dla średniej kadry",
      "Zasady i agenda cyklicznego spotkania All-Hands (otwarte pytania)"
    ],
    factors: [
      { name: "Przepływ info z góry", score: 3.3, status: "Średni", actionableRecommendation: "Nagrywaj krótkie 5-minutowe podsumowania wideo po każdym posiedzeniu zarządu." },
      { name: "Otwartość na feedback", score: 3.9, status: "Dobry", actionableRecommendation: "Kontynuuj ankiety pulsu (Pulse Surveys) dające stały dopływ opinii." },
      { name: "Narzędzia komunikacji", score: 3.6, status: "Średni", actionableRecommendation: "Uporządkuj przeładowane kanały Slack/Teams, definiując ich konkretne cele." }
    ]
  },
  {
    id: 11,
    title: "Autonomia i decyzje",
    iconName: "Fingerprint",
    description: "Możliwość podejmowania samodzielnych decyzji, zaufanie menedżera, brak mikrozarządzania.",
    averageScore: 3.5,
    overallStatus: "Średni",
    summaryText: "Poziom decyzyjności jest poprawny w technicznych kwestiach, ale ograniczony przy procesach organizacyjnych.",
    whatIsWrong: "Pracownicy muszą uzyskać akceptację przełożonego nawet na drobne wydatki lub kosmetyczne modyfikacje procedur prac.",
    whatToDo: "Wprowadź zasadę odpowiedzialności budżetowej dla zespołów projektowych i pozwól im swobodnie zarządzać swoimi mikro-zadaniami.",
    employeeImpact: "Poczucie ubezwłasnowolnienia, spadek zaangażowania oraz zrzucanie odpowiedzialności za wynik ('skoro szef decyduje, to jego sprawa').",
    businessImpact: "Całkowity paraliż operacyjny w przypadku nieobecności menedżera oraz przeciążenie kadry zarządzającej sprawami mikro.",
    managerTools: [
      "Karta decyzyjności i poziomów uprawnień zespołu (Delegation Poker)",
      "Uproszczona matryca odpowiedzialności RACI dostosowana do małych zespołów",
      "Zasada swobody budżetowej (mikro-fundusz decyzyjny bez akceptacji szefa)"
    ],
    factors: [
      { name: "Samodzielność w zadaniach", score: 3.8, status: "Średni", actionableRecommendation: "Deleguj całe obszary odpowiedzialności zamiast pojedynczych mikrozadań." },
      { name: "Wskaźnik mikrozarządzania", score: 3.3, status: "Średni", actionableRecommendation: "Przeszkol menedżerów średniego szczebla z technik zarządzania przez cele (MBO)." },
      { name: "Zaufanie do wiedzy eksperta", score: 3.4, status: "Średni", actionableRecommendation: "Umożliwiaj programistom i analitykom samodzielny wybór rozwiązań technicznych." }
    ]
  }
];

export interface BlogArticle {
  id: number;
  title: string;
  category: string;
  summary: string;
  content: string;
  readTime: string;
  publishDate: string;
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 1,
    title: "Globalne zaangażowanie pracowników spadło do 21%",
    category: "Motywacja i zaangażowanie",
    summary: "Przyczyny drastycznego spadku satysfakcji z pracy i uniwersalne wskazówki dla działów HR, jak zwiększyć zaangażowanie w nowoczesnej firmie.",
    content: "W najnowszym raporcie rynkowym poziom globalnego zaangażowania odnotował bezprecedensowy spadek do zaledwie 21%. Oznacza to, że niemal czterech na pięciu pracowników wykonuje swoje rutynowe obowiązki biernie. Podstawowym powodem jest brak poczucia wpływu na cele organizacji oraz wypalenie cyfrowe wynikające z nadmiaru spotkań online. Jako rozwiązanie, działy HR powinny ograniczyć czas trwania codziennych wdrożeń (stand-up) oraz spersonalizować ścieżki awansów bazując na teoriach autonomii i motywacji wewnętrznej.",
    readTime: "5 min czytania",
    publishDate: "2026-06-15"
  },
  {
    id: 2,
    title: "eNPS: Dlaczego jeden wynik to za mało?",
    category: "Analityka HR",
    summary: "Dogłębna analiza motywacji i budowanie prawdziwego zaangażowania bez opierania się na pojedynczym suchym wskaźniku liczbowym.",
    content: "Wskaźnik Net Promoter Score dla pracowników (eNPS) stał się niezwykle popularny za sprawą swojej prostoty. Zadając jedno pytanie: 'Jak bardzo prawdopodobne jest, że polecisz pracę u nas znajomym?', dyrektorzy ds. personalnych mają poczucie, że trzymają rękę na pulsie. To jednak ułuda. Pojedyncza cyfra nie tłumaczy kontekstu. Aby prawdziwie zrozumieć stan zdrowia organizacji, musimy rozbić ankiety na 58 kluczowych czynników i badać obszary takie jak Work-life balance, obciążenie stresem czy zaufanie do kompetencji przełożonych góra-dół.",
    readTime: "4 min czytania",
    publishDate: "2026-06-10"
  },
  {
    id: 3,
    title: "Efekt złego menedżera: Jak jeden człowiek niszczy zaangażowanie",
    category: "rozwój liderów",
    summary: "Katastrofalne konsekwencje toksycznego przywództwa dla organizacji i sprawdzone strategie interwencyjne oraz naprawcze.",
    content: "Znane przysłowie mówi, że ludzie przychodzą do firmy, a odchodzą od menedżera. Badania HRly w pełni to potwierdzają. Słaby, skrajnie kontrolujący lider potrafi w ciągu trzech miesięcy obniżyć produktywność zaangażowanego działu aż o 40%. Brak transparentności, unikanie feedbacku i mikrozarządzanie generują wysokie wskaźniki rotacji personelu. Rozwiązaniem jest regularne zbieranie ocen 360 stopni oraz dostarczanie menedżerom gotowych narzędzi (toolkitów i scenariuszy rozmów) wspierających ich w budowaniu relacji opartej na zaufaniu.",
    readTime: "6 min czytania",
    publishDate: "2026-06-02"
  },
  {
    id: 4,
    title: "Jak zbudować strategię talent management na lata, a nie na kwartał",
    category: "Zarządzanie talentami",
    summary: "Poznaj kluczowe, trwałe filary skutecznej strategii utrzymania i rozwoju talentów w dobie ciągłych transformacji technologicznych.",
    content: "Większość planów rozwoju talentów rozpada się już po pierwszym kwartale ze względu na nagłe zmiany potrzeb biznesowych. Stabilna strategia talent management must opierać się na elastyczności. Zamiast sztywnych ról, mapujmy umiejętności płynne (skills matching). Poprzez określenie modeli kompetencyjnych I-shaped, T-shaped oraz M-shaped, organizacja zyskuje zwinność i jest odporna na nagłą restrukturyzację czy rezygnację pracowników o wysokich kwalifikacjach.",
    readTime: "7 min czytania",
    publishDate: "2024-05-28"
  },
  {
    id: 5,
    title: "Employee experience: co naprawdę liczy się dla pracowników w 2026?",
    category: "employee experience",
    summary: "Najważniejsze trendy kształtujące komfort pracy, utrzymanie kompetencji i czynniki wyboru pracodawcy w obecnym roku.",
    content: "Rok 2026 przyniósł ostateczne ukształtowanie się oczekiwań pracowników. Tradycyjne owocowe czwartki czy podstawowy abonament sportowy odeszły do lamusa. Dziś sercem employee experience jest elastyczność oraz higiena psychiczna. Pracownicy poszukują organizacji, które szanują ich prywatność (brak maili po godzinach) oraz oferują realne budżety na podnoszenie kwalifikacji zawodowych bez nadmiernej biurokracji i skomplikowanych wniosków akceptacyjnych.",
    readTime: "5 min czytania",
    publishDate: "2026-05-18"
  },
  {
    id: 6,
    title: "Przyszłość pracy: Scenariusze dla HR do 2030 roku",
    category: "przyszłość pracy",
    summary: "Przygotowanie firmy na nadchodzące wyzwania technologiczne, demograficzne i kulturowe w perspektywie najbliższych lat.",
    content: "Do 2030 roku rynkiem pracy zatrzęsie kolejna zmiana demograficzna połączona z postępującą automatyzacją procesów administracyjnych. Zadania powtarzalne całkowicie przejmie sztuczna inteligencja, co przesunie rolę liderów HR w stronę budowania rezerwatu dla kompetencji społeczno-emocjonalnych. Prawdziwym wyzwaniem stanie się zachowanie integracji społecznej w zespołach rozproszonych geograficznie i pracujących w pełni asynchronicznie.",
    readTime: "6 min czytania",
    publishDate: "2026-05-02"
  },
  {
    id: 7,
    title: "Rozwój kompetencji zawodowych — przewodnik po modelach I, T i M-shaped",
    category: "rozwój kariery",
    summary: "Zrozum różnice w profilach pracowników i naucz się precyzyjnie wspierać ich ścieżki rozwoju kompetencji.",
    content: "Profil I-shaped oznacza wąską i niezwykle głęboką specjalizację w jednej dziedzinie. Profil T-shaped łączy głębokie kompetencje z szerokim zrozumieniem tematów pobocznych, co ułatwia pracę w interdyscyplinarnych zespołach. Najbardziej pożądanym profilem staje się obecnie M-shaped, czyli posiadanie kilku unikalnych specjalizacji powiązanych ze sobą silnymi umiejętnościami miękkimi. W artykule pokazujemy, jak planować szkolenia, by wspierać przejścia pracowników między tymi profilami.",
    readTime: "5 min czytania",
    publishDate: "2026-04-14"
  },
  {
    id: 8,
    title: "Jak można mierzyć efektywność szkoleń?",
    category: "rozwój i szkolenia",
    summary: "Dogłębne porównanie tradycyjnego Modelu Kirkpatricka oraz nowoczesnego frameworku LTEM jako narzędzi analitycznych.",
    content: "Badanie poziomu zadowolenia na ankiecie poszkoleniowej (tzw. smile sheets) to absolutne minimum, które jednak nie ocenia przełożenia wiedzy na zysk firmy. Porównując tradycyjny, czterostopniowy Model Kirkpatricka z nowoczesnym LTEM (Learning Transfer Evaluation Model), widzimy jak ważne jest sprawdzanie realnych zmian zachowań pracowniczych na stanowisku pracy. Dopiero weryfikacja, czy pracownik rzeczywiście korzysta z przekazanych technik, pozwala zmierzyć ROI z budżetów rozwojowych.",
    readTime: "6 min czytania",
    publishDate: "2026-03-29"
  },
  {
    id: 9,
    title: "Jak analiza danych HR wpływa na decyzje biznesowe i rentowność firmy?",
    category: "Analityka HR",
    summary: "Strategiczne wykorzystanie zaawansowanych danych personalnych do skutecznego przewidywania rotacji i optymalizacji kosztów.",
    content: "Przedsiębiorcy często traktują dział kadr jako centrum kosztów. Jednak mądre wprowadzenie analizy predykcyjnej potrafi przynieść ogromne oszczędności finansowe. Przykładowo, wykrycie symptomów wypalenia oraz przemęczenia pośród kluczowych menedżerów pozwala na podjęcie działania zanim złożą powiadomienie o rezygnacji. Koszt rekrutacji nowego pracownika na stanowisko eksperckie wynosi średnio od 6 do 12 jego miesięcznych pensji - zapobieganie tym odejściom drastycznie podnosi rentowność.",
    readTime: "5 min czytania",
    publishDate: "2026-03-11"
  },
  {
    id: 10,
    title: "Wypalenie zawodowe – jak je rozpoznać i skutecznie zapobiegać?",
    category: "wypalenie zawodowe",
    summary: "Kluczowy przewodnik dla liderów w obliczu alarmujących statystyk — aż 76% zatrudnionych deklaruje pierwsze objawy wypalenia.",
    content: "Apatia, obniżona efektywność pracy i brak satysfakcji to pierwsze objawy syndromu wypalenia zawodowego. To nie fanaberia jednostek, lecz poważny problem operacyjny rzutujący na całą firmę. Głównym czynnikiem ryzyka jest przedłużające się obciążenie pracą i nierealistyczne oczekiwania kadry zarządzającej. Liderzy must na bieżąco monitorować zmęczenie pracowników i reagować, zanim dojdzie do drastycznego załamania produktywności lub odejścia najbardziej wartościowych członków zespołu.",
    readTime: "6 min czytania",
    publishDate: "2026-02-25"
  }
];

export interface HRlyPlan {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  priceDetails: string;
  recommended: boolean;
  forWhom: string;
  minEmployees: number;
  maxEmployees: number;
  features: string[];
}

export const HRLY_PLANS: HRlyPlan[] = [
  {
    id: "basic",
    name: "HRLY Lite",
    price: "149 zł",
    originalPrice: "299 zł",
    priceDetails: "/ miesięcznie netto",
    recommended: false,
    forWhom: "Najlepszy dla: mniejszych zespołów (do 20 pracowników)",
    minEmployees: 1,
    maxEmployees: 20,
    features: [
      "Dedykowany dla zespołów do 20 pracowników",
      "Analiza zaangażowania i satysfakcji pracowników",
      "Badanie 58 czynników w 11 kluczowych obszarach organizacji",
      "Standardowy raport dla całej organizacji",
      "Gotowe podstawowe rekomendacje działań naprawczych",
      "Panel organizacji i wygodna wysyłka badań drogą mailową",
      "Pełne bezpieczeństwo i anonimowość odpowiedzi"
    ]
  },
  {
    id: "growth",
    name: "HRLY Standard",
    price: "399 zł",
    originalPrice: "799 zł",
    priceDetails: "/ miesięcznie netto",
    recommended: true,
    forWhom: "Najlepszy dla: dynamicznie rozwijających się firm (21-100 pracowników)",
    minEmployees: 21,
    maxEmployees: 100,
    features: [
      "Dedykowany dla firm od 21 do 100 pracowników",
      "Zawiera wszystkie korzyści z planu HRLY Lite",
      "Zaawansowany interaktywny Dashboard dla menedżerów",
      "Gotowe spersonalizowane rekomendacje i praktyczne narzędzia dla liderów",
      "Dostęp do bieżących wyników badań z prezentacją obszarów wymagających reakcji",
      "Pełna historia badań i wygodne automatyczne porównywanie wyników w czasie",
      "Wysyłka badań i intuicyjne, elastyczne zarządzanie respondentami"
    ]
  },
  {
    id: "scale",
    name: "HRLY Premium",
    price: "799 zł",
    originalPrice: "1599 zł",
    priceDetails: "/ miesięcznie netto",
    recommended: false,
    forWhom: "Najlepszy dla: stabilnie rosnących organizacji (101-250 pracowników)",
    minEmployees: 101,
    maxEmployees: 250,
    features: [
      "Dedykowany dla organizacji od 101 do 250 pracowników",
      "Zawiera wszystkie korzyści z planu HRLY Standard",
      "Dedykowany proces Onboardingu i profesjonalne szkolenie zespołu z aplikacji",
      "Możliwość zaawansowanej integracji technicznej z innymi systemami HR",
      "Priorytetowe wsparcie konsultantów HRly w analizie danych i wnioskach"
    ]
  },
  {
    id: "enterprise",
    name: "HRLY Enterprise",
    price: "Wycena",
    priceDetails: "indywidualna kalkulacja",
    recommended: false,
    forWhom: "Najlepszy dla: złożonej struktury i korporacji (powyżej 250 pracowników)",
    minEmployees: 251,
    maxEmployees: 10000,
    features: [
      "Dedykowany dla organizacji powyżej 250 pracowników",
      "Zawiera wszystkie korzyści z planu HRLY Premium",
      "Całkowicie nieograniczona liczba pracowników i ankietowanych w bazie",
      "Unikalna możliwość integracji z używanymi komunikatorami oraz systemami HR",
      "Indywidualne, spersonalizowane szkolenia na żywo oraz pełne wsparcie wdrożeniowe",
      "Możliwość elastycznego dostosowania funkcjonalności platformy pod markę klienta"
    ]
  }
];
