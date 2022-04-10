# Kongfiguracja NGINX

## Ogólne informacje 
`nginx` został skonfigurowany tak, by serwował pliki skompilowane przez Svelte statycznie, obsługiwał proxy do backendu na endpoint z prefixem `/api` i dodatkowe proxy do `livereload` do ułatwienia developementu.

## Schemat działania

Pliki są serwowane na adresie `localhost:8000`.
Zapytania do `api` są przekierowywane na adres `localhost:3000` (backend).
To oznacza, że zapytanie klienta `/api/something` zostanie przekierowane na `localhost:3000/something`.
Backend nie musi uwzględniać prefixu `api` przy wystawianiu endpointów.

Serwer `livereload` jest wystawiany przez `rollup` na adresie `localhost:35729`, `nginx` został skonfigurowany tak, by nie musieć się tym martwić. `livereload` jest obsługiwany przy użyciu komendy `npm run dev` dla klienta, w innym przypadku nie jest obsługiwany.

## Opis działania `nginx`

`nginx` został zaprojektowany z myślą o działaniu jako globalny serwis, z globalną konfiguracją. Zarówno dla Windows, jak i Linux, `nginx` działa jako serwis, którym możemy sterować. U nas `nginx` będzie działał w tle i będziemy mogli nim prosto sterować.

W razie potrzeby, możemy również uruchomić `nginx` jako zwykłą aplikację, nie jako daemon.
```
nginx -g "daemon off;"
```

## Konfiguracja `nginx`

### Instalacja `nginx` 

#### Dla Windows

Pobieramy paczkę ze strony nginx, rozpakowujemy ją w wybranym folderze. By móc następnie sterować nginx z linii komend, dodajemy tą ścieżkę do path.

#### Dla linux

`nginx` powinien być dostępny w repozytorium. Dla Ubuntu możemy wpisać 
```
sudo apt install nginx
```

`nginx` jest instalowany jako daemon, możemy nim więc sterować przy użyciu komendy:
```
sudo service nginx
```

### Pliki konfiguracyjne

Żeby skonfigurować `nginx` korzystamy z globalnych plików konfiguracyjnych. Dla Windows jest to plik `conf/nginx.conf` znajdujący się w folderze instalacyjnym `nginx`. Dla Linux jest to `/etc/nginx/conf.d/...` (TODO)

Nasza konfiguracja `nginx` znajduje się w pliku `nginx/nginx.conf`. Kopijemy zawartość tego pliku do domyślnego pliku konfiguracyjnego.