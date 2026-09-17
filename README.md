# Fortnite Tournaments

## Project overview

MVP monolític per publicar un únic torneig de Fortnite, cobrar la inscripció amb Stripe Checkout i gestionar-ne el resultat des d'un panell d'administració. El flux autoritatiu és **formulari → Stripe → webhook verificat → `PAID` → email**; visitar la pàgina d'èxit no confirma mai un pagament.

## Architecture

Next.js App Router conté la UI, rutes API i serveis de domini. PostgreSQL guarda tornejos i inscripcions mitjançant Prisma. Stripe Checkout i Resend són serveis externs. Docker Compose executa `db`, un servei temporal `migrate` i `app`; la base de dades no publica cap port en producció.

## Requirements

- Node.js 22 LTS i npm (per executar sense Docker).
- Docker Engine i el plugin `docker compose` (per al flux recomanat).
- Credencials de Stripe i Resend només quan es vulgui activar cadascuna de les integracions.

## Local development

1. Copia l'entorn i omple almenys la contrasenya de PostgreSQL, l'admin i `SESSION_SECRET`:

   ```bash
   cp .env.example .env
   ```

   A PowerShell: `Copy-Item .env.example .env`.

2. Arrenca l'entorn:

   ```bash
   docker compose -f compose.yml -f compose.dev.yml up --build
   ```

   La primera arrencada aplica les migracions amb el servei `migrate`. L'app queda disponible a [http://localhost:3000](http://localhost:3000). PostgreSQL es publica només a `127.0.0.1:5432` en aquest override de desenvolupament.

Per treballar sense Docker, cal tenir PostgreSQL disponible, adaptar `DATABASE_URL` a `localhost`, i executar `npm ci`, `npx prisma migrate dev`, `npm run db:seed` i `npm run dev`.

## Environment variables

Parteix sempre de [.env.example](.env.example). No pugis mai `.env` al repositori.

| Variable | Ús |
| --- | --- |
| `APP_URL` | URL pública sense barra final; crea els URL de retorn de Stripe. |
| `APP_PORT`, `APP_TIMEZONE` | Port local i zona horària de presentació. |
| `POSTGRES_*` | Credencials del contenidor PostgreSQL. |
| `DATABASE_URL` | Connexió Prisma; en Compose ha d'utilitzar el host `db`. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` | Accés de l'únic administrador i signatura de cookie. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Clau secreta i secret de signatura del webhook. |
| `EMAIL_MODE` | `console` en local o `resend` en producció. |
| `RESEND_API_KEY`, `EMAIL_FROM` | Necessàries quan `EMAIL_MODE=resend`. |

Les contrasenyes amb `@`, `:`, `/`, `?` o `#` han d'estar URL-encoded dins de `DATABASE_URL`.

## Database / Prisma

Les migracions versionades són a `prisma/migrations`. En desenvolupament local sense Docker, crea una migració amb `npx prisma migrate dev --name descripcio` i no editis la base de producció amb `db push`. Per omplir dades inicials, executa:

```bash
npm run db:seed
```

Al contenidor, la persistència és el volum Docker `postgres_data`; baixar serveis amb `docker compose down` no l'esborra.

## Creating admin password

Genera un hash bcrypt en una màquina de confiança i enganxa el resultat **entre cometes simples** a `ADMIN_PASSWORD_HASH` (Docker Compose no ha d'interpretar els caràcters `$` del hash):

```bash
npm run admin:hash -- "una-contrasenya-llarga-i-unica"
```

Genera també `SESSION_SECRET` amb, per exemple, `openssl rand -base64 48`. No reutilitzis cap d'aquests dos valors entre projectes.

## Stripe test setup

1. Entra a [Stripe Dashboard](https://dashboard.stripe.com/), activa **Test mode** i copia una secret key `sk_test_...` a `STRIPE_SECRET_KEY`.
2. Instal·la la [Stripe CLI](https://docs.stripe.com/stripe-cli) i autentica-la amb `stripe login`.
3. Mantén `EMAIL_MODE=console` mentre fas proves locals.
4. Al Checkout test, utilitza una targeta de prova oficial com `4242 4242 4242 4242`, una data futura i qualsevol CVC/codi postal vàlid. Consulta les [targetes de prova de Stripe](https://docs.stripe.com/testing) per altres casos.

## Testing Stripe webhook

Amb l'app oberta, en un segon terminal executa:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

La CLI mostrarà un `whsec_...`; copia'l a `STRIPE_WEBHOOK_SECRET` i reinicia l'app. Completa un Checkout de test i comprova que la inscripció passa a `PAID` a l'admin. Per una prova dirigida també pots usar `stripe trigger checkout.session.completed`, però un Checkout real de test comprova millor les metadades de l'aplicació.

## Resend setup

En local, deixa `EMAIL_MODE=console`: no s'envia cap correu i el servei deixa un registre segur al log.

Per producció:

1. Crea un compte a [Resend](https://resend.com/), afegeix un domini o subdomini (per exemple `mail.elteudomini.cat`) i configura els DNS que Resend indiqui.
2. Espera que el domini quedi verificat i crea una API key restringida al mínim necessari.
3. Defineix `EMAIL_MODE=resend`, `RESEND_API_KEY` i `EMAIL_FROM`, amb un remitent del domini verificat.
4. Reinicia l'app i prova una inscripció en Stripe test abans de passar Stripe a live mode.

## Running tests

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Building production image

Construeix exactament la imatge runtime que s'utilitzarà al VPS:

```bash
docker build --target runner -t culdesac:latest .
```

El Dockerfile és multi-stage: el runtime no conté el codi font ni la CLI de Prisma, i s'executa com a usuari no-root. El target `migrate` només existeix per executar `prisma migrate deploy` abans de l'app.

## VPS deployment

En un directori propi del VPS, copia el codi, crea un `.env` de producció i posa `APP_URL=https://el-teu-domini`, credencials PostgreSQL fortes, l'admin, Stripe live i Resend. A continuació:

```bash
docker compose build
docker compose up -d db
docker compose run --rm migrate
docker compose up -d app
docker compose ps
```

L'última ordre ha de mostrar `app` saludable. La configuració de producció lliga l'app a `127.0.0.1:${APP_PORT:-3000}` i no publica PostgreSQL: és segura per un reverse proxy que s'executi al host. Mantén `.env` amb permisos restrictius i fora de qualsevol còpia pública.

## Running migrations

Per desplegar una versió nova, aplica primer les migracions una sola vegada:

```bash
docker compose run --rm migrate
```

No escalïs el servei `migrate` ni l'executis en paral·lel. El `docker compose up` normal també el té com a dependència one-shot; usar explícitament l'ordre anterior fa el procés de desplegament visible i permet aturar-se si una migració falla.

## Reverse proxy integration

**Proxy al host.** Mantén el port per defecte a `127.0.0.1:3000`. Configura el teu Nginx, Caddy o Traefik existent perquè enviï el domini HTTPS a `http://127.0.0.1:3000`. El proxy és responsable de TLS, certificats i capçaleres habituals; aquesta app no reserva 80 ni 443.

**Proxy en Docker.** Elimina `ports` d'`app`, declara una xarxa externa que ja utilitza el proxy i uneix `app` a aquesta xarxa. El proxy ha de resoldre el servei `app` i enviar-li trànsit al port `3000`. No connectis `db` a la xarxa del proxy i no publiquis `5432`.

## Stripe production webhook

1. Completa l'activació del compte Stripe i canvia a live mode.
2. Desa la live secret key com `STRIPE_SECRET_KEY`.
3. A **Developers → Webhooks**, crea l'endpoint `https://EL_TEU_DOMINI/api/stripe/webhook`.
4. Selecciona `checkout.session.completed` i `checkout.session.expired` (i només events addicionals que el codi tingui implementats).
5. Copia el signing secret `whsec_...` específic d'aquest endpoint a `STRIPE_WEBHOOK_SECRET`, reinicia l'app i comprova el primer pagament amb atenció.

No facis servir mai les claus test ni el `whsec` de Stripe CLI en producció.

## Backups

Fes backups regulars fora del VPS. Amb els serveis actius:

```bash
mkdir -p backups
docker compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom > backups/culdesac-$(date +%F).dump
```

Per restaurar (aquesta ordre sobreescriu objectes de la base de dades indicada), atura l'app, verifica el fitxer i executa:

```bash
docker compose stop app
docker compose cp backups/culdesac-AAAA-MM-DD.dump db:/tmp/restore.dump
docker compose exec -T db pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists /tmp/restore.dump
docker compose up -d app
```

El fitxer és binari (`--format=custom`), per això es copia al contenidor en comptes de passar-lo per un pipe de PowerShell. Prova periòdicament una restauració en una base de dades no productiva.

## Updating the application

1. Fes un backup verificable.
2. Actualitza el codi (`git pull` o el teu mecanisme de release) i revisa els canvis de `.env.example`.
3. Executa `docker compose build`.
4. Executa `docker compose run --rm migrate` una sola vegada.
5. Executa `docker compose up -d app` i comprova `docker compose ps` i `/api/health`.
6. Si falla, conserva els logs amb `docker compose logs --tail=200 app migrate`; restaura el backup només si una migració ha canviat dades i el pla de recuperació ho requereix.

## Troubleshooting

### Exportar inscripcions a Excel

A **Backoffice → Torneig → Inscripcions**, selecciona el filtre desitjat i prem
**Exportar Excel**. Per gestionar només participants confirmats, tria **Pagada**.
La descàrrega inclou totes les inscripcions del filtre, ordenades per nom, en un
fitxer `.xlsx` amb el nom del torneig, el filtre i la data al nom del fitxer.

Inclou nom, nickname de Fortnite, Discord, contacte, DNI/NIE, codi postal, estat,
import, moneda, dates i codi d'inscripció. **Present** (Sí/No) i **Observacions**
queden buits perquè els àrbitres els emplenin a Excel; aquests canvis no es
retornen a l'app. Les capçaleres i les dues primeres columnes queden fixades,
i la taula té filtres. Les dates indiquen el fus `APP_TIMEZONE`.

La descàrrega requereix sessió d'administrador i no es desa a la carpeta pública
ni a la memòria cau. No cal cap migració: desplega el codi amb el `package-lock.json`
actualitzat i reconstrueix l'app per instal·lar la dependència ExcelJS.

### Correu de confirmació Culdesac

La plantilla HTML i el text alternatiu són a `src/lib/email/confirmation-template.ts`.
El webhook de pagament i el reenviament del backoffice utilitzen aquesta mateixa plantilla,
amb les dades reals de cada inscripció. El remitent continua sent `EMAIL_FROM` i les
respostes van a `culdesac@gamesportselectronics.cat`.

Previsualització local, sense enviar correus ni consultar/modificar la base de dades:

```bash
npx tsx scripts/preview-confirmation.ts
```

Obre `http://127.0.0.1:3100/`. Per enviar una mostra explícitament (Node 24):

```bash
node --env-file=.env --import tsx scripts/preview-confirmation.ts --send --to destinatari@example.com
```

La mostra utilitza les dades d'exemple del torneig de llançament, inclou `[MOSTRA]`
a l'assumpte i no crea inscripcions ni cobraments. Resend deduplica la mostra v1
per destinatari durant 24 hores. `--site-url https://culdesac.gsegames.com` permet
canviar la URL pública de la mostra; mai no s'utilitza localhost per a les seves imatges.

En producció, `APP_URL` ha de ser la URL pública HTTPS: el logotip PNG i els enllaços
del correu es resolen des d'aquesta URL. Per activar la plantilla, cal desplegar el
codi i reconstruir/recrear el contenidor de l'app. No requereix migracions ni noves claus.
La revisió visual local no substitueix comprovar la mostra rebuda a Gmail/Outlook.

### Incidències habituals

- **`migrate` no connecta:** comprova que `DATABASE_URL` usa l'host `db`, no `localhost`, i que la contrasenya URL-encoded coincideix amb `POSTGRES_PASSWORD`.
- **L'app queda unhealthy:** consulta `docker compose logs app`; `/api/health` també depèn d'una consulta mínima a PostgreSQL.
- **Stripe respon signatura invàlida:** utilitza el `whsec` que mostra el procés `stripe listen` actiu; no és la secret key `sk_test`.
- **No arriba l'email:** en local és esperat amb `EMAIL_MODE=console`; en producció verifica domini Resend, `EMAIL_FROM`, API key i logs `[email]`.
- **No pots entrar a l'admin:** torna a generar `ADMIN_PASSWORD_HASH`, comprova `ADMIN_EMAIL` i reinicia el contenidor després de canviar `.env`.
- **Port ocupat:** canvia `APP_PORT` o `POSTGRES_PORT` per desenvolupament. En producció no exposis PostgreSQL.
- **Capacitat:** és una dada operativa de l'MVP: mostra només pagaments confirmats, però no és una reserva distribuïda durant una cursa de checkouts.
