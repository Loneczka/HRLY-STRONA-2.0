# hrly.pl — postęp naprawy systemu wizualnego

Plik prowadzony przez agenta zgodnie z `docs/design-fixes.md` (PROTOKÓŁ WYKONANIA).
Weryfikacja: `npm run lint` (tsc --noEmit), `npm run build`, SKRYPT WERYFIKACYJNY na `http://localhost:3100/` (port 3000 był zajęty przez inny projekt) przy 1440×900, headless Chrome przez CDP + podgląd 390×844.

Lista zadań:
- [x] FAZA 0 — Rekonesans i baseline
- [x] FAZA 1 — Blokery dostępności
- [x] FAZA 2 — Jedna skala typograficzna
- [x] FAZA 3 — Jeden komponent przycisku (STOP 3.2 rozstrzygnięty: A2)
- [x] FAZA 4 — Kolor: reguła zamiast przypadku
- [x] FAZA 5 — Bugi wizualne
- [x] FAZA 6 — Hero (STOP 6.3 nie był potrzebny)
- [x] FAZA 7 — Social proof — szkielet (STOP na treści: czeka na materiały)

---

## FAZA 0 — Rekonesans i baseline   [ZROBIONE]

Zmienione pliki: `docs/design-fixes.md` (protokół wgrany do repo), `docs/design-fixes-progress.md` (ten plik). Zero zmian w kodzie.

### Stack i tokeny
- Vite 6 + React 19 + **Tailwind `^4.1.14` w `package.json` (zainstalowane 4.3.1)** przez `@tailwindcss/vite`, `motion` 12 (`motion/react`), `lucide-react`. Brak `tailwind.config.*`, brak PostCSS.
- **Centralny plik tokenów: `src/index.css`** — blok `@theme` (linie 3–24) z 16 tokenami koloru (`--color-indigo-primary: #3B2F8C`, `--color-accent-apricot: #F4A574`, `--color-text-dark: #14183D`, `--color-neutral-bg: #FBFAF8`, `--color-muted-purple: #55506E`, `--color-success-green: #047857` …) i 3 tokenami fontów (`--font-sans` Inter, `--font-display` Plus Jakarta Sans, `--font-mono` JetBrains Mono).
- **Tokeny kolorów mają zero użyć w komponentach** — wszystkie kolory są wpisane inline jako `[#hex]` (App.tsx ~576 wystąpień; łącznie ~40 różnych hexów, w tym nietokenowe `#6A5E8C` ×38, `#10B981` ×25, `#C4672D` ×10, `#00E5A3`, `#1D2254`, `#241F59`, `#120E37`, `#8A82C7`). Tokeny fontów są używane (`font-mono` 109, `font-display` 43, `font-sans` 38).
- Fonty: Google Fonts w `index.html:18` (Plus Jakarta 300–900, Inter 300–800, JetBrains Mono 400/500 — **mono nie ma wagi 600/700**, przeglądarka syntetyzuje pogrubienie).
- Media queries w CSS: tylko `(max-width: 768px)` i `(min-width: 769px)` (reguły admina). Na stronie głównej 195 prefiksów `sm:/md:/lg:` (Tailwind domyślne breakpointy).
- Keyframes: `float`, `pulse-glowing`, `grid-move` (nieużywane), `pulseWaveAnim`, `pulseWaveAnimAlt`, `travelDotAnim` (hero SVG), `marquee-scroll-up` (130 s, infinite) + Tailwind `spin`, `ping`, `pulse`, `bounce`. Zero obsługi `prefers-reduced-motion`, zero `useReducedMotion`.

### Sekcje strony głównej (w kolejności występowania; wszystkie inline w `src/App.tsx`)
| # | Sekcja | Linie | Tło | Etykieta | Nagłówek |
|---|---|---|---|---|---|
| 0 | Header (logo, nav, CTA „Załóż darmowe konto”, hamburger) | 522–618 | jasne | — | `h1` = logo „hrly” (546) |
| 1 | Menu mobilne (AnimatePresence) | 620–666 | jasne | — | — |
| 2 | Hero + mockup `HrlyHeroGraphic` + pasek statystyk (58 / 10× / +23%) | 684–770 (statystyki 755–769) | jasny gradient | pill „01 · Analityka HR z AI” (z CMS `hero.badge`) | `h2` „Zmień dane HR w strategiczne decyzje.” (z CMS `hero.headline`) |
| 3 | Baner demo „Przetestuj interaktywny pulpit HRly” | 773–823 | białe | pill „Pulpit demonstracyjny” (bez numeru) | `h3` |
| 4 | 02 · Od wyniku do działania (karty 01/02/03) | 826–864 | białe | pill mono „02 · OD WYNIKU DO DZIAŁANIA” | `h3` |
| 5 | 03 · Wyzwania (3 karty, pierwsza ciemna) | 867–928 | bez tła | pill mono „03 · Wyzwania…” | `h3` |
| 6 | 04 · Co otrzymujesz (4 karty z tą samą ikoną `CheckCircle2`) | 931–976 | białe | pill sans „04 · CO OTRZYMUJESZ” | `h3` |
| 7 | (05) Metodologia / 11 obszarów — ciemna, marquee | 979–1093 (**`div`, nie `section`**) | ciemne `#14183D` | goły mono w brzoskwini „Metodologia Badania Satysfakcji i eNPS” (bez numeru) | `h3` w **`font-sans`** (jedyny nie-display) |
| 8 | 06 · Jak to działa (kroki 01/02/03) | 1096–1129 | bez tła | pill sans „06 · JAK TO DZIAŁA” | `h3` |
| 9 | 07 · CTA końcowe „Zbuduj zaangażowany zespół…” | 1132–1175 | ciemne | pill brzoskwiniowa „07 · GOTOWI NA ZMIANĘ?” | `h3` |
| 10 | Footer | 2134–2182 | ciemne | mono brzoskwinia „Opcje menu” / „Baza wiedzy” | — |
| 11 | Modal pulpitu (`HrlyDashboardPreview`, lazy) | 2268–2308 | overlay | — | `h4`/`h5`/`h6` wewnątrz |
| 12 | Dialog demo (2185–2265) | — | — | — | **nieosiągalny** (`setDemoDialogOpen(true)` nigdzie nie jest wywoływane) |

Komponenty `HrlyMethodologyVisual`, `HrlyPricingCalculator`, `HrlyBlogSection` renderują się tylko na innych zakładkach (`#features`, `#pricing`, `#blog`) — poza zakresem strony głównej. Routing: hash (`#features` itd.), strona główna = brak hasha.

### Przyciski / CTA
- **Współdzielony `Button`/`CTA`: brak.** Każdy CTA jest inline (`<button className="…">`). Jedyny reużywalny przycisk to `AdminButton` w `src/components/admin/ui.tsx` (panel admina, poza zakresem).
- **Osobnych definicji przycisku: 32** różne stringi `className` na 45 miejscach (`App.tsx` + `Hrly*.tsx`); z tego na samej stronie głównej (header, hero, sekcje, footer, modal): **13** (logo-button 526, nav-pills 554–593, CTA header 598, hamburger 608, mobile-nav 630–653, mobile CTA 656, hero primary 716, hero secondary 724, baner demo 790, „Zobacz naszą ofertę” 1038, „Zacznij bezpłatny test” 1151, linki footera 2168–2177, zamknięcie modala 2286).
- Mapowanie 6 CTA z briefu: header 598–604 (Inter 12/700, `#3B2F8C`, h 32); hero primary 716–722 (Inter 12/700, `#3B2F8C`, tekst z CMS `hero.ctaPrimaryText` = „Wypróbuj za darmo →” + ikona strzałki = **podwójna strzałka**); hero secondary 724–729 (biały, border); baner demo 790–796 (Plus Jakarta 12–14/900, gradient brzoskwiniowy); „Zobacz naszą ofertę” 1038–1044 (JetBrains Mono 11/700, **pill**, biały na ciemnym); „Zacznij bezpłatny test” 1151–1156 (Plus Jakarta 12/800, `#F4A574`).

### Dostępność (stan wyjściowy)
- `focus:outline-none` / `outline: 'none'`: **17 wystąpień** na stronie publicznej (App.tsx: 528, 2003, 2018, 2036, 2048, 2071, 2168–2175; HrlyDashboardPreview 127; HrlyPricingCalculator 259/271/284; HrlyBlogSection 176/292 jako inline `outline: 'none'`) + 3 inline w adminie. **Reguł `:focus-visible`: 0.**
- Brak wspólnej klasy dla ciemnych sekcji (`.dark-glass-panel` istnieje w CSS, ale ma 0 użyć). Ciemne wrappery: App.tsx 887 (karta „Cicha rezygnacja”), 979 (11 obszarów), 1132 (CTA 07), 2134 (footer), HrlyDashboardPreview 82 i 305, HrlyHeroGraphic 147 (karta „Zaufanie w firmie”).
- Nagłówki (DOM): `h1=1` (logo), `h2=1` (hero), `h3=7`, `h4=39`; etykiety typu „01 · …”, „PULPIT DEMONSTRACYJNY” to `span`/`div` (nie są nagłówkami — dobrze).
- Marquee: lista 11 obszarów zdublowana `[...RESEARCH_AREAS, ...RESEARCH_AREAS]` (App.tsx 1057), duplikat **bez** `aria-hidden`; wygaszanie góra/dół to nakładki `bg-gradient` (1052–1053), nie `mask-image`.
- Hero: wszystkie elementy pojawiają się z wrapperem strony (0,3 s); lokalnie nie ma 3-sekundowego opóźnienia z briefu — na produkcji to najpewniej `display=swap` fontów z Google (weryfikacja w FAZIE 6). Cały mockup jest obrócony `rotateX(38deg) rotateZ(-20deg)` (HrlyHeroGraphic 33), więc etykiety i liczby są pochylone; wykres to SVG `path` z ~12 wierzchołkami „EKG” + 2 kropki, bez osi.

### Baseline SKRYPTU WERYFIKACYJNEGO (localhost:3100, 1440×900, przed zmianami)
```
ROZMIARY FONTU: 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 30, 36, 44
  (histogram) 8px×2, 9px×5, 10px×20, 11px×38, 12px×47, 14px×41, 16px×2, 18px×1, 20px×2, 24px×3, 30px×4, 36px×6, 44px×1
WAGI: 400, 500, 600, 700, 800, 900   (400×27, 500×22, 600×11, 700×34, 800×43, 900×35)
KROJE: Plus Jakarta Sans | Inter | JetBrains Mono
NAGŁÓWKI: h1=1 h2=1 h3=7 h4=39
WYSOKOŚCI PRZYCISKÓW: 31, 32, 36, 41, 44, 46, 48, 52
RADIUSY PRZYCISKÓW: 0px, 12px, pill
KROJE PRZYCISKÓW: Inter, Plus Jakarta Sans, JetBrains Mono
BŁĘDY KONTRASTU (7):
  ✗ ✓ [10px/w700] = 2.37:1   (×3 — zielone „✓” w pasku zaufania hero, text-emerald-500)
  ✗ +12% wzrostu [10px/w800] = 3.65:1
  ✗ 94% [20px/w800] = 1.04:1   (skrypt nie widzi tła gradientowego karty — fałszywy alarm, do potwierdzenia)
  ✗ Wysokie [9px/w700] = 1.58:1
  ✗ 10× [30px/w800] = 1.99:1
```
Tab-walk (19 przystanków): logo i 5 linków footera bez żadnego obrysu (`outline: none`), reszta z domyślnym `outline: auto` przeglądarki; hero primary ring 1.25:1, CTA na ciemnym 1.02–1.07:1. Reduce-motion: 12 animacji nadal `running` (marquee, pulse, ping, fale SVG).
Na 390×844: te same rozmiary/wagi (8–30 px), nagłówki bez zmian, wysokości przycisków 31–64.

Lint (`tsc --noEmit`): czysty. Build: OK.

Odstępstwa od planu i dlaczego: brak. Uwaga: skrypt w `verify.js` zwraca wynik jako string (zamiast `console.log`), żeby dało się go uruchamiać headlessowo — logika pomiaru bez zmian.

Do decyzji właściciela: na razie nic.

---

## FAZA 1 — Blokery dostępności   [ZROBIONE Z ODSTĘPSTWEM]

Zmienione pliki: `src/index.css`, `src/App.tsx`, `src/components/HrlyBlogSection.tsx`, `src/components/HrlyDashboardPreview.tsx`, `src/components/HrlyHeroGraphic.tsx`, `src/components/HrlyMethodologyVisual.tsx`, `src/components/HrlyPricingCalculator.tsx`, `src/components/admin/ui.tsx`, `src/components/admin/BlogTab.tsx`, `src/components/AdminPanel.tsx`, `docs/design-fixes-progress.md`.

### 1.1 Focus
- Token `--color-focus: #3B2F8C` w `@theme`; reguły `:focus-visible` (fiolet) i `.section-dark … :focus-visible` (brzoskwinia `#F4A574`) w `@layer base`.
- Usunięte wszystkie `focus:outline-none` (App.tsx ×11, HrlyDashboardPreview ×1, HrlyPricingCalculator ×3) i inline `outline: 'none'` (HrlyBlogSection ×2, admin/ui.tsx ×2, admin/BlogTab ×1). `rg "outline-none|outline:\s*['\"]?none" src` → 0.
- Klasa `section-dark` dodana do: `App.tsx` 889 (karta „Cicha rezygnacja”), 981 (11 obszarów), 1136 (CTA 07), 2138 (footer); `HrlyMethodologyVisual.tsx` 212; `HrlyBlogSection.tsx` 145 (NewsletterBox); po review także `AdminPanel.tsx` 54 (ekran logowania) i 132 (root panelu). Pominięte (brak fokusowalnych potomków): `HrlyDashboardPreview.tsx` 82 i 305, `App.tsx` ~1854 (about), `HrlyHeroGraphic.tsx` 147.

### 1.2 Reduced motion
- Nielayerowany blok `@media (prefers-reduced-motion: reduce)` w `index.css` (globalne wyłączenie animacji/tranzycji + `.marquee-viewport/.marquee-track/.marquee-fade/.marquee-dup`).
- Marquee: duplikat listy ma `aria-hidden="true"` + `marquee-dup`; przy `reduce` lista 11 kart jest statyczna, bez duplikatu i nakładek.
- `<MotionConfig reducedMotion="user">` wokół drzewa strony publicznej (motion/react); kropka w hero SVG dostała `cx="20"` (pozycja spoczynkowa).
- Po review: `window.scrollTo` przy zmianie zakładki używa `behavior: 'auto'` przy `reduce` (opcja `behavior` wygrywa z CSS `scroll-behavior`); zduplikowany efekt scrollowania (2× identyczny `useEffect`) zredukowany do jednego.

### 1.3 Nagłówki
- Logo: `h1` → `span`, przycisk logo `aria-label="hrly — strona główna"`, SVG `aria-hidden`. Hero `h2` → `h1`; tytuły sekcji `h3` → `h2`; tytuły kart `h4` → `h3`. Strona główna: `h1=1`, `h2` sekcje, `h3` karty, zero `h4/h5/h6` przy zamkniętym modalu.
- Modal pulpitu (`HrlyDashboardPreview`): tytuł `h2` → wybrany obszar `h3` → karty `h4`.
- Pozostałe trasy (features/pricing/about/contact/blog) przesunięte tak samo (hero `h1`, `h3`→`h2`, `h4`→`h3`). Po review: 4 kafle mockupu pod hero na `#features` (1272/1299/1323/1350) i 3 filary na `#about` (1686/1700/1714) `h3` → `h2`, żeby nie było przeskoku `h1 → h3`.

Wynik skryptu: lint (`tsc --noEmit`) czysty, build OK; `rg "<h4|<h5|<h6" src/App.tsx` → 0.

Odstępstwa od planu i dlaczego:
- `border-radius: inherit` pominięte w regule focusu — w Tailwind v4 nielayerowana reguła wygrałaby z utility `rounded-*` i „kwadratowała” przyciski przy fokusie; obrys i tak podąża za `border-radius` w nowoczesnych przeglądarkach. Reguły umieszczone w `@layer base`, żeby utility Tailwinda dalej wygrywały.
- `section-dark` na dwóch wrapperach root admina (`AdminPanel.tsx` 54, 132) — poza zakresem „strona publiczna”, ale bez tej klasy globalny fiolet `#3B2F8C` na ciemnym tle admina (`#1e293b`/`#0f172a`) dawał kontrast 1.37:1/1.67:1, czyli regres względem domyślnego `outline: auto` przeglądarki; brzoskwinia daje 7.3:1/10.5:1. Zero zmian wizualnych poza kolorem obrysu focusu.

Do decyzji właściciela: (a) zaakceptować albo cofnąć `section-dark` w adminie (2 linie); (b) opcjonalnie w późniejszej fazie `.pulse-wave-1, .pulse-wave-2 { stroke-dasharray: none }` przy `reduce`, żeby linia EKG w hero była narysowana w całości statycznie; (c) `.claude/launch.json` (konfiguracja podglądu przeglądarki) nie jest częścią fazy — nie dodawać do commita.

---

## FAZA 1 — Blokery dostępności   [ZROBIONE]

Zmienione pliki: `src/index.css`, `src/App.tsx`, `src/components/HrlyHeroGraphic.tsx`, `src/components/HrlyDashboardPreview.tsx`, `src/components/HrlyMethodologyVisual.tsx`, `src/components/HrlyBlogSection.tsx`, `src/components/HrlyPricingCalculator.tsx`, `src/components/AdminPanel.tsx` (+2 klasy), `src/components/admin/ui.tsx` i `admin/BlogTab.tsx` (tylko usunięcie `outline: 'none'`).

### 1.1 Focus dla klawiatury
- Token `--color-focus: #3B2F8C` w `@theme`; reguły `:focus-visible` (2px solid, offset 3px) dla `a, button, [role=button], input, select, textarea, summary, [tabindex]` w `@layer base`; wariant `.section-dark … { outline-color: #F4A574 }`.
- Usunięte wszystkie 15 klas `focus:outline-none` i 5 inline `outline: 'none'` (w tym 3 w adminie). `rg "outline-none|outline:\s*['\"]?none" src` → 0.
- Nowa klasa `section-dark` na: karcie „Cicha rezygnacja” (887), sekcji 11 obszarów (979), CTA 07 (1132), `<footer>` (2134), ciemnym panelu `HrlyMethodologyVisual` (212), boksie newslettera `HrlyBlogSection` (145) oraz — po uwadze recenzenta — na dwóch wrapperach panelu admina (`AdminPanel.tsx` 54 i 132; admin jest cały ciemny, fiolet dawałby 1,4:1).
- Tab-walk 1440 (19 przystanków): każdy ma `solid 2px`, offset 3px; jasne sekcje `#3B2F8C` = **10,2:1** (10,65:1 na białym), ciemne `#F4A574` = **8,54:1**. Promienie przycisków bez zmian.

### 1.2 `prefers-reduced-motion`
- Globalny blok z `animation-duration/iteration-count/transition-duration/scroll-behavior !important` (poza warstwami).
- Marquee: klasy `marquee-viewport`, `marquee-track`, `marquee-fade`, `marquee-dup`; drugi komplet 11 kart ma `aria-hidden="true"`; przy `reduce` viewport ma `height:auto; overflow:visible`, tor `position:static; animation:none`, wygaszenia i duplikat `display:none` → pełna, statyczna lista 11 kart (strona rośnie 5026 → 5603 px).
- `<MotionConfig reducedMotion="user">` wokół całego drzewa publicznego (motion/react) — wyłącza animacje transformacji (pływające karty hero, wskaźnik w banerze demo, przejścia tras).
- Kropka na wykresie hero dostała `cx="20"` (pozycja spoczynkowa); przy `reduce` linia EKG renderuje się jako pełna (`stroke-dasharray: none`), a nie zatrzymany fragment kreskowania.
- Pomiar headless z emulacją `prefers-reduced-motion: reduce`: **0 działających animacji** (baseline: 12), cała treść widoczna.

### 1.3 Hierarchia nagłówków
- Logo: `<h1>` → `<span class="block …">` (te same klasy + `block`, żeby box był identyczny jak blokowy `h1`); `<button aria-label="hrly — strona główna">`, SVG `aria-hidden`.
- Hero `h2` → `h1`; 7 tytułów sekcji `h3` → `h2`; wszystkie tytuły kart `h4` → `h3`. Etykiety były już `span`/`div`.
- DOM strony głównej: **h1=1 h2=7 h3=39 h4=0**, bez przeskoków. Modal pulpitu (osobny dialog): h2 → h3 → h4 (5 kart).
- Podstrony traciły `h1` (logo) — przesunięte tak samo (hero `h2`→`h1`, `h3`→`h2`, `h4`→`h3`); każda ma dokładnie jeden `h1` i zero `h4+`.

### Wynik skryptu (1440×900)
```
NAGŁÓWKI: h1=1 h2=7 h3=39 h4=0
ROZMIARY FONTU / WAGI / PRZYCISKI / KONTRAST: bez zmian względem baseline (to zadania FAZ 2–4)
```
Diff pikselowy pełnej strony vs baseline (1440 i 390): różnice wyłącznie w regionach animowanych (mockup hero, wskaźnik w banerze demo, marquee) — 0 różnic w headerze, tekstach i układzie. Wysokość strony identyczna (5026 / 8460 px). Lint i build czyste.

Odstępstwa od planu i dlaczego:
1. Bez `border-radius: inherit` z fragmentu w protokole — w Tailwind v4 taka reguła (poza warstwą) nadpisałaby `rounded-*` elementu i „kwadratowała” przycisk po fokusie; obrys i tak podąża za promieniem. Reguły siedzą w `@layer base`, żeby utility Tailwinda dalej wygrywały.
2. Selektor dla ciemnych sekcji rozszerzony o `input, select, textarea, summary, [tabindex]` (protokół wymieniał tylko `a, button, [role=button]`).
3. `section-dark` także w panelu admina (2 wrappery) — reguła globalna trafia i tam; bez tego admin dostałby ring 1,4:1. Zero zmian wizualnych poza kolorem ringu.
4. Przesunięcie nagłówków na podstronach (poza zakresem strony głównej) było konieczne, bo usunięcie `h1` z logo zabrałoby im jedyny `h1`. Recenzent wskazał odziedziczony przeskok (h1 → h3) na `#features` i `#about`; naprawiony przez `h3` → `h2` na 4 kafelkach makiety (features) i 3 filarach (about).
5. `window.scrollTo({behavior:'smooth'})` przy zmianie trasy nie jest neutralizowane przez CSS (dotyczy tylko przełączania zakładek, nie animacji) — zostawione.
6. Zbudowany CSS zawiera martwe utility `.focus\:outline-none`, bo Tailwind v4 skanuje też `docs/*.md`; nieużywane, nieszkodliwe.

Do decyzji właściciela:
- 4 kafelki makiety na `#features` („Naukowa baza pytań”, „Action Plan”, „Wsparcie Managerów”, „Statystyki i trendy”) są teraz `h2` (dla braku przeskoku) — semantycznie to dekoracja; można je zamienić na `p`, jeśli podstrony wejdą w zakres.
- Wykluczenie `docs/` ze skanowania Tailwinda (`@source not "../docs"` w `index.css`) — drobna zmiana konfiguracji, poza zakresem fazy.

---

## FAZA 2 — Jedna skala typograficzna   [ZROBIONE Z ODSTĘPSTWAMI]

Zmienione pliki: `src/index.css` (tokeny), `src/App.tsx` (header, menu mobilne, hero, sekcje 02–07, footer), `src/components/HrlyHeroGraphic.tsx` (mockup hero), `src/components/HrlyDashboardPreview.tsx` (modal pulpitu), `index.html` (1 linia — patrz odstępstwo 5), `docs/design-fixes-progress.md`. Zakres: strona główna + header/footer/menu + modal pulpitu. Podstrony (`#features/#pricing/#about/#contact/#blog`) i `HrlyMethodologyVisual/PricingCalculator/BlogSection` nietknięte.

### 2.1 Tokeny (`src/index.css`, blok `@utility`)
Siedem klas dokładnie wg tabeli protokołu: `type-display` 60/36, `type-h2` 40/28, `type-h3` 20/18, `type-body-lg` 18/16, `type-body` 16/15, `type-body-sm` 14, `type-label` 12 (interlinia/waga/tracking z tabeli, mobile = `max-width: 768px` zagnieżdżone w `@utility`; zbudowany CSS zawiera media query — sprawdzone w `dist/assets/*.css`). Klasa NIE ustawia rodziny — `font-display/sans/mono` zostają na elemencie.

### 2.2 Mapowanie
- Wszystkie `text-[7–11px]`, `text-xs…text-4xl`, `font-black/medium/light`, `leading-*`, `tracking-*` na tekstach strony głównej i modala zamienione na tokeny (`rg` z bramki: 0 trafień w `HrlyHeroGraphic.tsx` i `HrlyDashboardPreview.tsx`; w `App.tsx` trafienia tylko na logo, CTA i w blokach podstron/nieosiągalnym dialogu demo 2185–2265).
- Siatki kart (02, 03, 04, 06) z `h-full`/`items-stretch`; mockup hero powiększony pod 12/18/20 px (arkusz 320→350, karta główna 290→320 z `min-h`, karty pływające 175→210 i 185→220, badge „Preview” `-left-8`→`-left-16`, ikonka fali `top-[18px]`→`top-[84px]`).
- Modal: `h2` → `type-h3`, liczby → `type-h3`, `h4` kart → `type-body font-bold`, etykiety → `type-label`, zdania → `type-body-sm`, lista obszarów → `type-body-sm font-semibold` / `type-label` / `type-body font-bold font-display`.
- CTA: tylko `font-black` → `font-extrabold` (baner demo); paddingi, promienie, kolory i rozmiary tekstu CTA bez zmian (FAZA 3).

### Poprawki po review (druga iteracja)
1. **Mockup hero na mobile bez skalowania.** Pierwsza wersja dopasowywała powiększony mockup do 390 px przez `max-sm:scale-[0.85]` — to renderowało `type-label` 12 px jako ~10,2 px i `type-h3` 18 px jako ~15,3 px (obejście reguły „nie zmniejszaj fontu, żeby zmieścić layout”). Usunięte. Zamiast tego wymiary tylko-mobilne (`max-sm:`): arkusz i kontener 350→330, karta główna 320→300 (`min-h` 300), karty pływające 210→190 i 220→200. Pomiar 390 (`hero-scale.js`): `scale=none`, kontener 308×480, `OVERLAPS(0)`; wszystkie teksty mockupu w klipie sekcji (x 17…373): „Kondycja Zespołu” l=34, „+12% wzrostu” r=368; rozmiary 12/18 px. Układ 1440 bez zmian (różnice ≤2 px = faza animacji pływania).
2. **`shrink-0` na `.isometric-card`.** Jako flex item kurczył się z 350 do 308 px w kontenerze 390 (karta główna centrowana, karta „Retencja kadry” zakotwiczona do lewej krawędzi zmniejszonego pudełka) — stąd karta retencji zasłaniała „+” w „+12% wzrostu”. Po `shrink-0` geometria jest ta sama co na 1440; na zrzucie 390 „+12% wzrostu” w całości widoczne.
3. **Badge „Preview”:** na mobile `max-sm:top-[125px] max-sm:-left-8` (na 1440 bez zmian). Badge wisi z lewej strony karty, której lewy róg i tak jest na krawędzi klipu sekcji, więc na 390 nie da się go pokazać w całości bez zasłonięcia tekstu karty — wybrane położenie: 28 px ucięte (baseline FAZY 0: ~40 px, „VIEW”; pierwsza wersja FAZY 2: 30 px), zero kontaktu z „Kondycja Zespołu”/„Analityka Pulsu”, badge opiera się o lewą krawędź panelu wykresu (~8 px, tylko obramowanie siatki). Dodatkowo `lg:max-xl:-left-12`, bo na 1024–1279 px badge stykał się z boxem `h1` (na 1100 px: 10 px luzu; 1440 nietknięte).
4. Modal: dwa wiersze nagłówków („Narzędzia dla managera” + pigułka „Podgląd szablonów”, „Rozbicie na czynniki cząstkowe” + „N czynniki analizowane”) dostały `flex-wrap gap-y-2`, a pigułka/meta `shrink-0 whitespace-nowrap` — na 390 pigułka spada pod tytuł zamiast ściskać go do 3 linii. Kafelek „Częstotliwość”: `type-body-sm font-bold` → `type-label` (wartość w kafelku statystyk, nie emfaza inline).
5. Sekcja 05, siatka 2×2 atrybutów: `sm:min-h-[2.6em]` na `h3` (2 linie × 1.3), żeby opisy w rzędzie zaczynały się na tej samej wysokości („Naukowa struktura” i „Szybka konfiguracja” łamią się na 2 linie obok 1-linijkowych sąsiadów). Bez zmian fontów.

### Wynik skryptu
```
1440×900 (strona):   ROZMIARY FONTU: 12, 14, 16, 18, 20, 40, 60   WAGI: 400, 600, 700, 800
                     NAGŁÓWKI: h1=1 h2=7 h3=39 h4=0
                     WYSOKOŚCI PRZYCISKÓW: 32, 34, 36, 38, 41, 44, 46, 48, 52
                     BŁĘDY KONTRASTU (7): ✓×3 2.37:1, +12% wzrostu 3.65:1, 94% 1.04:1, Wysokie 1.58:1, 10× 1.99:1  (te same 7 co w baseline — FAZA 4)
390×844 (strona):    ROZMIARY FONTU: 12, 14, 15, 16, 18, 20, 28, 36   WAGI: 400, 600, 700, 800
                     (20px ×1 = logo „hrly” w headerze — wyjątek znaku firmowego; 15px = type-body mobile wg tabeli)
                     BŁĘDY KONTRASTU (8): 7 jw. + „01” [18px/w700] 3.88:1
1440 + modal:        ROZMIARY: 12, 14, 16, 18, 20, 40, 60   WAGI: 400, 600, 700, 800   NAGŁÓWKI: h1=1 h2=8 h3=40 h4=5
390 + modal:         ROZMIARY: 12, 14, 15, 16, 18, 20, 28, 36   WAGI: 400, 600, 700, 800
offenders.js:        1440 → 0; 390 → 1 (logo 20px)
lint (tsc --noEmit): czysty   build: OK
```
Zrzuty 1440 (pełna strona), 390 (pełna strona) i modal 1440/390: nic nie nachodzi na tekst, siatki równe (po poprawkach z review).

### Odstępstwa od planu i dlaczego
1. **Modal `h2` → `type-h3`** (20/700/1.3 zamiast 40/800/1.15) i **`h4` kart modala → `type-body font-bold`** (16/700/1.6 zamiast `type-h3`): 40 px nie mieści się w pasku modala, a 20 px rozbijał nagłówki w 2-kolumnowej siatce kart. Oba warianty były w spec dopuszczone pod warunkiem opisania. Skutek uboczny: „WPŁYW NA PRACOWNIKA” łamie się na 2 linie przy 1440 (obok 1-linijkowego „WPŁYW NA BIZNES”).
2. **Tytuły kart marquee (sekcja 05): `truncate` → `sm:truncate`.** Spec: „zostaw truncate”; poniżej 640 px 18-px tytuł w 300-px karcie byłby ucinany w połowie słowa, więc na mobile tytuły się zawijają (karty wyższe, ~2 w oknie marquee). Na ≥640 px truncate bez zmian.
3. **Wysokości nav/footera:** linki nav header 28→34 px i linki footera 31→38 px (skutek `type-body-sm font-semibold` z mapowania), header 62→68,7 px. Sześć CTA ma identyczne wysokości (32/44/46/52/41/48) — nie ruszone.
4. **CTA „Zobacz naszą ofertę” zostaje na `text-[11px]`** (sekcja 05). Reguła fazy: rozmiary CTA nietykane do FAZY 3; skrypt tego nie raportuje (przycisk ma dziecko SVG, więc nie jest liściem). **Przeniesione do FAZY 3 jako jawny offender** — docelowo 12 px (`type-label`-owy rozmiar) przy przebudowie przycisku.
5. **`index.html`: Google Fonts JetBrains Mono `400;500` → `400;500;600`.** `type-label` ma wagę 600, a mono nie miało tej wagi — Chrome syntetyzował pogrubienie z 500. Jedna linia, bez nowej zależności (ten sam request do Google Fonts). Jeśli właściciel woli, można cofnąć i zaakceptować syntetyczny bold.
6. **Logo „hrly” 20 px w headerze** zostaje (znak firmowy, spec) — na 390 pojawia się w `ROZMIARY FONTU` jako jedyny rozmiar spoza zbioru mobile.
7. Mockup hero na mobile ma własne wymiary (`max-sm:`), a badge „Preview” jest na 390 częściowo ucięty (28 px, mniej niż w baseline) i oparty o krawędź panelu wykresu — kompromis, patrz „Poprawki po review” 3; pełne rozwiązanie w FAZIE 6 (hero).
8. Na 1024–1279 px `h1` 60 px łamie się na 4 linie („ZMIEŃ DANE / HR W / …”) — poza bramką 1440/390, do FAZY 6.

### Do decyzji właściciela
- FAZA 3: `text-[11px]` na CTA „Zobacz naszą ofertę” → 12 px (jedyny tekst < 12 px na stronie głównej).
- FAZA 4: numerały „01/02/03” w sekcji 02 (`#C4672D` na białym) — po zmianie na 18 px/700 na mobile przestają być „large text” i mają 3.88:1 (na 1440 przy 20 px/700 nadal large, OK); przyciemnić kolor albo zaakceptować. Pozostałe 7 błędów kontrastu — bez zmian od baseline. Modal: 40 (1440) / 32 (390) błędów kontrastu — również FAZA 4 (etykiety `#A39AB4`/`text-gray-400` na tłach, wyniki obszarów).
- `index.html` (waga 600 JetBrains Mono): zostawić czy cofnąć.

---

## FAZA 3 — Jeden komponent przycisku   [ZROBIONE Z ODSTĘPSTWAMI]

Zmienione pliki: `src/components/Button.tsx` (nowy — jedyny nowy plik tej fazy), `src/index.css` (tokeny `--color-cta-*`), `src/App.tsx` (7 CTA na `<Button>`, 3 poprawki typów w miejscach wywołań), `package.json`/`package-lock.json` (`@types/react`, `@types/react-dom` — dev, za zgodą właściciela).

### 3.1 Komponent `Button`
- `variant: primary | secondary | ghost`, `size: md (h-10, px-5, 14/600) | lg (h-12, px-7, 16/700)`, `tone: light | dark`, `icon` (po prawej, 16 px, `aria-hidden`), `fullWidth`, forma `<a href>` lub `<button type="button">`.
- Zawsze `rounded-xl` (12 px), `font-sans` (Inter), `normal-case` (sentence case wymuszony), tracking 0, `transition-[background-color,color,border-color,scale] duration-150`.
- Stany: default / `hover:` / `active:` (`scale-[0.98]` na primary) / `focus-visible` (globalny ring z FAZY 1; wariant dark dodatkowo `focus-visible:outline-accent-apricot`, żeby ring był brzoskwiniowy także poza `.section-dark`) / disabled (`disabled:` i `aria-disabled:` → opacity-50 + brak zdarzeń; dla `<a aria-disabled>` komponent zdejmuje `href`, ustawia `tabIndex=-1` i blokuje `onClick`, żeby Enter też nie działał).
- Kolory wyłącznie z tokenów `@theme`: `--color-cta-primary(-hover|-active|-text)` [jasne tło], `--color-cta-primary-dark(-hover|-active|-text)` [ciemne tło], `--color-cta-outline(-hover)` [tekst/obramowanie secondary i ghost]. Secondary hover/active = `bg-cta-outline/5` / `/10` (color-mix), więc jedna podmiana tokenów wystarczy po decyzji.
- Lint (tsc) i build czyste; wszystkie użyte utility (w tym `hover:bg-cta-outline/5`, `focus-visible:outline-accent-apricot`, `transition-[…,scale]`) są w zbudowanym CSS.
- Recenzja (2 agentów, 16 uwag) — naniesione: `scale` zamiast `transform` w transition; rozmiary tekstu `text-sm`/`text-base` zamiast `type-body*` (token body ma 15 px na mobile, a lg ma być 16/700 zawsze); realne `aria-disabled` dla linku; `normal-case`; decoupling secondary/ghost od `cta-primary` (brzoskwinia na białym = 2,0:1 — nie nadaje się na tekst/obramowanie); osobne wypełnienie primary na ciemnym tle (fiolet na navy = 1,6:1); ring na tone=dark.

### Mapowanie CTA do 3.3 (po decyzji)
| CTA | Button |
|---|---|
| Header „Załóż darmowe konto” (598) | `primary md` + ikona ArrowRight |
| Menu mobilne „Załóż darmowe konto” (657) | `primary md fullWidth` |
| Hero „Wypróbuj za darmo →” (717, tekst z CMS) | `primary lg` + ikona ArrowRight |
| Hero „Jak to działa →” (725, tekst z CMS) | `secondary lg` |
| Baner demo „Otwórz przykładowy raport” (791) | `primary lg` + ikona ArrowUpRight, sentence case |
| 05 „Zobacz naszą ofertę” (1039, ciemna) | `secondary md tone=dark` + ikona ArrowRight |
| 07 „Zacznij bezpłatny test” (1154, ciemna) | `primary lg tone=dark` |

Odstępstwa od planu i dlaczego:
1. Ikona jest wyśrodkowana w pionie (`items-center`), nie „do baseline” — przy 14/16 px tekście i 16 px ikonie wyśrodkowanie daje lepsze optyczne wyrównanie; do potwierdzenia.
2. Dodatkowe tokeny `--color-cta-primary-dark-*` i `--color-cta-outline*` (protokół zakładał jeden kolor primary) — bez nich primary na ciemnych sekcjach (05, 07) ginie w tle (1,6:1), a secondary/ghost w brzoskwini nie przeszłyby kontrastu.
3. Wysokości: nav-pills (34 px) i linki footera (38 px) nie są CTA — nie przechodzą na `Button`; skrypt będzie je nadal raportować obok 40/48.

### 3.2 Decyzja właściciela (2026-09-09): **A2 — fiolet `#3B2F8C` primary na jasnym tle, inwersja (biały / fioletowy tekst) na ciemnych sekcjach; brzoskwinia tylko jako akcent.** Zgoda także na `@types/react` + `@types/react-dom` (devDependencies).
Tokeny w `src/index.css` odpowiadają decyzji bez zmian (placeholder = wybrany wariant).

### 3.3 Podmiana CTA (7 miejsc)
| CTA | Button | Pomiar 1440 |
|---|---|---|
| Header „Załóż darmowe konto” | `primary md` + ArrowRight | 40 px, 14/600, `#3B2F8C` |
| Menu mobilne „Załóż darmowe konto” | `primary md fullWidth` | 40 px |
| Hero „Wypróbuj za darmo →” (CMS) | `primary lg` | 48 px, 16/700 |
| Hero „Jak to działa →” (CMS) | `secondary lg` | 48 px, biały + border fiolet |
| Baner demo „Otwórz przykładowy raport” | `primary lg` + ArrowUpRight | 48 px, sentence case |
| 05 „Zobacz naszą ofertę” (ciemna) | `secondary md tone=dark` + ArrowRight | 40 px, biały tekst, border white/40 |
| 07 „Zacznij bezpłatny test” (ciemna) | `primary lg tone=dark` | 48 px, biały / `#3B2F8C` (inwersja) |
Wszystkie: `rounded-xl` 12 px, Inter, `text-transform: none`, ring fokusu 10,2:1 (jasne) / 8,54:1 (ciemne, brzoskwinia).

### Wynik skryptu (1440×900)
```
WYSOKOŚCI PRZYCISKÓW: 34, 36, 38, 40, 48      (34 = nav-pills, 36 = logo, 38 = linki footera — nie-CTA; CTA: tylko 40 i 48)
RADIUSY PRZYCISKÓW:   0px, 8px, 12px           (0/8 = logo, linki footera, nav-pills; CTA: tylko 12px)
KROJE PRZYCISKÓW:     Inter                    (jeden krój — cel osiągnięty)
NAGŁÓWKI: h1=1 h2=7 h3=39 h4=0   ROZMIARY/WAGI: bez zmian (12–60 / 400–800)
CTA (6): bg primary = rgb(59,47,140) na jasnym; na ciemnym inwersja rgb(255,255,255) (decyzja A2)
390: WYSOKOŚCI 36, 38, 40, 48; RADIUSY 0px, 12px; KROJE Inter
```
Lint (`tsc --noEmit`, teraz z prawdziwymi typami Reacta) i build czyste.

### Odstępstwa od planu i dlaczego (uzupełnienie)
4. **Skrypt raportuje 5 wysokości, nie 2** — trzy dodatkowe to elementy nie będące CTA (logo-button 36, nav-pills 34, linki footera 38 — wyższe po FAZIE 2, bo mają `type-body-sm`). Sześć CTA ma dokładnie 40/48. Zamiana nav/footera na `Button ghost` byłaby zmianą poza zakresem („Wszystkie 6 miejsc na `<Button>`”).
5. **Hero: bez ikon.** Teksty CTA z CMS kończą się znakiem „→” („Wypróbuj za darmo →”, „Jak to działa →”); dodanie ikony dawałoby podwójną strzałkę, a treść z CMS to copy — nie ruszam. Do decyzji: usunąć „→” z `DEFAULT_CONFIG.hero.ctaPrimaryText/ctaSecondaryText` i włączyć ikonę.
6. **Usunięta brzoskwiniowa poświata (`blur` + `animate-pulse`) za CTA banera demo** — to była stylizacja tego jednego przycisku (peach glow za fioletowym przyciskiem nie ma sensu; zgodne z regułą akcentu FAZY 4). Ikonka „kursora” obok przycisku zostaje.
7. **Ikony w CTA dziedziczą kolor tekstu** (biały/fiolet) zamiast brzoskwini — brzoskwinia wewnątrz przycisku primary to drugi kolor akcji w jednym elemencie.
8. **3 poprawki typów w `App.tsx`** ujawnione przez `@types/react` (wcześniej `React.*` było `any`): `AdminPanel` i `HrlyBlogSection` dostawały propsy, których nie deklarują (`onBack`, `config` — ignorowane w runtime; usunięte), `HrlyPricingCalculator onNavigate` oczekuje `(tab: string) => void` (opakowane w `tab as PageRoute`). Zero zmian zachowania.

Do decyzji właściciela:
- Usunięcie „→” z tekstów CTA hero w `DEFAULT_CONFIG` (i w zapisanej konfiguracji CMS), żeby móc użyć ikony jak w headerze.
- Czy linki footera / nav-pills mają przejść na `Button ghost` (spójny system, ale poza zakresem 6 CTA).

---

## FAZA 4 — Kolor: reguła zamiast przypadku   [ZROBIONE Z ODSTĘPSTWAMI]

Zmienione pliki: `src/index.css` (tokeny + własny CSS na `var()`/`color-mix()`), `src/App.tsx` (header, menu, blok home, footer, wrapper modala), `src/components/HrlyHeroGraphic.tsx`, `src/components/HrlyDashboardPreview.tsx`. Podstrony, dialog demo (nieosiągalny) i fallback ładowania admina (App.tsx ~502) — poza zakresem, nietknięte.

### 4.1 Kontrast
- `10×` → fiolet (seria 58/10×/+23% w jednym kolorze); `01/02/03` (sekcja 02) → fiolet (seria; usuwa 3,88:1 na mobile); `✓` w hero, `+12% wzrostu`, `96.4% retencji`, „DANE LIVE” → `--color-success` `#047857` (5,5:1 na białym); `Wysokie` na ciemnej karcie → `--color-success-on-dark` `#34D399` (7,7:1 na `#241F59`); etykieta „Zaufanie w firmie” (`#6A5E8C` na navy = 2,5:1 — błąd, którego skrypt nie widział) → `on-dark-muted` (8,2:1).
- Karty z gradientem dostały pod gradientem jednolite tło z tokenu, więc skrypt mierzy realne tło („94%” = 14,8:1 zamiast fałszywego 1,04:1) — zero zmian wizualnych.
- Modal: ~40 błędów (`text-gray-400`, `#A39AB4` na navy, statusy emerald/amber/rose-600) → `muted-purple`/`on-dark-muted`, statusy na `success`/`warning-orange`/`danger-red` (+ tokeny `-soft` jako tła).
- Ikony (skrypt ich nie mierzy): `ChevronRight` w liście obszarów `#A39AB4` (2,7:1) → `muted-indigo`; pierścienie logo w footerze → `border-indigo` (9,4:1 na navy).

### 4.2 Reguła akcentu — co z brzoskwini ZOSTAJE (jeden akcent na sekcję, tylko na ciemnym)
| Miejsce | Uzasadnienie |
|---|---|
| Baner demo: ikona kursora w granatowym kółku | jedyny akcent sekcji, na navy, ikona nie tekst |
| Sekcja 03: ikona `Users` w ciemnej karcie | jedyny akcent sekcji, na navy; karta 1 jest celowo wyróżniona |
| Sekcja 05: span „11 obszarów” w `h2` (40 px, 8,5:1) | jedyny akcent sekcji |
| Sekcja 07: pill „07 · GOTOWI NA ZMIANĘ?” | jedyny akcent sekcji |
| Footer: wewnętrzny pierścień i kropka logo | znak firmowy = akcent footera |
| Modal: `92%` na ciemnym ribbonie | jedyny akcent ribbonu |
| Hero-mockup: pasek 94% na ciemnej karcie | akcent mockupu (ciemna karta) |
| Ring fokusu na `.section-dark`, `selection:` | funkcjonalne, nie treść |
Zamienione (wszystkie pozostałe, ~25 wystąpień): ikona `Sparkles` w badge hero, poświaty/bloby (`bg-[#F4A574]/x` → `primary-light`), numerały serii, etykieta „Metodologia…” i 11 ikon + `↳` w marquee (→ `on-dark-muted`), hover border kart, blob i border sekcji 07, `✓`×3 w 07, nagłówki kolumn footera, `hover:text-[#F4A574]` na linkach footera (→ biały + podkreślenie), ikony na jasnych kartach modala (→ fiolet), linia EKG w mockupie (jasna karta → fiolet; drugi szereg `muted-indigo`).

### 4.3 Tokeny (`@theme`, 36 tokenów koloru)
Dodane: `muted-indigo #6A5E8C`, `navy-deep #1D2254`, `navy-card-from/to #241F59/#120E37`, `on-dark-body` (= `primary-light`), `on-dark-muted` (= `border-indigo`), `success #047857` (zmiana nazwy z `success-green`, 0 użyć), `success-on-dark #34D399`, `warning-soft #FEF3C7`, `danger-soft #FEE2E2`, `accent-rose #FF5A79` (ikona serca w mockupie). Usunięte z zakresu: `#00E5A3`, `#10B981`, `#8A82C7`, `#C4672D`, `#A5ADC6`, `#E2E8F0/#CBD5E1`, wszystkie `gray-*/emerald-*/amber-*/rose-*/indigo-50`, inline `[#hex]`, `[rgba()]`, hexy w atrybutach SVG i w `index.css` (poza `@theme`).

### Wynik skryptu
```
1440×900:   BŁĘDY KONTRASTU (0)   KOLORY TEKSTU: #C4BBDE, #E3DEEE, #FBFAF8, #14183D, #55506E, #3B2F8C, #FFFFFF, #047857, #6A5E8C, #F4A574 (×2), #34D399 — wyłącznie tokeny
390×844:    BŁĘDY KONTRASTU (0)
1440+modal: BŁĘDY KONTRASTU (0)   (+ warning-orange #B45309, danger-red #B91C1C — tokeny statusów)
ROZMIARY/WAGI/NAGŁÓWKI/CTA: bez zmian od FAZY 3 (12–60 / 400–800 / h1=1 h2=7 h3=39 h4=0 / 40,48 / Inter)
rg hexów/domyślnej palety w HrlyHeroGraphic.tsx i HrlyDashboardPreview.tsx: 0; w App.tsx tylko poza zakresem (podstrony, dialog demo, fallback admina)
```
Lint i build czyste. Zrzuty 1440/390/modal: zmiany wyłącznie kolorów, wszystkie ikony widoczne.

Odstępstwa od planu i dlaczego:
1. Dodatkowe tokeny semantyczne `on-dark-body/-muted` jako aliasy `var()` (jedno źródło prawdy dla tekstu na navy) i `accent-rose` dla dekoracyjnej ikony serca (alternatywa: trzecia brzoskwinia w mockupie).
2. Statusy modala na istniejących `warning-orange`/`danger-red` (700-level, ciemniejsze niż amber/rose-500) zamiast nowych `status-*` — paski i kropki statusów są przez to nieco ciemniejsze, spójne z tekstem.
3. Linia EKG w mockupie: spec dopuszczał brzoskwinię, ale karta jest jasna — reguła 4.2 zastosowana dosłownie (fiolet); jedyny akcent mockupu to pasek 94% na ciemnej karcie.
4. `--color-success-green` przemianowany na `--color-success` (0 użyć klas przed zmianą).
5. Pierścienie logo w headerze (`primary-light`/`border-indigo` na białym, <3:1) — dekoracja znaku, bez zmian poza podmianą hexów na tokeny.

Do decyzji właściciela:
- Kropka legendy „Uznanie: 3.8” jest fioletowa, a linia EKG też — jeśli linia ma wrócić do brzoskwini (grafika, nie tekst), to jest jedna zmiana tokenu.
- `warning-orange #B45309` na `warning-soft` = 4,51:1 (przechodzi bez zapasu); opcjonalnie `#9A3412` (6,0:1).
- Hover linków footera zmienił się z brzoskwini na biały + podkreślenie (skutek reguły akcentu).

---

## FAZA 5 — Bugi wizualne   [ZROBIONE Z ODSTĘPSTWAMI]

Zmienione pliki: `src/App.tsx` (blok home), `src/index.css` (blok `prefers-reduced-motion`), nowy `src/components/SectionLabel.tsx`. Podstrony, modal demo, header i footer — poza zakresem, nietknięte.

### 5.1 Nagłówek w złym kroju
- `h2` sekcji „Badanie 11 obszarów…”: `font-sans` → `font-display` (jedyny nagłówek sekcji w Inter).
- Audyt wszystkich nagłówków bloku home: `h1` (1) i `h2` (7) miały już `font-display`; `h3` były niespójne — 3 karty sekcji 03 bez jawnego kroju (dziedziczyły Inter), 3 karty sekcji 04, 4 atrybuty i 11 (×2) kart marquee w sekcji 06 miały `font-sans`. Wszystkie 47 nagłówków bloku home są teraz w Plus Jakarta Sans (weryfikacja: zrzut computed style, `NAGŁÓWKI NIE-DISPLAY: brak`).

### 5.2 Maska ucinająca treść
- Obie nakładki `marquee-fade` (gradient navy→transparent, `h-24`) **usunięte z DOM**; z `index.css` znikła klasa `.marquee-fade` z bloku `prefers-reduced-motion` (został `.marquee-dup`).
- Zamiast wygaszania: twarde cięcie krawędzią `overflow-hidden` + `rounded-2xl` na `.marquee-viewport`. Przy ciągłym przewijaniu każda nakładka (i `mask-image`) prędzej czy później wygasza tekst, więc jedyne rozwiązanie spełniające „żadne słowo nie jest półprzezroczyste” to ostry klip.
- Weryfikacja: `mask-image` w `main` = 0, elementy tekstowe z `opacity` < 1 = 0, nakładki gradientowe w viewporcie marquee = 0; pod `prefers-reduced-motion` pełna, statyczna lista 11 kart (m.in. „…= +76% lojalności.” w całości nieprzezroczyste).

### 5.3 Cztery identyczne ikony (sekcja „Co otrzymujesz”)
`CheckCircle2` ×4 → `Zap` (Raporty w kilka minut), `Compass` (Plan naprawczy), `Users2` (Kontekst zespołów), `Award` (Wsparcie liderów). Wszystkie cztery były już importowane z `lucide-react` — zero nowych zależności. Ten sam kontener, rozmiar (16 px) i kolor (`text-indigo-primary`).

### 5.4 Numeracja sekcji + komponent `SectionLabel`
- Nowy `src/components/SectionLabel.tsx`: pill `inline-flex items-center gap-2 rounded-full px-3 py-1.5 type-label font-mono uppercase`, numer jest własnością komponentu (`{number} · {children}`), opcjonalna ikona 14 px, dwa tony — `light` (`bg-primary-light/60 text-indigo-primary border-border-indigo/35`) i `dark` (`bg-white/10 text-white border-white/15`).
- Numeracja bez dziur: **01** hero (tekst z CMS `hero.badge`; helper `stripSectionNumber` zdejmuje prefiks „NN · ”, żeby numer nie dublował się przy zmianie treści w CMS) → **02** Pulpit demonstracyjny → **03** Od wyniku do działania → **04** Wyzwania, które rozwiązujemy → **05** Co otrzymujesz → **06** Metodologia badania satysfakcji i eNPS → **07** Jak to działa → **08** Gotowi na zmianę?. Komentarze sekcji w kodzie zaktualizowane do nowych numerów.
- Trzy dotychczasowe style etykiet (pill + mono, pill + sans-bold z `shadow-xs`, goły mono na ciemnym) zastąpione jednym komponentem. Etykiety wewnątrz kart („Kluczowy wyróżnik”, „Naukowa struktura”) nie są etykietami sekcji — bez zmian.

### Wynik skryptu
```
1440×900:  ROZMIARY 12,14,16,18,20,40,60 | WAGI 400,600,700,800 | KROJE Plus Jakarta Sans|Inter|JetBrains Mono
           NAGŁÓWKI h1=1 h2=7 h3=39 h4=0 | CTA 34,36,38,40,48 / 0px,8px,12px / Inter | BŁĘDY KONTRASTU (0)
390×844:   BŁĘDY KONTRASTU (0), scrollWidth = 390 (żadna etykieta nie wychodzi poza viewport)
8 etykiet: 2 unikalne style (jasny/ciemny), wszystkie JetBrains Mono 12/600, ls 0.96px, padding 6/12, wysokość 31 px
```
Wszystko identyczne z FAZĄ 4 poza `KOLORY TEKSTU`: brzoskwinia ×2 → ×1 (patrz odstępstwo 1). Lint i build czyste.

### Odstępstwa od planu i dlaczego
1. **Pill sekcji 08 („Gotowi na zmianę?”) stracił brzoskwinię** — FAZA 4 zapisała go jako „jedyny akcent sekcji 07”, ale 5.4 wymaga jednego tła dla wszystkich ciemnych etykiet. Wygrała reguła FAZY 5; akcentem tej sekcji zostaje sam CTA. Do decyzji właściciela: przywrócić brzoskwinię jako trzeci ton `SectionLabel` (`tone="accent"`) albo zostawić.
2. **Etykieta hero straciła `shadow-xs` i zmieniła krój na mono** — konsekwencja jednego stylu dla ośmiu etykiet (wcześniej Inter + cień).
3. **Ujednolicenie `h3` w górę zakresu 5.1** — spec wymagał tylko `h2`; opisany w 5.1 audyt pokazał 21 `h3` w Inter przy 18 w Plus Jakarta Sans, więc wszystkie `h3` bloku home poszły na `font-display` (spójność serii kart).
4. **Marquee tnie kartę w połowie wiersza** — świadomy skutek 5.2 (ostry klip zamiast wygaszania). Alternatywa (nakładki ≤ 16 px) nie działa przy przewijaniu ciągłym, a `mask-image` daje tę samą półprzezroczystość.
5. **`stripSectionNumber` jako helper w `App.tsx`** — `hero.badge` przychodzi z CMS z własnym „01 · ”; bez zdejmowania prefiksu numer dublowałby się („01 · 01 · …”).

Do decyzji właściciela:
- Czy `hero.badge` w CMS ma stracić prefiks „01 · ” (wtedy helper można usunąć).
- Ton akcentowy dla etykiety sekcji 08 (odstępstwo 1).

---

## FAZA 6 — Hero   [ZROBIONE Z ODSTĘPSTWAMI]

Zmienione pliki: `src/components/HrlyHeroGraphic.tsx`, `src/index.css` (usunięty keyframe `travelDotAnim` + `.traveling-dot`). Hero w `App.tsx` bez zmian.

### 6.1 Czas animacji wejścia — bez zmian (pomiar)
Probe `hero-timing.js` (próbkowanie opacity od `navigationStart`): wszystkie 15 elementów hero (badge, h1, lead, CTA, pasek zaufania, teksty mockupu, statystyki) osiągają opacity 1 w **360 ms** (load + 339 ms), stagger **1 ms**. Jedyne wejście to wrapper strony (`motion.div`, 0,3 s). Poniżej progu 400 ms, więc nie ruszane. Margines ~40 ms; „3 sekundy” z briefu lokalnie nie występują — to czas ładowania JS/fontów na produkcji (osobne zadanie: preload fontów / krytyczny CSS).

### 6.2 Rotacja
- Karta główna: `rotateX(38deg) rotateZ(-20deg)` → `rotateX(14deg) rotateZ(0deg)` (perspektywa i pływanie w Z zostają).
- Obie karty z liczbami („Zaufanie w firmie 94%”, „Retencja kadry 96.4%”) przeniesione poza bryłę 3D do płaskiej nakładki (`absolute inset-0` w `.isometric-container`), własne pływanie x/y.
- Pomiar `hero-angles.js` (kąt z realnych rectów + kontrola macierzowa): przed 14,2–17,2° na każdym tekście; po **0,00° dla wszystkich 21 elementów** (1440 i 390). Wymóg: etykiety ≤ 3°, liczby 0° — spełniony z zapasem.

### 6.3 Gęstość danych — w istniejącym SVG (STOP nie był potrzebny)
Ten sam `<svg>` w `HrlyHeroGraphic.tsx`: `SERIES_A` (zaangażowanie, 12 punktów 58→84) i `SERIES_B` (eNPS, 62→74), ścieżki liczone helperami `px()/py()`; 12 kropek + wyróżniony ostatni pomiar; 3 linie siatki + oś bazowa; oś Y (60/70/80); oś X co drugi miesiąc (Sty/Mar/Maj/Lip/Wrz/Lis); `role="img"` + `aria-label`. `viewBox 236×128` = wnętrze panelu na 390 px, `preserveAspectRatio` domyślne → skala 1:1 na 1440 i 390, etykiety osi to `type-label font-mono text-muted-purple` = **12 px renderowane**, 7,4:1. Panel wykresu 115 → 150 px (karta bez zmian wysokości). Fale „live” (`pulse-wave-1/2`) zostały na serii A; pod reduce-motion pełna linia. Zero bibliotek, zero nowych plików.

### 6.4 Re-animacja
Brak `whileInView`; po przewinięciu do 4000 px i powrocie hero pełne, `getAnimations()` bez nowych wejść.

### Wynik skryptu
```
1440: ROZMIARY 12, 14, 16, 18, 20, 40, 60   WAGI 400, 600, 700, 800   NAGŁÓWKI h1=1 h2=7 h3=39 h4=0   CTA 40/48 Inter   BŁĘDY KONTRASTU (0)
390:  ROZMIARY 12, 14, 15, 16, 18, 20, 28, 36   BŁĘDY KONTRASTU (0)   scrollWidth = 390
```
Lint i build czyste. Recenzja: akceptacja PASS (0 uwag); regresja — bloker (karty pływające po wyjęciu z bryły 3D ucinały się poniżej ~385 px) naprawiony płynnym odsunięciem `clamp(-8px, calc(185px - 50vw), 24px)` poniżej 640 px + korekta 1–4 px na 1024–1029 px; runda 2: PASS.

Odstępstwa od planu i dlaczego:
1. `rotateZ` = 0° zamiast −3° ze spec: kontr-rotacja wiersza „Uznanie / +12%” wewnątrz przechylonej karty dawałaby widoczny zbieg; wyzerowanie całej karty daje 0° wszędzie.
2. Usunięta „podróżująca kropka” (`travelDotAnim`) — przy 12 kropkach danych była szumem; spec mówił „zostaw”, ale sens (sygnał „live”) niosą fale.
3. Badge „Preview” jest teraz w całości widoczny na 390 (kompromis z FAZY 2 przestał być potrzebny).
4. Na 320–640 px karta „Zaufanie” styka się z linią etykiety „Kondycja zespołu” (~3 px nakładania bboxów, bez kolizji glifów) — minor z recenzji, do ewentualnej korekty offsetu.

Do decyzji właściciela:
- Produkcja: preload fontów / krytyczny CSS, jeśli „puste prostokąty przez 3 s” z briefu nadal występują na hrly.pl (lokalnie hero jest pełne po 360 ms).
- `h1` 60 px na 1024–1279 px łamie się na 4 linie — poza bramką 1440/390; ewentualnie `lg:text-[52px]` jako krok pośredni (to byłby nowy rozmiar poza skalą — wymaga decyzji).

---

## FAZA 7 — Social proof (szkielet)   [ZROBIONE — STOP NA TREŚCI]

Zmienione pliki: `src/components/SocialProof.tsx` (nowy), `src/App.tsx` (import + zakomentowane użycie między hero a sekcją „02 · Pulpit demonstracyjny”, z instrukcją przenumerowania 02→03 … 08→09 po włączeniu).

### Komponent
SocialProof — src/components/SocialProof.tsx

Typy eksportowane:
- SocialProofLogo = { name: string; src?: string; svg?: React.ReactNode }
  `name` wymagana zawsze: idzie do `alt` (przy `src`) albo do `sr-only` (przy `svg`). Gdy brak i `src`, i `svg` — renderuje się sama nazwa jako tekst (mono, uppercase, `text-muted-indigo`, BEZ wygaszenia, żeby nie zbić kontrastu).
- SocialProofQuote = { text, author, role, company, avatarSrc? } — wszystkie string; `avatarSrc` opcjonalny (obraz dekoracyjny, `alt=""`, autor jest w `<figcaption>`).
- SocialProofMetric = { value: string; label: string; source?: string } — `source` renderowany DOSŁOWNIE, bez doklejania „Źródło:”; pełną formę zapisuje właściciel.
- SocialProofProps = { number: string; label?: string (domyślnie "Zaufali nam"); tone?: 'light' | 'dark'; logos?: SocialProofLogo[]; quote?: SocialProofQuote; metric?: SocialProofMetric; className?: string (tylko layout); headingId?: string (domyślnie "social-proof-heading") }

Zachowanie:
- Zwraca `null`, gdy `logos.length === 0 && !quote && !metric` — nic nie trafia do DOM.
- Struktura: `<section aria-labelledby>` → `<h2 id>` z `<SectionLabel number tone>` → `<ul>` logotypów (`flex flex-wrap justify-center gap-x-10 gap-y-6`) → `<figure>` z `<blockquote>` + `<figcaption>` w karcie `bg-neutral-surface border border-border-soft rounded-3xl p-8` → blok metryki (`type-h2 font-mono text-indigo-primary` + `type-label` + opcjonalny przypis `type-body-sm text-muted-purple`).
- Tło sekcji: `bg-neutral-bg border border-border-soft/80 rounded-[32px] p-8 sm:p-12` — czyli ta sama geometria co sąsiednie sekcje, ale bez białego wypełnienia, żeby biała karta cytatu miała kontrast.
- Zero CTA (zgodnie ze spec), zero nowych zależności, zero hexów.

Użycie w App.tsx (linia 770, zakomentowane):
{/* <SocialProof number="02" logos={[]} quote={undefined} metric={undefined} /> */}

### Treści, których potrzebuję od właściciela (STOP)
Treści, które musi dostarczyć właściciel, żeby sekcję dało się włączyć:

1. LOGOTYPY KLIENTÓW — 4–6 sztuk.
   - Dla każdego: nazwa firmy (`name`, trafia do `alt`) + plik SVG jednokolorowy/monochromatyczny (`src`) albo SVG inline (`svg`).
   - Wysokość renderowania 32 px, więc logo musi być czytelne w tej skali i mieć przezroczyste tło.
   - WYMAGANA pisemna zgoda każdego klienta na użycie znaku towarowego na stronie (zwykle klauzula „referencje/logo” w umowie albo osobna zgoda mailowa).
   - Jeśli logotypów nie ma, alternatywa: same nazwy firm (komponent renderuje wtedy tekst) — nadal wymaga zgody.

2. CYTAT — dokładnie jeden.
   - `text` — treść wypowiedzi (1–3 zdania, ~150–280 znaków czyta się najlepiej w tej karcie),
   - `author` — imię i nazwisko,
   - `role` — stanowisko,
   - `company` — firma,
   - `avatarSrc` — opcjonalne zdjęcie (kwadrat, min. 80×80 px),
   - zgoda osoby na publikację imienia, stanowiska, firmy i (jeśli jest) wizerunku — RODO, nie tylko grzeczność.

3. LICZBA (metryka) — jedna.
   - `value` (np. liczba wdrożeń / przebadanych pracowników / firm korzystających),
   - `label` (co ta liczba oznacza),
   - `source` — przypis ze źródłem w pełnym brzmieniu, np. „Dane wewnętrzne HRly, IV kw. 2025” albo „Badanie X, N=…, 2025”. Bez źródła liczba jest kolejnym twierdzeniem bez pokrycia i lepiej jej nie pokazywać.

4. DECYZJA O NUMERACJI — patrz komentarz w App.tsx: włączenie sekcji przesuwa etykiety 02→03, 03→04, 04→05, 05→06, 06→07, 07→08, 08→09 (hero 01 bez zmian). To jedyna zmiana copy, jakiej sekcja wymaga, i celowo NIE została wykonana z góry.

Czego NIE zrobiłem świadomie (STOP): nie wymyśliłem ani jednej nazwy firmy, cytatu, stanowiska ani placeholderowego logotypu. Puste propsy = pusty DOM.

### Inwentarz liczb i twierdzeń w copy strony głównej (do decyzji: przypis ze źródłem / zmiana / usunięcie)
INWENTARZ LICZB I TWIERDZEŃ NA STRONIE GŁÓWNEJ (do decyzji: które wymagają przypisu ze źródłem).
Ścieżki bezwzględne skrócone do repo-relative dla czytelności; wszystkie pliki w /Users/jakubzacios/dev/personal/HRLY-STRONA-2.0/.

═══ A. HERO (sekcja 01) — src/App.tsx + src/hooks/useSiteConfig.ts ═══
Kafle statystyk (wartości domyślne w kodzie, nadpisywalne z CMS):
- src/App.tsx:745 — „58” + src/App.tsx:746 „Analizowanych czynników”  [CMS: src/hooks/useSiteConfig.ts:180-181 stat1Value '58' / stat1Label 'Analizowanych czynników HR']
- src/App.tsx:749 — „10×” + src/App.tsx:750 „Szybsze raportowanie”  [CMS: src/hooks/useSiteConfig.ts:182-183 stat2Value '10×']  ← 10× WZGLĘDEM CZEGO? twierdzenie porównawcze, wymaga bazy odniesienia
- src/App.tsx:753 — „+23%” + src/App.tsx:754 „Wzrost zaangażowania”  [CMS: src/hooks/useSiteConfig.ts:184-185 stat3Value '+23%']  ← twierdzenie o EFEKCIE produktu, najwyższe ryzyko: wymaga badania/case study albo usunięcia
Pasek zaufania pod CTA:
- src/App.tsx:726 — „14 dni testu bez karty”  (warunek handlowy — nie źródło, ale musi się zgadzać z regulaminem/cennikiem)
- src/App.tsx:734 — „Wdrożenie w 15 minut”  ← twierdzenie o czasie, weryfikowalne u klienta
- src/App.tsx:728 — „Pełna zgodność z RODO”  ← nie liczba, ale twierdzenie prawne; warto podeprzeć polityką prywatności / DPA
Copy hero (CMS):
- src/hooks/useSiteConfig.ts:172 — subheadline: „W kilka minut przetwarza dane…”
- src/App.tsx:707 — fallback subheadline: „…w kilka minut.”

═══ B. GRAFIKA HERO (mockup produktu) — src/components/HrlyHeroGraphic.tsx ═══
Liczby renderowane jako dane demonstracyjne w podglądzie produktu:
- src/components/HrlyHeroGraphic.tsx:294 — „94%” (karta „Zaufanie w firmie”), pasek postępu w:298 („w-[94%]”)
- src/components/HrlyHeroGraphic.tsx:324 — „96.4% retencji” (karta „Retencja kadry”)
- src/components/HrlyHeroGraphic.tsx:214 — „Uznanie: 3.8”
- src/components/HrlyHeroGraphic.tsx:217 — „+12% wzrostu”
- src/components/HrlyHeroGraphic.tsx:9 — SERIES_A [58…84] (wykres „zaangażowanie”, 12 miesięcy)
- src/components/HrlyHeroGraphic.tsx:10 — SERIES_B [62…74] (wykres „eNPS”)
- src/components/HrlyHeroGraphic.tsx:12 — Y_TICKS [60, 70, 80] (etykiety osi Y wykresu)
UWAGA: to dane fikcyjne w mockupie. Jest badge „Preview” (src/components/HrlyHeroGraphic.tsx:259), ale nie ma jawnego podpisu „dane przykładowe”. DECYZJA: dopisać podpis „dane demonstracyjne” albo zostawić na badge’u.

═══ C. SEKCJA 02 — Pulpit demonstracyjny — src/App.tsx ═══
- src/App.tsx:781 — „diagnozujemy 58 czynników zaangażowania”  ← ta sama liczba co kafel hero; wymaga listy/metodologii do wglądu

═══ D. SEKCJA 04 — Wyzwania, które rozwiązujemy — src/App.tsx ═══
- src/App.tsx:882 — „Wypalenie i rotacja talentów kosztuje firmy średnio 240 000 zł rocznie.”  ← NAJMOCNIEJSZE twierdzenie liczbowe na stronie, bez źródła. Wymaga: badania (jakiego rynku? jakiej wielkości firmy? per firma czy per pracownik?) albo przeformułowania.
- src/App.tsx:895 — „Działy HR marnują tygodnie…”, „wskaźników ROI”  (ilościowe, choć bez liczby)
- src/App.tsx:908 — „rozmowami 1-on-1”  (nazwa formatu, nie twierdzenie)

═══ E. SEKCJA 05 — Co otrzymujesz — src/App.tsx ═══
- src/App.tsx:942 — „Raporty w kilka minut”  ← twierdzenie o czasie
- src/App.tsx:944-945 — „1-on-1” (nazwa formatu)

═══ F. SEKCJA 06 — Metodologia / marquee — src/App.tsx (lewa kolumna) ═══
- src/App.tsx:977 — „HRly bada 58 precyzyjnie dobranych czynników”  ← trzecie wystąpienie „58”
- src/App.tsx:988 — „Metodologia oparta o standardy psychologii pracy, eNPS oraz kluczowe mierniki zaangażowania Gallupa.”  ← NAJWIĘKSZE RYZYKO PRAWNE: powołanie się na cudzą, chronioną metodologię (Gallup Q12®) i cudzy znak towarowy. Wymaga albo licencji/zgody, albo przeformułowania na „inspirowane publicznie dostępnymi badaniami” + link do źródła.
- src/App.tsx:1015 — „uruchomisz w mniej niż minutę”  ← twierdzenie o czasie
- src/App.tsx:964 — komentarz sekcji „11 obszarów” (patrz src/App.tsx:1091 — „11 kluczowych obszarów” w copy)

═══ G. SEKCJA 06 — KARTY MARQUEE (11 kart, każda z twierdzeniem statystycznym) ═══
Wszystkie w jednej funkcji src/App.tsx:361-377 (`getScreenshotImpactText`), renderowane w src/App.tsx:1063. ŻADNA nie ma źródła — to najgęstszy blok niepodpartych liczb na stronie:
- src/App.tsx:363 — „Konkurencyjne wynagrodzenie obniża rotację o 43% i zwiększa produktywność o 25%.”
- src/App.tsx:364 — „Jasność celów podnosi wydajność o 56%. Pracownicy widzący wpływ są 3,5× bardziej zaangażowani.”
- src/App.tsx:365 — „87% pracowników uznaje, że pochwała wpływa na satysfakcję. Uznanie zmniejsza rotację o 30%.”
- src/App.tsx:366 — „72% firm z nowoczesnymi technologiami raportuje wzrost produktywności. $1 zainwestowany = $4 zwrotu.”
- src/App.tsx:367 — „Zaufanie = 76% wyższe zaangażowanie. Silna kultura = 40% wyższa retencja.”
- src/App.tsx:368 — „Elastyczność obniża stres o 20%, a work-life balance obniża absencję o 75%.”
- src/App.tsx:369 — „90% osób uważa, że szkolenia zwiększają zaangażowanie. Jasna ścieżka = +76% lojalności.”
- src/App.tsx:370 — „Zaufanie do organizacji = 17% wyższa produktywność i 21% większa rentowność.”
- src/App.tsx:371 — „Optymalne obciążenie = 25% wyższa produktywność. Wysoka presja to główny czynnik wypalenia.”
- src/App.tsx:372 — „Efektywna komunikacja = 147% wyższy poziom zaangażowania pracowników.”
- src/App.tsx:373 — „Autonomia jest jednym z najsilniejszych predyktorów zaangażowania i satysfakcji.” (jedyna bez liczby)
REKOMENDACJA: albo jeden wspólny przypis pod marquee („Źródła: …” z listą badań), albo przypis per karta, albo usunięcie liczb. Karty są duplikowane w pętli (src/App.tsx:1036), więc każde twierdzenie pojawia się w DOM dwa razy (drugi egzemplarz ma `aria-hidden`).

═══ H. SEKCJA 07 — Jak to działa — src/App.tsx ═══
- src/App.tsx:1084 — „w 3 prostych krokach” (opis produktu, nie twierdzenie o rynku)
- src/App.tsx:1090 — „roześlij go w kilka sekund”  ← twierdzenie o czasie
- src/App.tsx:1091 — „grupuje je w 11 kluczowych obszarów”  ← spójne z metodologią; wymaga listy obszarów (jest w RESEARCH_AREAS)
- src/App.tsx:1090 — „kwestionariusz Pulse-Check zaprojektowany przez psychologów pracy”  ← twierdzenie o autorstwie: kto konkretnie? wymaga nazwisk/afiliacji albo złagodzenia

═══ I. SEKCJA 08 — CTA końcowe — src/App.tsx ═══
- src/App.tsx:1120 — „Zbuduj zaangażowany zespół w 15 minut.”  ← powtórka twierdzenia o czasie z hero
- src/App.tsx:1136 — „14 dni testu bez zobowiązań”  (warunek handlowy; spójny z src/App.tsx:726)

═══ J. DANE W KODZIE, KTÓRE NIE RENDERUJĄ SIĘ NA HOME (ale są w bundlu) ═══
`RESEARCH_AREAS` (src/App.tsx:33-342) zawiera dla każdego z 11 obszarów pola `states.niski|sredni|wysoki` z twardymi kwotami i procentami, m.in.:
- src/App.tsx:41-42 — „+45% ryzyka odejść”, „-240 000 zł strat / rok”
- src/App.tsx:52-53 — „–43% redukcji rotacji”, „+180 000 zł oszczędności”
… i analogiczne pary dla obszarów 02-11.
Na stronie głównej z tego obiektu renderują się TYLKO `area.title` (src/App.tsx:1057) i `getScreenshotImpactText(area.num)` (src/App.tsx:1063); `states`, `financial`, `metricValue`, `factors`, `action` nie są używane nigdzie w App.tsx (na zakładce „Funkcje” renderuje się jedynie `area.question`, src/App.tsx:1416). To martwe dane — jeśli wrócą do widoku, wchodzą do tej samej kolejki „liczba wymaga źródła”.

═══ PODSUMOWANIE PRIORYTETÓW (moja rekomendacja) ═══
1. Wysoki priorytet (twierdzenia o cudzych badaniach / rynku, bez źródła): src/App.tsx:882 (240 000 zł), src/App.tsx:988 (Gallup), cały blok src/App.tsx:363-372 (11 kart marquee).
2. Średni (twierdzenia o efekcie własnego produktu): src/App.tsx:753 / useSiteConfig.ts:184 (+23%), src/App.tsx:749 / useSiteConfig.ts:182 (10×).
3. Niski (weryfikowalne u siebie, wystarczy spójność z ofertą): 58 czynników (src/App.tsx:745, 781, 977), 11 obszarów (src/App.tsx:1091), 15 minut (src/App.tsx:734, 1120), 14 dni (src/App.tsx:726, 1136), „kilka minut/sekund/mniej niż minutę” (src/App.tsx:707, 942, 1015, 1090).
4. Do oznaczenia jako dane przykładowe: mockup hero (src/components/HrlyHeroGraphic.tsx:9, 10, 12, 214, 217, 294, 324).

### Wynik skryptu
Identyczny z FAZĄ 6 (komponent nic nie renderuje bez treści): 1440 — rozmiary 12–60, wagi 400–800, h1=1 h2=7 h3=39 h4=0, CTA 40/48 Inter, BŁĘDY KONTRASTU 0, wysokość strony 5823 px; 390 — 0 błędów. Lint i build czyste.

Odstępstwa od planu i dlaczego: 1. Warunek stanu pustego rozszerzony o `metric`. Spec mówi: `null` gdy `logos.length === 0 && !quote`. Zaimplementowałem `null` gdy `!hasLogos && !quote && !metric` — inaczej sekcja z samą liczbą wdrożeń (dopuszczoną przez spec jako osobny prop) nie dałaby się pokazać. To nadzbiór warunku ze spec: w scenariuszu ze spec (brak logotypów, brak cytatu, brak metryki) zachowanie jest identyczne.

2. Nazwa sekcji dla czytnika ekranu: `SectionLabel` renderuje `<span>`, więc żeby mieć `aria-labelledby` bez duplikowania treści (ukryty nagłówek + widoczny pill = tekst czytany dwa razy) opakowałem etykietę w `<h2 id={headingId}>`. Nagłówek nie ma własnej typografii (preflight Tailwinda), więc pill wygląda tak samo jak w pozostałych sekcjach. Skutek uboczny do świadomości: po włączeniu sekcji skrypt pokaże h2=8 zamiast 7.

3. Treść etykiety jako prop z domyślną wartością „Zaufali nam” (tekst wprost ze spec FAZY 7), a nie hardkod — właściciel może ją zmienić bez dotykania komponentu. Nie jest to zmiana istniejącego copy: dopóki sekcja jest wyłączona, tekst nigdzie się nie renderuje.

4. `metric.source` renderuję dosłownie, bez doklejania prefiksu „Źródło:”. Doklejenie prefiksu byłoby wymyślaniem copy; pełne brzmienie przypisu zapisuje właściciel.

5. Import `SocialProof` w App.tsx zostaje mimo zakomentowanego użycia — dzięki temu `npm run lint` (tsc) sprawdza komponent i nie zgnije on cicho. `tsconfig.json` nie ma `noUnusedLocals`, więc lint jest czysty, a Vite wycina martwy import z bundl
