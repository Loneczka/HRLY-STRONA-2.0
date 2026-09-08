# hrly.pl — naprawa systemu wizualnego (zadanie samosterujące)

## JAK TO ODPALIĆ

Wrzuć ten plik do repo jako `docs/design-fixes.md`, a agentowi wklej dokładnie to:

> Przeczytaj `docs/design-fixes.md` i wykonaj całość zgodnie z opisanym tam PROTOKOŁEM WYKONANIA. Prowadź się sam przez kolejne fazy, nie pytaj mnie o zgodę na przejście dalej — zatrzymaj się tylko w punktach oznaczonych jako STOP.

Wszystko poniżej jest instrukcją dla agenta.

---

# PROTOKÓŁ WYKONANIA

Jesteś senior frontend developerem pracującym w tym repo. Naprawiasz **system wizualny** strony głównej hrly.pl — nie treść, nie architekturę, nie backend.

Prowadzisz się przez to zadanie **sam**. Nie czekasz na potwierdzenie między fazami. Zatrzymujesz się wyłącznie w miejscach oznaczonych **STOP** (pełna lista na końcu tej sekcji).

## Pętla, którą wykonujesz

Zanim cokolwiek zrobisz, załóż listę zadań (TodoWrite lub odpowiednik) z **ośmioma** pozycjami: FAZA 0 … FAZA 7. Potem, dla każdej fazy po kolei:

1. **Oznacz fazę jako `in_progress`.**
2. Przeczytaj jej sekcję w tym dokumencie w całości, zanim ruszysz kod.
3. Wykonaj zadania fazy.
4. **Bramka jakości** — wszystkie cztery muszą przejść:
   - `build` przechodzi bez błędów,
   - `lint` czysty (zero nowych ostrzeżeń względem stanu sprzed fazy),
   - **SKRYPT WERYFIKACYJNY** (koniec dokumentu) uruchomiony na `localhost` przy szerokości 1440px, wynik zgodny z „wartościami docelowymi" dla tej fazy,
   - wizualnie: porównaj z poprzednim stanem na 1440px i 390px — nic się nie rozjechało poza zmianami zamierzonymi w tej fazie.
5. Jeśli bramka nie przechodzi → **napraw w tej samej fazie.** Nie przechodzisz dalej z zepsutą bramką i nie „obejdziesz" jej przez cofnięcie zmiany, którą faza właśnie wprowadziła (np. nie zmniejszasz z powrotem fontu, żeby układ się zgadzał).
6. **Commit** — jeden na fazę, wiadomość w formacie:
   `design(faza-N): <krótki opis>` + w treści lista zmienionych zachowań i wynik skryptu.
7. **Dopisz wpis do `docs/design-fixes-progress.md`** (utwórz plik przy FAZIE 0) w formacie:
   ```
   ## FAZA N — <nazwa>   [ZROBIONE | ZROBIONE Z ODSTĘPSTWEM | ZABLOKOWANE]
   Zmienione pliki: ...
   Wynik skryptu: ...
   Odstępstwa od planu i dlaczego: ...
   Do decyzji właściciela: ...
   ```
8. **Oznacz fazę jako `completed`** i przejdź do następnej bez pytania.

Na koniec wszystkich faz: jedno zbiorcze podsumowanie — co zrobione, co zablokowane, co czeka na moje decyzje.

## Twarde zasady

1. **Nie zmieniasz treści tekstowej** (copy, nagłówki, opisy sekcji). Jedyny wyjątek: numery sekcji w FAZIE 5.4.
2. **Nie refaktoryzujesz poza zakresem fazy.** Nie przenosisz plików, nie zmieniasz routingu, nie ruszasz backendu.
3. **Nie dodajesz zależności.** Wszystko poniżej robi się w istniejącym Tailwindzie i CSS. Jeśli uważasz, że jakaś paczka jest niezbędna — to jest STOP.
4. **Nie mieszasz faz w jednym commicie.**
5. Jeśli plik/klasa/komponent opisany poniżej nie istnieje albo wygląda inaczej, niż zakładam: **znajdź ekwiwalent, zrób zadanie, opisz odstępstwo w pliku postępu.** Nie twórz nowych plików „na wszelki wypadek" i nie pomijaj zadania po cichu.
6. Jeśli coś nie da się zrobić bez zepsucia czegoś innego — oznacz fazę jako `ZABLOKOWANE`, opisz dlaczego, **przejdź do następnej fazy** i wróć do tego w podsumowaniu.
7. Nie zgadujesz w punktach STOP.

## Punkty STOP — tu i tylko tu przerywasz i pytasz

- **FAZA 3.2** — wybór jednego koloru primary (fiolet `#3B2F8C` vs brzoskwinia `#F4A574`). Podaj rekomendację z uzasadnieniem i czekaj.
- **FAZA 6.3** — jeśli poprawa mockupu w hero wymaga więcej niż podmiany danych w istniejącym SVG/komponencie.
- **FAZA 7** — treści do social proofu. Nie wymyślasz nazw firm ani cytatów.
- **Kiedykolwiek** — gdy uznasz, że potrzebna jest nowa zależność albo zmiana poza zakresem.

Poza tymi punktami: działasz.

---

# KONTEKST: zmierzony stan wyjściowy

Ustalone pomiarem w przeglądarce na produkcji (`https://hrly.pl/`, viewport 1470px). To są fakty, nie założenia — możesz na nich polegać przy szukaniu w kodzie.

- Stack: Tailwind (v4 — w computed styles widać domyślne `oklch()` obok własnych hexów), React/Next.
- Kroje: `Plus Jakarta Sans` (display), `Inter` (body), `JetBrains Mono` (etykiety).
- Breakpointy w CSS: tylko `(max-width: 768px)` i `(min-width: 769px)`, plus 42 klasy `sm: md: lg:`.
- Keyframes w projekcie: `float`, `pulse-glowing`, `grid-move`, `pulseWaveAnim`, `pulseWaveAnimAlt`, `travelDotAnim`, `marquee-scroll-up`, `spin`, `ping`, `pulse`, `bounce`.
- W DOM: 1×`h1`, 1×`h2`, 7×`h3`, 39×`h4`, 42×`svg`, 0×`img`.
- Paleta: `#14183D` navy, `#1D2254` indigo, `#3B2F8C` fiolet, `#F4A574` brzoskwinia, `#FBFAF8` off-white, `#55506E` / `#6A5E8C` muted, `#00E5A3` neon zielony (użyty raz).

---

# FAZA 0 — Rekonesans

**Nie edytujesz żadnego pliku.** Zbierasz fakty i zakładasz plik postępu.

```bash
# 1. Definicje tokenów / theme
rg -n "Plus Jakarta|JetBrains|--color|@theme|:root" --glob '!node_modules' -g '*.css' -g '*.ts' -g '*.js'
# 2. Wyłączone outline'y
rg -n "focus:outline-none|outline-none|outline:\s*none" --glob '!node_modules'
# 3. Animacje
rg -n "@keyframes|animation:|animate-\[" --glob '!node_modules'
# 4. Hardkodowane kolory marki
rg -n "#14183D|#1D2254|#3B2F8C|#F4A574|#FBFAF8|#55506E|#6A5E8C|#00E5A3" -i --glob '!node_modules'
# 5. Przyciski i CTA
rg -n "rounded-\[|rounded-full|rounded-xl|px-\d+ py-\d+" --glob '!node_modules' -g '*.tsx' -g '*.jsx'
# 6. Struktura nagłówków
rg -n "<h1|<h2|<h3|<h4" --glob '!node_modules' -g '*.tsx' -g '*.jsx'
# 7. Maski ucinające treść
rg -n "mask-image|maskImage|to-transparent|from-transparent" --glob '!node_modules'
```

**Do pliku postępu zapisz:**

- Ścieżkę do centralnego pliku tokenów (`globals.css` z `@theme`, `tailwind.config`, `tokens.ts`) — albo „brak, kolory są rozsiane po komponentach".
- Listę komponentów sekcji strony głównej **w kolejności występowania na stronie**.
- Czy istnieje współdzielony `Button`/`CTA` — ścieżka i propsy, albo „brak, każdy CTA jest inline".
- Ile jest osobnych definicji przycisku (licz każdy inline'owy `<a className="...px-...py-...">`).
- Wersję Tailwinda z `package.json`.
- Baseline ze SKRYPTU WERYFIKACYJNEGO uruchomionego **przed** jakąkolwiek zmianą.

Commit: `design(faza-0): rekonesans i baseline` (tylko plik postępu). Przejdź do FAZY 1.

---

# FAZA 1 — Blokery dostępności

Najwyższy priorytet, najniższy koszt.

## 1.1 Widoczny focus dla klawiatury

**Problem:** w kodzie jest `focus:outline-none`, a w całym arkuszu **zero reguł `:focus-visible`**. Nawigacja Tabem jest niewidoczna. Fail WCAG 2.4.7.

Dodaj w globalnym CSS:

```css
:where(a, button, [role="button"], input, select, textarea, summary, [tabindex]):focus-visible {
  outline: 2px solid var(--color-focus, #3B2F8C);
  outline-offset: 3px;
  border-radius: inherit;
}
.section-dark :where(a, button, [role="button"]):focus-visible {
  outline-color: #F4A574;
}
```

Usuń **wszystkie** `focus:outline-none` znalezione w FAZIE 0. Nazwę klasy dla ciemnych sekcji dobierz do tego, co realnie jest w repo — jeśli ciemne sekcje nie mają wspólnej klasy, dodaj ją (to jedyna dozwolona zmiana strukturalna w tej fazie).

**Akceptacja:** przejście Tabem przez całą stronę główną — każdy przystanek ma widoczny ring o kontraście ≥3:1 względem swojego tła, sprawdzone osobno na jasnej i ciemnej sekcji.

## 1.2 `prefers-reduced-motion`

**Problem:** 11 keyframe'ów, w tym nieskończony `marquee-scroll-up`, `float`, `pulse-glowing`, `grid-move`. Zero obsługi. Fail WCAG 2.2.2.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Dodatkowo: marquee (lista 11 obszarów) ma przy `reduce` **zatrzymać się w pozycji początkowej i pokazać pełną listę statycznie**, nie zniknąć. Lista jest w DOM zdublowana pod animację — sprawdź, czy przy `reduce` nie widać podwójnej treści; jeśli tak, ukryj duplikat (`aria-hidden` + `hidden`) w tym media query.

**Akceptacja:** przy włączonym „Reduce motion" nic się nie porusza, cała treść jest widoczna i czytelna.

## 1.3 Struktura nagłówków

**Problem:** `h1` to logo „hrly" (20px). Nagłówek hero jest `h2`. Potem 7×`h3` i 39×`h4`. Dla czytników ekranu i SEO ta strona nie ma tematu.

- Logo → `<a>` z `<span>`/`<div>` w środku, nie `h1`. Dodaj `aria-label="hrly — strona główna"`.
- Nagłówek hero („Zmień dane HR w strategiczne decyzje.") → `h1`.
- Nagłówki sekcji (obecne `h3`) → `h2`.
- Nagłówki kart (obecne `h4`) → `h3`.
- Etykiety typu „01 · ANALITYKA HR Z AI", „PULPIT DEMONSTRACYJNY" **nie są nagłówkami** — jeśli siedzą w tagu `h*`, zmień na `p`/`span`.

**Przenosisz semantykę, nie style.** Zero zmian wizualnych.

**Akceptacja:** dokładnie jeden `h1`, po nim tylko `h2`, wewnątrz sekcji `h3`, zero `h4`. Żadnego przeskoku poziomu.

Commit: `design(faza-1): focus-visible, reduced-motion, hierarchia nagłówków`

---

# FAZA 2 — Jedna skala typograficzna

**To jest faza o największym ryzyku regresji. Rób ją sekcja po sekcji, nie hurtem.**

**Problem:** na 1470px hero ma 44px, lead 14px, **większość treści 12px**, etykiety 11/10/9/8px — jakieś 25% poniżej normy dla SaaS B2B. Strona czyta się jak zrzut przeskalowany do 75%.

Interlinia nagłówków jest losowa: dla tego samego poziomu zmierzone `36/36` (1.0), `36/39.6` (1.1), `36/41.4` (1.15), `36/45` (1.25).

Waga: `800` na 43 elementach i `900` na 35. Prawie wszystko jest ekstra-bold + uppercase + ujemny tracking. Kiedy wszystko krzyczy, hierarchia nie istnieje.

## 2.1 Zdefiniuj skalę w jednym miejscu

W centralnym pliku tokenów (ustalonym w FAZIE 0) zdefiniuj **dokładnie te** kroki i nic więcej:

| Token | Desktop | Mobile (<769px) | line-height | weight | tracking |
|---|---|---|---|---|---|
| `display` (h1 hero) | 60px | 36px | 1.05 | 800 | −0.02em |
| `h2` (sekcje) | 40px | 28px | 1.15 | 800 | −0.02em |
| `h3` (karty) | 20px | 18px | 1.3 | 700 | −0.01em |
| `body-lg` (lead) | 18px | 16px | 1.6 | 400 | 0 |
| `body` | 16px | 15px | 1.6 | 400 | 0 |
| `body-sm` (opisy w kartach) | 14px | 14px | 1.55 | 400 | 0 |
| `label` (etykiety mono) | 12px | 12px | 1.4 | 600 | 0.08em |

**Zasady nie do złamania:**

- **Minimalny rozmiar tekstu to 12px**, dozwolony wyłącznie dla `label`. Wszystkie obecne 11/10/9/8px idą do 12px.
- **Dozwolone wagi: 400, 600, 700, 800.** Wszystkie `font-weight: 900` → 800.
- Jeden poziom nagłówka = jedna interlinia. Zero `leading-none` na nagłówkach wielolinijkowych.

## 2.2 Przepisz komponenty na tokeny

Idź **sekcja po sekcji, w kolejności ze strony**, i zamieniaj hardkodowane rozmiary na tokeny. Po każdej sekcji rzuć okiem na 1440px i 390px.

Podniesienie body z 12px do 16px rozepnie karty w pionie — **to jest zamierzone**. Jeśli siatka się rozjedzie (karty w rzędzie mają różne wysokości), naprawiasz przez `items-stretch` / `h-full` na karcie, **nigdy** przez cofnięcie rozmiaru fontu.

**Akceptacja:** skrypt raportuje `ROZMIARY FONTU` wyłącznie ze zbioru `{12, 14, 16, 18, 20, 40, 60}` i `WAGI` wyłącznie ze zbioru `{400, 600, 700, 800}`.

Commit: `design(faza-2): jednolita skala typograficzna`

---

# FAZA 3 — Jeden komponent przycisku

**Problem — najmocniejszy dowód, że nie ma systemu.** Zmierzone na produkcji:

| CTA | Wysokość | Radius | Krój | Rozmiar/waga | Tło |
|---|---|---|---|---|---|
| Załóż darmowe konto (header) | **32px** | 12px | Inter | 12/700 | `#3B2F8C` |
| Wypróbuj za darmo (hero) | **44px** | 12px | Inter | 12/700 | `#3B2F8C` |
| Jak to działa (hero) | **46px** | 12px | Inter | 12/700 | biały |
| Zacznij bezpłatny test | **48px** | 12px | Plus Jakarta | 12/800 | `#F4A574` |
| Zobacz naszą ofertę | **41px** | **pill** | **JetBrains Mono** | 11/700 | biały |
| Otwórz przykładowy raport | **52px** | 12px | Plus Jakarta | 14/900 | `#F4A574` |

Sześć CTA, sześć wysokości, trzy kroje, dwa promienie, dwa kolory dla akcji „primary". W hero primary (44px) stoi obok secondary (46px) — to widać jako przesunięcie. Najważniejszy przycisk konwersji, ten w headerze, jest najmniejszym klikalnym elementem na stronie.

## 3.1 Zbuduj `Button`

```
Warianty:   primary | secondary | ghost
Rozmiary:   md (h 40px, px 20, text 14/600)  |  lg (h 48px, px 28, text 16/700)
Radius:     12px — zawsze, wszystkie warianty, zero pilli
Krój:       Inter dla wszystkich przycisków (Plus Jakarta i JetBrains Mono znikają z CTA)
Litery:     sentence case, zero uppercase
Ikona:      opcjonalna, po prawej, 16px, wyrównana do baseline
```

- `primary` — tło = jeden kolor marki (patrz 3.2), tekst biały
- `secondary` — tło białe/przezroczyste, border 1px w kolorze primary, tekst primary
- `ghost` — bez tła i obramowania, tekst + podkreślenie na hover

Każdy wariant ma zdefiniowane **wszystkie** stany: `default`, `hover`, `active`, `focus-visible` (ring z FAZY 1), `disabled`.

## 3.2 STOP — rozstrzygnięcie koloru primary

Obecnie „primary" jest raz fioletowy, raz brzoskwiniowy — to dwa konkurujące wołania do akcji. **Zatrzymaj się, podaj rekomendację z uzasadnieniem** (uwzględnij: brzoskwinia ma słaby kontrast na jasnym tle, patrz FAZA 4) i czekaj na decyzję. Nie zgaduj.

Po odpowiedzi wracasz i kończysz fazę.

## 3.3 Podmień wszystkie CTA

Wszystkie 6 miejsc na `<Button>`. Header CTA dostaje rozmiar `md` (40px), nie mniej.

**Akceptacja:** skrypt raportuje dokładnie **dwie** wysokości przycisków (40, 48), **jeden** radius (12px), **jeden** krój (Inter), **jeden** kolor tła dla wariantu primary.

Commit: `design(faza-3): komponent Button i ujednolicenie CTA`

---

# FAZA 4 — Kolor: reguła zamiast przypadku

## 4.1 Trzy realne faile kontrastu

| Element | Kolor | Tło | Kontrast | Wymóg |
|---|---|---|---|---|
| `10×` w pasku statystyk | `#F4A574` 30px/800 | biały | **1.99:1** | 3:1 |
| `+12% wzrostu` (hero mockup) | zielony 10px/800 | biały | **3.65:1** | 4.5:1 |
| `Wysokie` (hero mockup) | `#00E5A3` 9px/700 | jasne | **1.58:1** | 4.5:1 |

Poza tymi trzema kontrast na stronie jest w porządku — to nie jest systemowy problem czytelności, tylko trzy punktowe wpadki.

`10×` → ten sam fiolet co `58` i `+23%`. Zielone w mockupie → ciemniejszy odcień o kontraście ≥4.5:1 (po podniesieniu do 12px w FAZIE 2 wymóg dalej wynosi 4.5:1).

## 4.2 Reguła akcentu

**Problem:** akcent jest losowy. Pasek statystyk: `58` fiolet, `10×` brzoskwinia, `+23%` fiolet. Kroki procesu: `01` brzoskwinia, `02` i `03` fiolet. Użytkownik czyta przypadek jako błąd.

> **Reguła:** brzoskwinia `#F4A574` jest zarezerwowana dla (a) przycisków primary — jeśli wygra w 3.2 — oraz (b) **jednego** akcentu na sekcję, wyłącznie na ciemnym tle. Nigdy na tekście mniejszym niż 24px na jasnym tle.

Przejdź przez wszystkie wystąpienia brzoskwini z FAZY 0 i albo uzasadnij każde tą regułą, albo zamień na fiolet/navy. W paskach serii (statystyki, numeracja kroków): **wszystkie elementy tej samej serii mają ten sam kolor.**

## 4.3 Posprzątaj tokeny

- Dwa zielone (`#00E5A3` i osobny oklch-emerald) → jeden, jako `--color-success`.
- Mieszanka przestrzeni kolorów: własne hexy obok domyślnych `oklch()` Tailwinda v4 oznacza, że część elementów (szare teksty, obramowania) bierze kolor z domyślnej palety frameworka zamiast z palety marki. Znajdź je i podepnij pod własne tokeny.
- Docelowo **każdy** kolor na stronie pochodzi z nazwanego tokenu. Zero hexów inline w komponentach.

**Akceptacja:** skrypt raportuje `BŁĘDY KONTRASTU: 0` i listę kolorów tekstu zawierającą wyłącznie zdefiniowane tokeny.

Commit: `design(faza-4): tokeny kolorów, reguła akcentu, kontrast`

---

# FAZA 5 — Bugi wizualne

## 5.1 Nagłówek w złym kroju

Nagłówek **„BADANIE 11 OBSZARÓW, KTÓRE BUDUJĄ SILNĄ ORGANIZACJĘ"** renderuje się w **Inter**, gdy wszystkie pozostałe nagłówki sekcji są w **Plus Jakarta Sans**. Jedyny taki na stronie — to brakująca klasa, nie decyzja. Dodaj tę samą klasę kroju co pozostałe `h2` i sprawdź, czy nie ma innych nagłówków bez jawnie ustawionego kroju.

## 5.2 Maska ucinająca treść

W ciemnej sekcji „11 obszarów" maska wygasza ostatnią widoczną kartę (**ROZWÓJ I KARIERA**) w połowie zdania — słowo „lojalności." jest w połowie przezroczyste. Wygląda jak błąd renderowania.

Usuń maskę albo przesuń jej początek tak, żeby wygaszała **pustą przestrzeń pod ostatnią kartą**. **Żadne słowo na stronie nie może być częściowo przezroczyste.**

## 5.3 Cztery identyczne ikony

W sekcji „Wzmocnij swoją pozycję" cztery różne benefity mają **tę samą ikonę check-circle**. Ikona, która nic nie różnicuje, to szum.

Albo cztery różne, semantycznie trafne ikony z zestawu już obecnego w repo (w innych sekcjach są zegar, znak zapytania, laptop, serce, kubek, dyplom — zestaw istnieje), albo usuń ikony z tej sekcji całkowicie. **Bez nowej biblioteki ikon.**

## 5.4 Numeracja sekcji

Obecnie: `01` → (bez numeru) → `02` → `03` → `04` → (bez numeru) → `06` → `07`. Brak `05`, dwie sekcje bez numeru. Do tego trzy style etykiet: pill+mono, pill+sans-bold, goły mono w brzoskwini.

Ponumeruj **wszystkie** sekcje po kolei od 01 bez dziur i ujednolić do jednego komponentu `SectionLabel` (pill, JetBrains Mono 12px/600, tracking 0.08em, jedno tło dla jasnych sekcji, jedno dla ciemnych). To jedyna dozwolona zmiana treści.

Commit: `design(faza-5): poprawki wizualne i ujednolicenie etykiet sekcji`

---

# FAZA 6 — Hero

**Problem:** etykiety w makiecie („KONDYCJA ZESPOŁU", „94%", „Analityka Pulsu", „stabilna") pojawiają się dopiero po **~3 sekundach** — przez pierwsze sekundy widać puste białe prostokąty, dokładnie wtedy, gdy człowiek decyduje, czy scrollować. Kiedy się pojawią, są obrócone o ~8°, więc trzeba je czytać z przechyloną głową, a „wykres" to dwie kropki i kreska na siatce. Sprzedajesz analitykę HR obrazkiem bez analityki.

1. **Animacja wejścia max 400ms łącznie**, stagger max 60ms. Żaden element hero nie pojawia się później niż 400ms od załadowania.
2. **Rotacja etykiet max 3°**, a dla tych z liczbami (94%, 96.4%, +12%) — 0°. Rotacja karty może zostać, rotacja tekstu nie.
3. **Gęstość danych w mockupie:** wykres z dwoma punktami czyta się jak placeholder. Minimum: linia z 8–12 punktami, oś z etykietami, drugi szereg. **STOP, jeśli** wymaga to czegoś więcej niż podmiany danych w istniejącym SVG/komponencie — wtedy opisz zakres i czekaj.
4. Sprawdź, czy animacja nie odpala się ponownie przy scrollu w górę i czy po powrocie na górę hero nie jest pusty.

Commit: `design(faza-6): hero — czas animacji, czytelność etykiet, gęstość danych`

---

# FAZA 7 — Social proof (STOP na treści)

Na stronie nie ma **ani jednego** logo klienta, cytatu, case study ani liczby wdrożeń. Jednocześnie padają twarde twierdzenia: „240 000 zł rocznie", „standardy Gallupa", „58 czynników", „+23% wzrost zaangażowania" — bez źródeł i bez klientów. To nie jest problem wizualny i żaden restyling go nie zasypie, ale to największa dziura konwersyjna na tej stronie.

**Zrób tylko tyle:**

1. Przygotuj **pusty, gotowy do wypełnienia** komponent sekcji social proof (rząd logotypów + jeden cytat z podpisem), wstaw zakomentowany między hero a sekcją 02.
2. **Nie wymyślaj nazw firm, cytatów ani placeholderowych logotypów udających prawdziwe.**
3. Wypisz w podsumowaniu, jakich treści potrzebujesz.
4. Osobno: lista wszystkich miejsc, gdzie występują liczby z copy („240 000 zł", „+23%", „58 czynników") — właściciel zdecyduje, które wymagają przypisu ze źródłem.

Commit: `design(faza-7): szkielet sekcji social proof`

---

# SKRYPT WERYFIKACYJNY

Uruchamiaj w konsoli przeglądarki na `localhost`, viewport 1440px, po każdej fazie. Wynik wklejaj do pliku postępu.

```js
(() => {
  // konwersja oklab/oklch -> sRGB (canvas w Chrome tego nie robi, naiwna wersja da fałszywe faile)
  const g = x => x <= 0.0031308 ? 12.92*x : 1.055*Math.pow(x,1/2.4)-0.055;
  const oklab2rgb = (L,A,B) => {
    const l=(L+0.3963377774*A+0.2158037573*B)**3,
          m=(L-0.1055613458*A-0.0638541728*B)**3,
          s=(L-0.0894841775*A-1.2914855480*B)**3;
    return [ 4.0767416621*l-3.3077115913*m+0.2309699292*s,
            -1.2684380046*l+2.6097574011*m-0.3413193965*s,
            -0.0041960863*l-0.7034186147*m+1.7076147010*s]
      .map(v => Math.max(0, Math.min(255, Math.round(g(v)*255))));
  };
  const toRGBA = c => {
    c = c.trim(); let m;
    if ((m = c.match(/^rgba?\(([^)]+)\)/))) {
      const n = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat);
      return [n[0],n[1],n[2], n[3] === undefined ? 1 : n[3]];
    }
    if ((m = c.match(/^oklab\(([^)]+)\)/))) {
      const n = m[1].split(/[ \/]+/).filter(Boolean).map(parseFloat);
      return [...oklab2rgb(n[0],n[1],n[2]), n[3] ?? 1];
    }
    if ((m = c.match(/^oklch\(([^)]+)\)/))) {
      const n = m[1].split(/[ \/]+/).filter(Boolean).map(parseFloat);
      const h = n[2]*Math.PI/180;
      return [...oklab2rgb(n[0], n[1]*Math.cos(h), n[1]*Math.sin(h)), n[3] ?? 1];
    }
    return c === 'transparent' ? [0,0,0,0] : [0,0,0,1];
  };
  const over = (f,b) => { const a=f[3]; return [0,1,2].map(i=>f[i]*a+b[i]*(1-a)).concat(1); };
  const lum = c => { const [r,gg,b]=c.slice(0,3).map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4}); return .2126*r+.7152*gg+.0722*b; };
  const CR = (f,b) => { const a=lum(f), c=lum(b); return +(((Math.max(a,c)+.05)/(Math.min(a,c)+.05)).toFixed(2)); };
  const bgOf = el => {
    let e=el, st=[];
    while (e) { const b=toRGBA(getComputedStyle(e).backgroundColor); if (b[3]>0) st.push(b); if (b[3]===1) break; e=e.parentElement; }
    let base=[255,255,255,1];
    for (let i=st.length-1;i>=0;i--) base=over(st[i],base);
    return base;
  };

  const sizes={}, weights={}, fams={}, fails=[];
  document.querySelectorAll('body *').forEach(el => {
    const cs = getComputedStyle(el);
    if (el.children.length===0 && el.textContent.trim() && el.getBoundingClientRect().width>0) {
      const fs = parseFloat(cs.fontSize);
      sizes[fs] = (sizes[fs]||0)+1;
      weights[cs.fontWeight] = (weights[cs.fontWeight]||0)+1;
      const ff = cs.fontFamily.split(',')[0].replace(/"/g,'');
      fams[ff] = (fams[ff]||0)+1;
      if (cs.visibility!=='hidden' && +cs.opacity!==0) {
        const bg=bgOf(el), fg=over(toRGBA(cs.color),bg), r=CR(fg,bg);
        const large = fs>=24 || (fs>=18.66 && +cs.fontWeight>=700);
        if (r < (large?3:4.5)) fails.push(`${el.textContent.trim().slice(0,30)} [${fs}px/w${cs.fontWeight}] = ${r}:1`);
      }
    }
  });

  const btns = [...document.querySelectorAll('a,button')]
    .map(b => { const r=b.getBoundingClientRect(), c=getComputedStyle(b);
      return {t:(b.innerText||'').trim().slice(0,24), h:Math.round(r.height),
              rad:parseFloat(c.borderRadius)>999?'pill':c.borderRadius,
              ff:c.fontFamily.split(',')[0].replace(/"/g,''), bg:c.backgroundColor}; })
    .filter(b => b.h>30 && b.t);

  console.log('ROZMIARY FONTU:', Object.keys(sizes).map(Number).sort((a,b)=>a-b).join(', '));
  console.log('WAGI:', Object.keys(weights).sort().join(', '));
  console.log('KROJE:', Object.keys(fams).join(' | '));
  console.log('NAGŁÓWKI: h1=%d h2=%d h3=%d h4=%d',
    document.querySelectorAll('h1').length, document.querySelectorAll('h2').length,
    document.querySelectorAll('h3').length, document.querySelectorAll('h4').length);
  console.log('WYSOKOŚCI PRZYCISKÓW:', [...new Set(btns.map(b=>b.h))].sort((a,b)=>a-b).join(', '));
  console.log('RADIUSY PRZYCISKÓW:', [...new Set(btns.map(b=>b.rad))].join(', '));
  console.log('KROJE PRZYCISKÓW:', [...new Set(btns.map(b=>b.ff))].join(', '));
  console.log(`BŁĘDY KONTRASTU (${fails.length}):`); fails.forEach(f => console.log('  ✗', f));
  console.table(btns);
})();
```

## Wartości docelowe — czego oczekujesz po której fazie

| Metryka | Po FAZIE 1 | Po FAZIE 2 | Po FAZIE 3 | Po FAZIE 4 |
|---|---|---|---|---|
| `NAGŁÓWKI` | `h1=1 h2=7-8 h3=~39 h4=0` | bez zmian | bez zmian | bez zmian |
| `ROZMIARY FONTU` | — | `12, 14, 16, 18, 20, 40, 60` | ↑ | ↑ |
| `WAGI` | — | `400, 600, 700, 800` | ↑ | ↑ |
| `WYSOKOŚCI PRZYCISKÓW` | — | — | `40, 48` | ↑ |
| `RADIUSY PRZYCISKÓW` | — | — | `12px` | ↑ |
| `KROJE PRZYCISKÓW` | — | — | `Inter` | ↑ |
| `BŁĘDY KONTRASTU` | — | — | — | `0` |

Poza tym po FAZIE 1 sprawdzasz ręcznie: przejście Tabem (widoczny ring wszędzie) i tryb „Reduce motion" (zero ruchu, pełna treść).

---

# MAPA CAŁOŚCI

| Faza | Zakres | Szac. czas | Ryzyko regresji |
|---|---|---|---|
| 0 | Rekonesans i baseline | 30 min | zero |
| 1 | Focus, reduced-motion, nagłówki | 3–4 h | niskie |
| 2 | Skala typograficzna | 1 dzień | **wysokie** — rozepnie układy |
| 3 | Komponent Button | 4–6 h | średnie |
| 4 | Kolor i tokeny | 4–6 h | niskie |
| 5 | Bugi wizualne | 2–3 h | niskie |
| 6 | Hero | 4 h | średnie |
| 7 | Social proof (szkielet) | 1 h | zero |

Fazy 1–4 to ok. 2,5 dnia i dają większość efektu, bo naprawiają przyczynę — brak systemu — a nie objawy.
