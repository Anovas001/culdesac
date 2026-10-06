# Enviament de participants a Challonge

La integració vincula un torneig ja creat a Challonge i hi publica totes les inscripcions **pagades i convidades** de Culdesac amb el nom visible **`Nickname Fortnite - Tag Discord`**, per exemple `Anovas - anovas`. L’exportació Excel continua disponible.

## Configuració

1. Entra amb el compte organitzador a https://challonge.com/settings/developer i genera/copia la **API v1 key**. S’utilitza amb l’API actual v2.1 i el header `Authorization-Type: v1`, tal com documenta Challonge: https://challonge.apidog.io/authorization-1726705m0.
2. Omple al `.env` local, i al del VPS quan despleguis:

   ```dotenv
   CHALLONGE_API_KEY=la_clau_del_compte_organitzador
   ```

   Aquesta clau és privada i només la llegeix el servidor. No utilitzis el prefix `NEXT_PUBLIC_`. La integració és opcional; si la variable queda buida, la resta de l’app funciona igual.

3. En local, recrea l’app perquè Docker carregui la variable nova:

   ```powershell
   docker compose -f compose.yml -f compose.dev.yml up -d --no-deps --force-recreate app
   ```

4. Crea a Challonge un torneig de prova amb format **Swiss**, sense iniciar-lo i sense bloquejar els participants. El compte de la clau ha de tenir permisos de gestió. Pots utilitzar un torneig personal o d’una comunitat amb subdomini `comunitat.challonge.com`.

## Prova local que farà l’organitzador

1. Entra a http://localhost:3000/admin i obre les inscripcions d’un torneig.
2. Al bloc «Participants a Challonge», enganxa l’enllaç i prem «Vincular torneig». Aquesta operació comprova el torneig, però encara no hi crea participants.
3. Crea dues invitacions amb dades diferents; les places han de quedar confirmades. Les invitacions no necessiten Stripe.
4. Prem «Enviar participants». S’envien totes les inscripcions PAID i INVITED d’aquell torneig, també les pagades que ja existien, encara que el llistat estigui filtrat per «Invitacions».
5. Obre Challonge i comprova que els noms tenen el format `Nickname Fortnite - Tag Discord`. A Culdesac apareix «Publicat a Challonge» a cada inscripció enviada i el recompte de publicats.
6. Prem «Comprovar participants» una altra vegada: no ha de crear duplicats. Crea una tercera invitació i envia-la; només ha d’afegir aquesta incorporació.
7. Un cop la llista sigui definitiva, revisa les rondes, la puntuació i els seeds a Challonge i inicia-hi el torneig. Culdesac no l’inicia automàticament.

La migració de la feature ja està aplicada a la base de dades local. Les dades artificials utilitzades en la bateria d’integració s’han retirat al final, conservant la participació original de l’organitzador.

## Decisions de funcionament

- Només l’admin pot vincular, desvincular o publicar. Les accions utilitzen les proteccions dels Server Actions de Next.js.
- S’envien el nickname de Fortnite i el tag de Discord junts al camp visible `name`, i un marcador opac `culdesac:<id_inscripció>` al camp `misc` per recuperar enviaments. No es transfereixen nom real, email, DNI ni telèfon. `username` queda sense enviar perquè és un usuari de Challonge, no el tag de Discord.
- El format combinat s’aplica a les altes noves. Les ja publicades es reconeixen pel seu ID i marcador encara que només mostrin el nickname antic; es conserva el nom remot per respectar els ajustos dels àrbitres.
- Abans de cada enviament es consulta la llista remota completa i es reconcilien els identificadors. Les altes s’envien en blocs de fins a 20, el màxim documentat per l’endpoint bulk. No es repeteix automàticament un POST si falla la connexió; un nou clic comprova primer què s’ha creat realment.
- Un bloqueig a PostgreSQL evita dos enviaments o canvis del vincle simultanis per al mateix torneig, també si hi ha diverses instàncies de l’app.
- Pots corregir o desvincular un enllaç abans del primer enviament. Després d’intentar publicar, el vincle queda fix per mantenir el seguiment, també si la resposta s’ha perdut. Un mateix torneig remot no pot estar vinculat a dos tornejos locals.
- Només es publica en estat `pending` de Challonge. Si ja s’ha iniciat, està en check-in o s’ha bloquejat la llista, cal gestionar-la a Challonge.
- Si s’ha eliminat o desactivat un participant publicat, hi ha un marcador duplicat o un nickname coincident introduït manualment, s’atura l’enviament i s’indica què cal revisar. No es buida ni se sobreescriu la llista remota.
- Si una inscripció publicada deixa d’estar confirmada, s’avisa al backoffice; l’àrbitre en gestiona la baixa a Challonge. Els canvis manuals de noms i seeds es conserven.
- Les proves unitàries simulen l’API. També s’ha verificat l’enviament real al torneig Swiss de test de l’organitzador, amb dades artificials i neteja posterior.

## Bateria real validada el 05/10/2026

13 comprovacions d’integració han passat contra PostgreSQL local i l’API real del torneig «CULDESAC TEST»:

- Enviament de 21 altes en blocs de 20+1, amb PAID i INVITED; exclusió de pendents i cancel·lades.
- Repetició sense duplicats, alta incremental i conservació exacta de nicknames Unicode.
- Doble clic concurrent amb el bloqueig real de PostgreSQL.
- Recuperació quan Challonge accepta l’alta però es perd la resposta, i quan falla el desament local dels identificadors. Els errors s’han injectat al comprovador després d’una alta remota real.
- Detecció de nicknames introduïts manualment, participants eliminats i marcadors remots duplicats.
- Avís de reemborsament, protecció del vincle i rebuig d’enllaços invàlids.
- HTTP 401 per a exportació sense sessió i HTTP 422 per a un formulari incomplet.
- Retirada de les 27 inscripcions artificials i tots els seus participants remots. La base local i Challonge han tornat a tenir només la participació original.

També han passat les 154 proves automatitzades, lint i typecheck; la pàgina d’inscripcions autenticada i l’Excel existent han retornat HTTP 200.

El comprovador reutilitzable és `scripts/verify-challonge-integration.ts`. Només s’executa amb `--run --tournament=<id_local>` en desenvolupament, exigeix que el torneig remot sigui un TEST Swiss sense iniciar i registra les dades pròpies de la prova a `tmp/challonge-integration-*.json` per facilitar-ne la neteja si hi ha una interrupció. No s’ha d’executar contra producció.

## Desplegament al VPS

Després de pujar el codi, afegeix `CHALLONGE_API_KEY` al `.env` del VPS, reconstrueix la imatge, aplica la migració additiva i recrea l’app:

```bash
docker compose build
docker compose run --rm migrate
docker compose up -d --no-deps --force-recreate app
```

No s’han de canviar les credencials de Stripe o Resend per utilitzar aquesta feature. No reutilitzis el mateix torneig de Challonge per a proves locals i producció.

## Límits de Challonge

La documentació indica un límit de 256 participants al pla Standard i 512 al Premier. El límit de participants és diferent del límit mensual de l’API: més de 500 peticions/mes requereixen un pla de pagament. Comprova el pla del compte per a un torneig de 512 persones.

- Formats i límits: https://docs.challonge.com/uk/features/tournaments
- API i autenticació: https://challonge.apidog.io/getting-started-1726706m0
- Alta en bloc: https://challonge.apidog.io/bulk-create-participants-23619754e0
- Comunitats: https://challonge.apidog.io/resource-scoping-1730219m0
