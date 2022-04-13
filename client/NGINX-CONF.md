# Kongfiguracja NGINX

## Ogólne informacje 
`nginx` został skonfigurowany tak, by serwował pliki skompilowane przez Svelte statycznie, obsługiwał proxy do backendu na endpoint z prefixem `/api` i dodatkowe proxy do `livereload` do ułatwienia developementu.

## Schemat działania

Pliki są serwowane na adresie `localhost:8000`.
Zapytania do `api` są przekierowywane na adres `localhost:3000` (backend).
To oznacza, że zapytanie klienta `/api/something` zostanie przekierowane na `localhost:3000/something`.
Backend nie musi uwzględniać prefixu `api` przy wystawianiu endpointów.

Serwer `livereload` jest wystawiany przez `rollup` na adresie `localhost:35729`, `nginx` został skonfigurowany tak, by nie musieć się tym martwić. `livereload` jest obsługiwany tylko przy użyciu komendy `npm run dev` dla klienta.

## Konfiguracja `nginx`

### Pliki konfiguracyjne

Nasza konfiguracja `nginx` znajduje się w pliku `conf/nginx.conf`. 
`nginx` został skonfigurowany tak, żeby nie musiał działać jako *daemon*.

### Instalacja `nginx` 

Po instalacji możemy sprawdzić, czy `nginx` jest zainstalowany wpisując
```
nginx -v
```

#### Dla Windows

Pobieramy paczkę ze strony nginx, rozpakowujemy ją w wybranym folderze. By móc następnie sterować nginx z linii komend, dodajemy tą ścieżkę do `PATH`.

Od tego momentu możemy serwować klienta poprzez `npm run dev`.

#### Dla linux

`nginx` powinien być dostępny w repozytorium. Dla Ubuntu możemy wpisać 
```
sudo apt install nginx
```

`nginx` jest instalowany jako daemon, możemy nim więc sterować przy użyciu komendy:
```
sudo service nginx
```

