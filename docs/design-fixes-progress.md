# hrly.pl — postęp naprawy systemu wizualnego

Plik prowadzony przez agenta zgodnie z `docs/design-fixes.md` (PROTOKÓŁ WYKONANIA).
Weryfikacja: `npm run lint` (tsc --noEmit), `npm run build`, SKRYPT WERYFIKACYJNY na `http://localhost:3100/` (port 3000 był zajęty przez inny projekt) przy 1440×900, headless Chrome przez CDP + podgląd 390×844.

Lista zadań:
- [x] FAZA 0 — Rekonesans i baseline
- [x] FAZA 1 — Blokery dostępności
- [ ] FAZA 2 — Jedna skala typograficzna
- [ ] FAZA 3 — Jeden komponent przycisku (STOP 3.2)
- [ ] FAZA 4 — Kolor: reguła zamiast przypadku
- [ ] FAZA 5 — Bugi wizualne
- [ ] FAZA 6 — Hero (STOP 6.3 warunkowy)
- [ ] FAZA 7 — Social proof (STOP na treści)

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
