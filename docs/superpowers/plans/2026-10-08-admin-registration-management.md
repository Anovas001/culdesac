# Edició i eliminació de participacions

**Objectiu aprovat:** L’admin pot editar nom complet, nickname de Fortnite i usuari de Discord, i eliminar definitivament una inscripció. No s’introdueixen bloquejos per estat del torneig, pagament o publicació a Challonge. L’organitzador revisa la llista abans d’enviar-la.

**Disseny:** Pàgines protegides d’edició i confirmació d’eliminació accessibles des de cada fila. Server Actions autenticades, validació i serveis amb persistència Prisma sempre delimitada al torneig i la inscripció. L’edició només modifica les dades de perfil i la normalització del nickname; no toca pagament, imports, consentiments ni IDs remots. L’eliminació esborra la fila, no reemborsa ni contacta Challonge. Les accions refresquen dashboard, llistat i aforament públic.

**Conciliació:** Es conserva la sincronització actual. Es documenta un reset transaccional dels IDs remots exclusivament per al torneig que l’organitzador hagi buidat manualment a Challonge; no s’executa sobre dades de producció des d’aquest entorn.

- [x] Proves de validació, nom duplicat, delimitació de torneig, conservació dels camps sensibles i eliminació literal.
- [x] Implementar `src/services/registrations/admin-management.ts`, `admin-management-repository.ts`, i `src/app/admin/registration-actions.ts` amb proves d’autenticació i validació.
- [x] Afegir formularis i pàgines `registrations/[registrationId]/edit` i `/delete`, i botons al llistat.
- [x] Comprovar que les notificacions repetides o tardanes de Stripe d’una inscripció eliminada no la recreïn ni enviïn correus.
- [x] Documentar el flux i el SQL de reset de Challonge delimitat a un ID de torneig, mantenint pagaments i configuració.
- [x] Executar proves, lint, tipus i build; conservar els canvis locals sense commit/push.

Verificació: 186 proves en 42 fitxers, lint, typecheck i build correctes. Revisió crítica completada. No s’han modificat dades reals ni fet operacions a Challonge/Stripe. La prova de navegador i base de dades queda pendent: Docker Desktop no està en execució.
