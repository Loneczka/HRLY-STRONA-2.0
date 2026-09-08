# hrly.pl — postęp naprawy systemu wizualnego

Plik prowadzony przez agenta zgodnie z `docs/design-fixes.md` (PROTOKÓŁ WYKONANIA).
Weryfikacja: `npm run lint` (tsc --noEmit), `npm run build`, SKRYPT WERYFIKACYJNY na `http://localhost:3100/` (port 3000 był zajęty przez inny projekt) przy 1440×900, headless Chrome przez CDP + podgląd 390×844.

Lista zadań:
- [x] FAZA 0 — Rekonesans i baseline
- [ ] FAZA 1 — Blokery dostępności
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
