# Traspàs per desplegar Culdesac al VPS

Aquest document és per a l’agent d’IA que té accés al VPS.

Objectiu: revisar com està organitzat el servidor, clonar Culdesac, esperar que el propietari configuri `.env` i desplegar l’aplicació amb Docker darrere de Nginx i HTTPS.

Repositori: `git@github.com:Anovas001/culdesac.git`

```text
Internet → Nginx del VPS → 127.0.0.1:3000 → contenidor app
                                             ↓
                                      PostgreSQL Docker
```

No s’ha d’exposar PostgreSQL a Internet ni aturar o eliminar contenidors d’altres aplicacions.

## 1. Revisar el VPS

Executa una auditoria ràpida:

```bash
cat /etc/os-release
df -h
free -h

docker version
docker compose version
docker compose ls
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'

sudo ss -lntup
systemctl is-active nginx 2>/dev/null || true
sudo nginx -t 2>/dev/null || true
certbot --version 2>/dev/null || true
```

Comprova:

- Que Docker i `docker compose` funcionen.
- Quins contenidors ja existeixen.
- Si els ports `80`, `443` i `3000` estan ocupats.
- Si Nginx funciona directament al host.
- Si ja existeix algun projecte o recurs anomenat `culdesac-prod`.

Decisions:

- Utilitza `/opt/culdesac` com a directori si està lliure.
- Utilitza `3000` com a `APP_PORT` si està lliure. Si no, escull un altre port local.
- Utilitza `culdesac-prod` com a nom del projecte Compose si no existeix.
- Si Nginx està dins d’un contenidor, para i informa de la xarxa del proxy: el `compose.yml` actual està preparat per a Nginx al host.
- Si falten Docker, Nginx o Certbot, informa abans d’instal·lar res.

No executis `docker system prune`, `docker volume prune`, `docker compose down -v` ni eliminis recursos existents.

## 2. Clonar el projecte i esperar el `.env`

```bash
sudo mkdir -p /opt/culdesac
sudo chown "$(id -un):$(id -gn)" /opt/culdesac
git clone --branch main --single-branch git@github.com:Anovas001/culdesac.git /opt/culdesac
cd /opt/culdesac

git status -sb
git branch --show-current
git log -1 --oneline

cp .env.example .env
chmod 600 .env
```

Si SSH no està configurat i el repositori és públic, utilitza:

```bash
git clone --branch main --single-branch https://github.com/Anovas001/culdesac.git /opt/culdesac
```

Ha de ser la branca `main` i no hi ha d’haver canvis locals.

En aquest punt **atura’t** i digues al propietari:

```text
El projecte està clonat a /opt/culdesac i el fitxer .env està preparat.
Pots editar-lo des de Visual Studio Code. Avisa’m quan estigui complet i continuaré.
```

El propietari completarà com a mínim:

```dotenv
APP_URL=https://DOMINI_PUBLIC
APP_PORT=3000
APP_TIMEZONE=Europe/Madrid

POSTGRES_DB=culdesac
POSTGRES_USER=culdesac
POSTGRES_PASSWORD=CONTRASENYA_SEGURA
DATABASE_URL=postgresql://culdesac:CONTRASENYA_URL_ENCODED@db:5432/culdesac?schema=public

ADMIN_EMAIL=EMAIL_ADMIN
ADMIN_PASSWORD_HASH=HASH_BCRYPT
SESSION_SECRET=SECRET_ALEATORI_MINIM_32_CARACTERS

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

EMAIL_MODE=resend
RESEND_API_KEY=re_...
EMAIL_FROM=Culdesac <noreply@DOMINI_VERIFICAT>
```

Notes:

- `APP_URL` no porta `/` final.
- `DATABASE_URL` utilitza el host `db`, no `localhost`.
- La contrasenya de `DATABASE_URL` ha d’estar URL-encoded si conté caràcters especials.
- Els `$` del hash bcrypt s’han d’escriure com `\$` al `.env`.
- `SESSION_SECRET` es pot generar amb `openssl rand -base64 48`.
- Per al primer desplegament es pot mantenir Stripe en mode test.
- No mostris `.env` al xat ni el pugis a Git.

## 3. Construir i desplegar amb Docker

Continua només quan el propietari confirmi que `.env` està complet.

```bash
cd /opt/culdesac
chmod 600 .env

docker compose --project-name culdesac-prod --env-file .env -f compose.yml config --quiet
docker compose --project-name culdesac-prod --env-file .env -f compose.yml build --pull

docker compose --project-name culdesac-prod --env-file .env -f compose.yml up -d db
docker compose --project-name culdesac-prod --env-file .env -f compose.yml ps

docker compose --project-name culdesac-prod --env-file .env -f compose.yml run --rm migrate
docker compose --project-name culdesac-prod --env-file .env -f compose.yml up -d --no-deps app
```

Si la migració falla, no continuïs. Revisa l’error i `DATABASE_URL`.

Comprova l’aplicació:

```bash
docker compose --project-name culdesac-prod --env-file .env -f compose.yml ps
docker compose --project-name culdesac-prod --env-file .env -f compose.yml logs --tail=100 app
curl --fail http://127.0.0.1:3000/api/health
```

Si s’ha escollit un altre `APP_PORT`, substitueix `3000` a l’última ordre.

Resultat esperat:

```json
{"status":"ok"}
```

En producció:

- L’app només ha d’escoltar a `127.0.0.1:APP_PORT`.
- PostgreSQL no ha de publicar cap port.
- El volum `postgres_data` conté les dades persistents.
- El servei `migrate` és temporal i acaba després d’aplicar Prisma.

En una base nova no cal executar el seed. Entra a `/admin/login` i crea o activa el torneig des del backoffice.

## 4. Configurar Nginx, HTTPS i validar

Confirma que el domini apunta a la IP pública del VPS.

Crea `/etc/nginx/sites-available/culdesac.conf`:

```nginx
server {
    listen 80;
    server_name DOMINI_PUBLIC;

    access_log /var/log/nginx/culdesac.access.log;
    error_log /var/log/nginx/culdesac.error.log;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Substitueix `DOMINI_PUBLIC` i el port si no és `3000`.

```bash
sudo ln -s /etc/nginx/sites-available/culdesac.conf /etc/nginx/sites-enabled/culdesac.conf
sudo nginx -t
sudo systemctl reload nginx
```

No recarreguis Nginx si `nginx -t` falla.

Activa HTTPS:

```bash
sudo certbot --nginx \
  --domain DOMINI_PUBLIC \
  --redirect \
  --agree-tos \
  --no-eff-email \
  --email EMAIL_LETSENCRYPT
```

Validació final:

```bash
curl --fail https://DOMINI_PUBLIC/api/health
docker compose --project-name culdesac-prod --env-file .env -f compose.yml ps
```

Comprova manualment:

```text
https://DOMINI_PUBLIC/
https://DOMINI_PUBLIC/legal/terms
https://DOMINI_PUBLIC/legal/privacy
https://DOMINI_PUBLIC/admin/login
```

### Stripe test

Al Dashboard de Stripe, en mode test, crea el webhook:

```text
https://DOMINI_PUBLIC/api/stripe/webhook
```

Esdeveniments:

- `checkout.session.completed`
- `checkout.session.expired`

Copia el seu `whsec_...` a `.env` i recrea l’app:

```bash
docker compose --project-name culdesac-prod --env-file .env -f compose.yml \
  up -d --no-deps --force-recreate app
```

Fes una inscripció amb Stripe test i confirma:

- Pagament visible a Stripe.
- Inscripció `PAID` al backoffice.
- Webhook amb resposta `2xx`.
- Correu enviat per Resend.

Quan es passi a Stripe live, substitueix conjuntament `STRIPE_SECRET_KEY` i `STRIPE_WEBHOOK_SECRET`, recrea l’app i fes una prova real controlada.

## Informe final de l’agent

```text
- Directori de desplegament:
- Branca i commit:
- Domini i port local:
- Estat de db, migracions i app:
- Resultat de /api/health:
- Estat de Nginx i HTTPS:
- Stripe: test o live i resultat del webhook:
- Resultat del correu Resend:
- Errors o passos pendents:
```

No incloguis secrets, contrasenyes ni dades personals a l’informe.
