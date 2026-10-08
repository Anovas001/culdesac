# Gestió de participacions i reinici de Challonge

## Editar i eliminar des del backoffice

A «Inscripcions», cada participació té els botons **Editar** i **Eliminar**.

- **Editar:** permet corregir nom i cognoms, nickname de Fortnite i usuari de Discord. Es valida la longitud dels camps i s’impedeix que dues inscripcions del mateix torneig tinguin el mateix nickname de Fortnite. Es conserven estat, import, pagament, consentiments, correu i identificadors remots.
- **Eliminar:** obre una pàgina amb les dades del participant i demana confirmar l’eliminació. Esborra definitivament la fila de Culdesac; deixa de comptar a l’aforament, al dashboard, a l’Excel i als pròxims enviaments. No és una cancel·lació ni un canvi d’estat.

Només l’administrador pot fer aquestes operacions. No hi ha bloquejos per l’estat del torneig ni pel fet d’haver publicat la participació. No s’envien correus ni es fan reemborsaments o modificacions de Challonge automàticament. Si cal un reemborsament o cancel·lar un Checkout pendent, l’organitzador ho gestiona a Stripe.

Si una notificació de pagament arriba després d’haver eliminat una participació, s’accepta sense recrear-la ni enviar-ne la confirmació. Les notificacions ja processades també es reconeixen sense tornar a consultar aquella participació.

## Per què buidar Challonge no és suficient

Culdesac guarda `Registration.challongeParticipantId` i `challongePublishedAt` per saber quina inscripció correspon a cada participant remot. També guarda les dates i l’últim error de sincronització al torneig. No és una còpia del quadre: són vincles i metadades d’enviament.

Si s’elimina un participant a Challonge, el seu ID continua aquí. La sincronització detecta que aquell participant ha desaparegut i s’atura. Si es buida tota la llista de Challonge, cal reiniciar aquests vincles locals abans de tornar a publicar.

## Reiniciar el torneig que s’ha buidat manualment

1. A Challonge, deixa el torneig sense participants i sense iniciar, en estat `pending`. No cal eliminar el torneig ni canviar-ne l’enllaç.
2. A Culdesac, corregeix i elimina les participacions que calgui.
3. Copia l’ID **del torneig de Culdesac**, que apareix a l’URL del backoffice: `/admin/tournaments/ID_DEL_TORNEIG/registrations`. No és l’ID numèric de Challonge.
4. A la base de dades corresponent (la del VPS si el problema és a producció), substitueix `ID_DEL_TORNEIG` en les dues instruccions següents pel mateix ID i executa-les juntes. És una operació única per al torneig que s’ha buidat; no s’ha executat automàticament des de local.

Si el VPS utilitza el `compose.yml` del projecte, des de la carpeta del desplegament pots obrir PostgreSQL amb:

```sh
docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

Després enganxa el SQL amb l’ID correcte. En acabar, `\q` tanca la consola de PostgreSQL.

```sql
BEGIN;

UPDATE "Registration"
SET "challongeParticipantId" = NULL,
    "challongePublishedAt" = NULL
WHERE "tournamentId" = 'ID_DEL_TORNEIG';

UPDATE "Tournament"
SET "challongePublishAttemptedAt" = NULL,
    "challongeLastSyncedAt" = NULL,
    "challongeLastError" = NULL
WHERE "id" = 'ID_DEL_TORNEIG';

COMMIT;
```

Aquest SQL no elimina inscripcions, no modifica estats, imports o pagaments i conserva `challongeTournamentId`, `challongeUrl` i `challongeCommunity`. Per tant, el torneig continua vinculat.

5. Actualitza el llistat del backoffice: les confirmades han de tornar a aparèixer com a pendents d’enviar a Challonge.
6. Quan l’organitzador tingui la llista definitiva, prem **Enviar participants**. Es publicaran les pagades i convidades amb el format `Nickname Fortnite - Tag Discord` i es guardaran els nous identificadors remots.

Cal reiniciar els vincles només després de buidar la llista remota. Reiniciar-los amb participants antics encara a Challonge pot fer que la sincronització recuperi els seus marcadors antics o detecti conflictes, en lloc de crear la nova llista.

## Desplegament

Aquesta ampliació no requereix migracions: utilitza els camps que ja existeixen. Desplega el codi i reconstrueix/recrea l’app amb el procediment habitual. El SQL anterior és una conciliació puntual de dades, no una migració.
