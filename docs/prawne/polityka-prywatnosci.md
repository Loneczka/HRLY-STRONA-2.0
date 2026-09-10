# Polityka prywatności serwisu hrly.pl

> **PROJEKT DO WERYFIKACJI PRAWNEJ.** Dokument przygotowany na podstawie faktycznego działania serwisu (stan kodu na 10.09.2026). Pola w nawiasach kwadratowych `[…]` wymagają uzupełnienia. Fragmenty oznaczone „WARIANT B” dotyczą sytuacji, gdy formularze zostaną podłączone do serwera (dziś dane z formularzy nie opuszczają przeglądarki użytkownika — patrz pkt 4).

**Wersja:** 1.0 — obowiązuje od `[DATA]`

## 1. Administrator danych
Administratorem danych osobowych jest **HRLY Sp. z o.o.** z siedzibą w Warszawie, `[ulica, kod pocztowy]`, wpisana do rejestru przedsiębiorców KRS pod numerem `[KRS]`, NIP `[NIP]`, REGON `[REGON]`, kapitał zakładowy `[kwota]` zł (dalej: „Administrator”, „my”).
Kontakt w sprawach ochrony danych: **kontakt@hrly.pl** `[lub osobny adres, np. rodo@hrly.pl]`, listownie na adres siedziby. `[Jeżeli wyznaczono Inspektora Ochrony Danych: imię i nazwisko, e-mail.]`

## 2. Zakres dokumentu
Polityka dotyczy serwisu internetowego **hrly.pl** (strona informacyjna: strona główna, „Funkcje”, „Cennik”, „O nas”, „Baza wiedzy”, „Kontakt”). Platforma aplikacyjna **app.hrly.pl** (konto, badania pracownicze) ma odrębne zasady przetwarzania określone w Regulaminie i umowie powierzenia przetwarzania danych `[albo: jest objęta niniejszą polityką — do decyzji]`.

## 3. Jakie dane przetwarzamy i skąd je mamy
1. **Dane techniczne połączenia** — adres IP, typ przeglądarki i urządzenia, adres odwiedzanej strony, czas żądania. Przetwarzane automatycznie przez serwer, na którym utrzymywany jest serwis (logi serwera WWW).
2. **Dane statystyczne (analityka)** — patrz pkt 6.
3. **Dane z formularzy** — imię, adres e-mail, nazwa firmy, temat i treść wiadomości (formularz kontaktowy); adres e-mail (newsletter w „Bazie wiedzy”); imię i nazwisko, służbowy e-mail, nazwa organizacji (formularz „Uruchom sandbox organizacji” w cenniku). Podanie danych jest dobrowolne, ale niezbędne do obsługi zapytania. Patrz pkt 4 co do faktycznego przepływu tych danych.

## 4. Formularze — gdzie trafiają dane
**Stan obecny (WARIANT A):** dane wpisane w formularzach (kontakt, newsletter, sandbox) są zapisywane **wyłącznie w pamięci przeglądarki użytkownika (localStorage)** i **nie są przesyłane do Administratora ani do żadnego podmiotu trzeciego**. Administrator nie ma do nich dostępu; użytkownik może je usunąć, czyszcząc dane witryny w przeglądarce. W tym wariancie Administrator nie przetwarza danych osobowych z formularzy w rozumieniu RODO.
`[UWAGA DLA PRAWNIKA I WŁAŚCICIELA: to jest stan techniczny, nie zamierzony — wiadomości z formularza nie docierają do firmy. Po podłączeniu formularzy do serwera obowiązuje WARIANT B.]`

**WARIANT B (po podłączeniu formularzy):** dane z formularzy są przesyłane do Administratora i przetwarzane w celu:
- udzielenia odpowiedzi na zapytanie i prowadzenia korespondencji — art. 6 ust. 1 lit. b RODO (działania przed zawarciem umowy) oraz lit. f (prawnie uzasadniony interes: obsługa zapytań);
- wysyłki newslettera — art. 6 ust. 1 lit. a RODO (zgoda), którą można wycofać w każdej chwili linkiem w wiadomości lub mailem;
- uruchomienia bezpłatnego okresu testowego / konta sandbox — art. 6 ust. 1 lit. b RODO.
Okres przechowywania: korespondencja — do zakończenia sprawy i przez `[np. 3 lata]` dla celów dowodowych; newsletter — do wycofania zgody; dane konta testowego — zgodnie z Regulaminem. Podmioty przetwarzające: `[dostawca poczty / CRM / bazy danych, np. Supabase Inc. — kraj, podstawa transferu]`.

## 5. Pliki cookies i pamięć przeglądarki
Serwis **nie używa plików cookies** do śledzenia ani do celów marketingowych. Serwis korzysta z pamięci lokalnej przeglądarki (localStorage) w celu zapamiętania konfiguracji treści strony oraz — jak opisano w pkt 4 — danych wpisanych w formularzach; te informacje nie są odczytywane przez serwer Administratora. `[Jeśli platforma app.hrly.pl używa cookies sesyjnych — opisać osobno.]`

## 6. Analityka (Umami)
Do pomiaru ruchu używamy narzędzia **Umami** w wersji hostowanej przez `[Umami Software, Inc., adres — cloud.umami.is]`. Umami **nie używa cookies** i nie tworzy profili użytkowników; zbiera zagregowane dane o odwiedzinach (adres odwiedzanej strony, źródło wejścia, typ urządzenia i przeglądarki, kraj ustalony na podstawie adresu IP, który nie jest przechowywany w postaci umożliwiającej identyfikację). Podstawa: art. 6 ust. 1 lit. f RODO — prawnie uzasadniony interes Administratora (statystyka i rozwój serwisu). `[Potwierdzić lokalizację serwerów Umami Cloud i podstawę ewentualnego transferu poza EOG; alternatywnie przenieść Umami na własny serwer.]`

## 7. Zasoby z serwerów zewnętrznych
Okładki artykułów w „Bazie wiedzy” mogą być ładowane z serwisu **Unsplash** (images.unsplash.com, Unsplash Inc., USA). Przy ich pobieraniu przeglądarka użytkownika przekazuje do tego dostawcy adres IP i dane techniczne żądania. `[Rozważyć przeniesienie obrazów na własny serwer — wtedy ten punkt znika.]` Czcionki są hostowane na serwerze Administratora (brak żądań do Google Fonts).

## 8. Hosting
Serwis jest utrzymywany na serwerze `[nazwa dostawcy hostingu, siedziba, kraj — wg konfiguracji: Mikrus, Polska]`, na podstawie umowy powierzenia przetwarzania danych `[potwierdzić]`. Dane nie są przekazywane poza Europejski Obszar Gospodarczy, z wyjątkiem opisanym w pkt 6 i 7.

## 9. Odbiorcy danych
Dane techniczne i statystyczne mogą być przetwarzane przez: dostawcę hostingu (pkt 8), dostawcę analityki (pkt 6), dostawcę zasobów graficznych (pkt 7). W WARIANCIE B także: `[dostawca poczty e-mail / CRM / bazy danych]`. Danych nie sprzedajemy i nie udostępniamy w celach marketingowych podmiotów trzecich.

## 10. Prawa osób, których dane dotyczą
Masz prawo do: dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia, wniesienia sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie oraz wycofania zgody w dowolnym momencie (bez wpływu na zgodność przetwarzania sprzed wycofania). Wnioski: kontakt@hrly.pl. Masz też prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).

## 11. Zautomatyzowane decyzje i profilowanie
Nie podejmujemy decyzji opartych wyłącznie na zautomatyzowanym przetwarzaniu i nie profilujemy użytkowników serwisu.

## 12. Bezpieczeństwo
Połączenie z serwisem jest szyfrowane (HTTPS). Stosujemy środki organizacyjne i techniczne odpowiednie do ryzyka, w tym kontrolę dostępu do panelu administracyjnego serwisu.

## 13. Zmiany polityki
O zmianach informujemy przez publikację nowej wersji na tej stronie z datą obowiązywania. Poprzednie wersje udostępniamy na życzenie.

---
### Notatki dla prawnika (do usunięcia przed publikacją)
- Faktyczny przepływ danych z formularzy = WARIANT A (localStorage). Wymaga decyzji biznesowej: podłączyć backend (Supabase/e-mail) i wtedy WARIANT B.
- Strona główna deklaruje „Pełna zgodność z RODO” — po weryfikacji polityki i DPA rozważyć złagodzenie brzmienia.
- app.hrly.pl: jeżeli badania pracownicze odbywają się na platformie, klient (pracodawca) jest administratorem danych ankietowych, a HRLY procesorem — potrzebna umowa powierzenia (załącznik do Regulaminu).
- Panel administracyjny (/#admin) jest częścią tego samego serwisu; hasło administratora jest zapisane w konfiguracji po stronie przeglądarki — do przeglądu bezpieczeństwa, poza zakresem tej polityki.
