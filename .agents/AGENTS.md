# HRly - Instrukcja Wdrożenia (Autodeploy) 🚀

Ta informacja jest przeznaczona dla asystentów AI oraz programistów pracujących nad tym projektem.

## Podsumowanie Środowiska
- **Typ aplikacji:** React SPA (Vite)
- **Serwer docelowy (VPS):** Mikrus (LXC Container)
- **Adres SSH:** `root@amy151.mikrus.xyz` na porcie `10151`
- **Klucz autoryzacyjny SSH (lokalny):** `/Users/ania/.ssh/id_ed25519_hrly` (Klucz publiczny dodany do `~/.ssh/authorized_keys` na VPS)
- **Ścieżka aplikacji na VPS:** `/var/www/hrly` (właściciel: `www-data:www-data`)
- **Serwer Web:** Nginx (skonfigurowany do nasłuchiwania na IPv4 oraz IPv6 port 80 - IPv6 wymagany przez Mikrus proxy)
- **Produkcyjny adres URL:** `https://amy151-80.mikrus.cloud/`

---

## Konfiguracja Nginx na VPS (`/etc/nginx/sites-available/hrly`)
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name _;

    root /var/www/hrly;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

---

## Przepływ Autodeploy (GitHub Actions)
Wdrożenie odbywa się automatycznie przy każdym `git push origin main`.

- **Workflow plik:** `.github/workflows/deploy.yml`
- **Wymagany sekret w GitHub:** W ustawieniach repozytorium (`Loneczka/HRLY-STRONA-2.0`) należy dodać sekret o nazwie `VPS_SSH_KEY` zawierający zawartość klucza prywatnego ze ścieżki `/Users/ania/.ssh/id_ed25519_hrly`.
- Skrypt wdrożeniowy buduje projekt (`npm run build`) na serwerach GitHub i kopiuje skompilowany folder `dist/` do katalogu `/var/www/hrly` na VPS przy użyciu narzędzia `rsync`.
