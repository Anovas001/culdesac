# Invitacions administratives

## Objectiu i decisions

Crear participacions gratuïtes només des del backoffice, al torneig seleccionat. Estat `INVITED`, import zero, sense sessió Stripe ni data de pagament. No convertir registres existents: qualsevol coincidència de correu, DNI o nickname s'ha de revisar, encara que estigui pendent o caducada.

Permetre altes en tornejos oberts o tancats (gestió interna), però no en esborranys o finalitzats. Respectar l'aforament de places confirmades (PAID + INVITED); no reservar les pendents de pagament. Transacció serialitzable per impedir que dues invitacions simultànies superin l'aforament. El flux públic de pagament manté la seva política d'aforament existent.

Mateixa validació de dades que el formulari públic. L'admin confirma que disposa de l'acceptació dels termes i informació de privacitat del participant; màrqueting separat i desmarcat. No enviar email automàtic: botó explícit al llistat, amb confirmació adaptada a invitació.

## Pla de treball

- [x] Escriure i executar proves de l'alta gratuïta, estats permesos, duplicats, aforament, protecció d'invitats al checkout públic, filtres, recompte, Excel i email.
- [x] Afegir enum i migració a `prisma/`; servei a `src/services/registrations/invitations.ts` i adaptador transaccional.
- [x] Afegir acció protegida i formulari a `/admin/tournaments/[id]/registrations/invite`, amb errors de camp i conservació de dades.
- [x] Actualitzar dashboard, llistat, recompte, exportació i confirmació de correu. No alterar el flux Stripe ni la landing.
- [x] Executar tests, lint, typecheck i build. Aixecar Docker local, aplicar migració i provar alta i duplicat sobre PostgreSQL local; provar l'Excel automàticament.
- [x] Deixar serveis locals en marxa i explicar la prova manual i el pas de migració per a producció.

No modificar producció ni enviar correus reals durant les proves. L'usuari ha autoritzat posteriorment el commit i el push de la funcionalitat.

## Resultat de verificació

- Implementació revisada independentment, sense incidències detectades.
- 89 proves automatitzades superades; lint dels fitxers modificats superat.
- Migració aplicada al PostgreSQL local. Prova sobre base de dades real superada: alta, duplicats, límit d'aforament amb concurrència, protecció del checkout i altes en torneig tancat. Les dades temporals d'aquesta prova s'han eliminat.
- Aplicació local oberta al port 3000 i PostgreSQL saludable al 5433. Login, llistat i pàgina d'invitacions responen HTTP 200.
- Build de producció completada correctament, inclosa la ruta nova d'invitacions. El desplegament a producció queda a càrrec de l'usuari.
- La prova interactiva del formulari queda a càrrec de l'usuari, tal com ha demanat.

## Prova manual

Entrar a `/admin`, seleccionar un torneig obert o tancat i clicar **Afegir invitació**. Emplenar les dades i les confirmacions del participant. La inscripció apareixerà com a **Invitació**, gratuïta, dins de **Confirmades**. L'Excel del filtre **Confirmades** inclou pagades i convidades. **Enviar confirmació** envia el correu expressament; l'alta no n'envia cap automàticament.

Quan s'aprovi el desplegament a producció, cal incloure la migració `20260928120000_add_invited_registration_status` i executar `prisma migrate deploy` amb el servei de migracions abans d'utilitzar la nova versió de l'app. No calen claus ni configuració de Stripe noves.
