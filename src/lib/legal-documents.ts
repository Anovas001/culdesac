import type { Locale } from "./i18n/config";
import { privacyDocumentEs, termsDocumentEs } from "./legal-documents.es";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  items?: string[];
};

export type LegalDocument = {
  eyebrow: string;
  title: string;
  description: string;
  version: string;
  isDraft: boolean;
  sections: LegalSection[];
  references: Array<{ label: string; href: string }>;
};

export const termsDocument: LegalDocument = {
  eyebrow: "CONDICIONS DE PARTICIPACIÓ",
  title: "Termes i condicions",
  description: "Condicions generals d’accés, inscripció, pagament i participació en els tornejos organitzats sota la marca Culdesac.",
  version: "Versió 1.0 · En vigor des de l’11 de setembre de 2026",
  isDraft: false,
  sections: [
    {
      id: "organizer",
      title: "1. Identificació de l’organitzador",
      paragraphs: [
        "Els tornejos Culdesac són organitzats per GAMESPORTS ELECTRONICS, S.L., amb NIF B56924491 i domicili social al carrer Joan Oró i Florensa, 9, 25153 Puigverd de Lleida (Lleida). Correu electrònic: culdesac@gamesportselectronics.cat.",
        "Societat inscrita al Registre Mercantil de Lleida, tom 1710, foli 121, secció 8, full L-35402, inscripció 1a. Culdesac és el nom comercial utilitzat per presentar i gestionar les competicions.",
      ],
    },
    {
      id: "scope",
      title: "2. Objecte i acceptació",
      paragraphs: [
        "Aquests termes regulen la relació entre l’organitzador i qualsevol persona que s’inscrigui en un torneig publicat al web. Les dades específiques de cada edició —format, calendari, preu, places, premis i regles— formen part del contracte i completen aquestes condicions.",
        "En marcar la casella d’acceptació i formalitzar el pagament, la persona participant declara haver llegit i acceptat aquests termes, la Política de privacitat i les bases particulars mostrades a la fitxa del torneig. Les bases particulars prevalen en les qüestions purament competitives de l’edició; aquests termes prevalen en la resta, sense perjudici de la normativa imperativa.",
      ],
    },
    {
      id: "eligibility",
      title: "3. Requisits de participació",
      paragraphs: [
        "Poden participar-hi les persones de 12 anys o més que resideixin a Espanya i disposin de comptes operatius de Fortnite/Epic Games i Discord. La inscripció és personal i no es pot cedir sense autorització escrita de l’organitzador.",
        "Les persones menors de 18 anys han de tenir l’autorització expressa del pare, mare o representant legal, que Culdesac pot demanar que s’acrediti. En participants menors de 14 anys, el representant legal també ha d’autoritzar els tractaments basats en el consentiment. Qualsevol premi d’una persona menor s’abonarà al seu representant legal major d’edat, després de verificar-ne la identitat i la representació.",
      ],
    },
    {
      id: "registration",
      title: "4. Inscripció i veracitat de les dades",
      paragraphs: [
        "Per reservar plaça cal completar el formulari amb nom i cognoms, DNI/NIE, codi postal, correu electrònic, telèfon, tag de Discord i nickname de Fortnite, acceptar aquests termes i completar el pagament.",
        "La persona participant garanteix que les dades són exactes, actuals i pròpies. Cada persona només pot disposar d’una inscripció per torneig. L’organitzador pot demanar una verificació raonable d’identitat, edat o autorització abans de competir o lliurar un premi.",
      ],
    },
    {
      id: "payment",
      title: "5. Preu i pagament",
      paragraphs: [
        "El preu final de cada torneig, impostos inclosos quan correspongui, es mostra abans del botó de pagament. D’aquest import, 0,50 € corresponen a despeses de gestió. El cobrament es processa mitjançant Stripe; Culdesac no emmagatzema les dades completes de la targeta.",
        "La plaça només queda confirmada quan el pagament consta com a completat. La persona participant rep una confirmació al correu indicat. Si el pagament falla o caduca, la reserva no es considera formalitzada.",
      ],
    },
    {
      id: "withdrawal",
      title: "6. Desistiment, cancel·lacions i devolucions",
      paragraphs: [
        "La inscripció correspon a una activitat d’esbarjo prevista per a una data o període d’execució específics. En conseqüència, resulta aplicable l’excepció al dret de desistiment prevista per la normativa de consum per a aquests serveis. Si la persona participant cancel·la o no es presenta, la inscripció no és reemborsable, inclosos els 0,50 € de despeses de gestió, sense perjudici dels drets imperatius que legalment li corresponguin.",
        "Si Culdesac canvia la data, la inscripció i el pagament continuen sent vàlids per a la nova convocatòria, que es comunicarà pels canals disponibles. Si el canvi és substancial, es respectaran els drets que reconegui la normativa imperativa de consum.",
        "Si Culdesac cancel·la definitivament el torneig i no el reprograma, retornarà l’import abonat pel mateix mitjà de pagament, sense demora indeguda i, en qualsevol cas, en un màxim de 60 dies naturals, llevat que la normativa aplicable exigeixi un termini inferior.",
      ],
    },
    {
      id: "competition-rules",
      title: "7. Format i regles de competició",
      paragraphs: [
        "Cada edició es regeix per les bases específiques que es mostren a la seva fitxa i durant el procés d’inscripció. Aquestes bases indiquen el format, la plataforma, la regió del servidor, els horaris, el sistema de resultats, els desempats i els canals d’assistència. Quan no existeixi un document separat, la informació publicada a la fitxa del torneig constitueix les seves bases particulars.",
        "És responsabilitat de cada participant connectar-se puntualment, mantenir operatius els seus comptes i consultar les comunicacions enviades per correu o Discord.",
      ],
    },
    {
      id: "conduct",
      title: "8. Conducta, joc net i desqualificació",
      paragraphs: [
        "Es prohibeixen les trampes, l’explotació deliberada d’errors, la suplantació d’identitat, els acords per alterar resultats, l’assetjament i qualsevol conducta contrària a les regles de Fortnite, Epic Games o Discord.",
        "Davant d’una incidència, l’organitzador pot investigar, demanar proves i aplicar mesures proporcionades, inclosa la desqualificació. Les reclamacions sobre resultats s’han de presentar mitjançant un ticket al Discord oficial dins dels 30 minuts següents a l’hora indicada a la convocatòria corresponent. L’organització revisarà les proves disponibles i comunicarà la decisió pel mateix canal.",
      ],
    },
    {
      id: "prizes",
      title: "9. Premis",
      paragraphs: [
        "Els premis, els criteris d’adjudicació i el termini de lliurament consten a les bases de cada torneig. Per rebre’ls, la persona guanyadora —o el seu representant legal si és menor— ha d’acreditar la identitat i facilitar les dades fiscals i bancàries estrictament necessàries.",
        "Culdesac practicarà sobre l’import del premi les retencions fiscals que corresponguin segons la legislació vigent. La persona perceptora és responsable de la resta d’obligacions tributàries que li siguin aplicables. Els premis no es poden substituir ni transferir, llevat que les bases particulars ho permetin.",
      ],
    },
    {
      id: "image-rights",
      title: "10. Retransmissions, imatge i continguts",
      paragraphs: [
        "Culdesac preveu retransmetre i enregistrar els quarts de final, les semifinals i les finals als seus canals oficials, així com permetre retransmissions simultànies en canals de co-stream autoritzats. Aquest contingut pot mostrar el nickname, la veu i la imatge de les persones participants i pot romandre publicat com a arxiu de la competició de manera indefinida.",
        "En acceptar la Política de privacitat durant la inscripció, la persona participant manifesta que ha estat informada i autoritza expressament l’ús del seu nickname, veu i imatge per a aquestes retransmissions i enregistraments. En el cas de menors, el pare, mare o representant legal també ha d’autoritzar la participació i aquest ús. La retirada del consentiment produirà efectes per als usos futurs i serà atesa en la mesura tècnica i legalment possible, sense afectar els usos previs lícits.",
        "Fortnite, Epic Games i les marques relacionades pertanyen als seus titulars. Culdesac i els seus tornejos no estan patrocinats, avalats ni administrats per Epic Games, ni hi estan associats, llevat que s’indiqui expressament el contrari.",
      ],
    },
    {
      id: "liability",
      title: "11. Incidències tècniques i responsabilitat",
      paragraphs: [
        "Culdesac adoptarà mesures raonables per gestionar el torneig, però no respon d’interrupcions atribuïbles a la connexió o equip del participant, a serveis de tercers o a causes de força major, sense perjudici de les responsabilitats que legalment no es puguin excloure.",
        "Davant d’una incidència general, l’organitzador pot pausar, reprogramar o adaptar una ronda, comunicant la decisió pel canal oficial i aplicant criteris coherents i no discriminatoris.",
      ],
    },
    {
      id: "changes",
      title: "12. Modificacions i cancel·lació del torneig",
      paragraphs: [
        "L’organitzador pot introduir canvis necessaris per motius operatius, de seguretat o de força major. Els canvis essencials es comunicaran amb antelació raonable i mai no reduiran drets imperatius.",
        "Una reprogramació conserva la plaça de la persona participant. Si el torneig es cancel·la definitivament, s’aplica el reemborsament previst a l’apartat 6.",
      ],
    },
    {
      id: "privacy",
      title: "13. Protecció de dades",
      paragraphs: [
        "El tractament de dades personals es detalla a la Política de privacitat de Culdesac. La seva acceptació inclou l’autorització de retransmissió descrita a l’apartat 10. El consentiment per rebre comunicacions comercials es demana mitjançant una casella independent i es pot retirar en qualsevol moment.",
      ],
    },
    {
      id: "law-contact",
      title: "14. Llei aplicable, reclamacions i contacte",
      paragraphs: [
        "Aquests termes es regeixen per la normativa espanyola i europea aplicable. Les parts intentaran resoldre de bona fe qualsevol conflicte. Si no és possible, seran competents els jutjats que determini la normativa, respectant sempre el fur imperatiu de la persona consumidora.",
        "Per a consultes o reclamacions, pots escriure a culdesac@gamesportselectronics.cat, obrir un ticket al Discord oficial o dirigir-te per correu postal a GAMESPORTS ELECTRONICS, S.L., carrer Joan Oró i Florensa, 9, 25153 Puigverd de Lleida (Lleida).",
      ],
    },
  ],
  references: [
    { label: "Llei de serveis de la societat de la informació (BOE)", href: "https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758" },
    { label: "Text de defensa de consumidors i usuaris (BOE)", href: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555" },
    { label: "Dret a l’honor, intimitat i pròpia imatge (BOE)", href: "https://www.boe.es/buscar/act.php?id=BOE-A-1982-11196" },
    { label: "Inscripció de GAMESPORTS ELECTRONICS, S.L. (BORME)", href: "https://www.boe.es/diario_borme/txt.php?id=BORME-A-2024-25-25" },
  ],
};

export const privacyDocument: LegalDocument = {
  eyebrow: "TRANSPARÈNCIA I DADES",
  title: "Política de privacitat",
  description: "Informació sobre com recollim, utilitzem, protegim i conservem les dades de participants i persones usuàries de Culdesac.",
  version: "Versió 1.0 · En vigor des de l’11 de setembre de 2026",
  isDraft: false,
  sections: [
    {
      id: "controller",
      title: "1. Responsable del tractament",
      paragraphs: [
        "El responsable del tractament és GAMESPORTS ELECTRONICS, S.L., amb NIF B56924491 i domicili social al carrer Joan Oró i Florensa, 9, 25153 Puigverd de Lleida (Lleida). Correu de privacitat: administracio@gamesportselectronics.cat.",
        "No s’ha designat un delegat de protecció de dades perquè, d’acord amb l’activitat i els tractaments actuals, no resulta obligatori. Pots adreçar qualsevol qüestió de privacitat al correu indicat.",
      ],
    },
    {
      id: "data",
      title: "2. Quines dades tractem",
      paragraphs: ["Recollim les dades que facilites i les dades tècniques necessàries per prestar, protegir i acreditar el servei."],
      items: [
        "Identificació: nom i cognoms, DNI/NIE i, si escau, dades del representant legal.",
        "Contacte i localització general: correu electrònic, telèfon i codi postal.",
        "Identitat de joc: tag de Discord i nickname de Fortnite/Epic Games.",
        "Inscripció i pagament: torneig, import, estat, identificadors de la sessió de Stripe, dates i confirmació enviada. Culdesac no rep les dades completes de la targeta.",
        "Dades tècniques i de seguretat: adreça IP, data i hora, URL i resultat de la petició, navegador o agent d’usuari, quan constin als registres tècnics del servidor.",
        "Competició i contingut: resultats, incidències, proves aportades, nickname i, a les rondes retransmeses, veu i imatge.",
        "Premis: dades identificatives, de representació, fiscals i bancàries necessàries per acreditar i abonar el premi.",
      ],
    },
    {
      id: "purposes",
      title: "3. Per a què utilitzem les dades",
      paragraphs: ["Tractem les dades per a les finalitats següents:"],
      items: [
        "Gestionar la inscripció, el pagament, l’accés i les comunicacions operatives del torneig.",
        "Identificar la persona participant i evitar inscripcions duplicades, suplantacions o usos fraudulents.",
        "Organitzar les partides, publicar resultats, resoldre incidències i reclamacions i lliurar premis.",
        "Retransmetre i conservar l’arxiu audiovisual dels quarts de final, les semifinals i les finals, quan existeixi la base jurídica o l’autorització necessària.",
        "Complir obligacions comptables, fiscals, de consum i altres obligacions legals.",
        "Protegir la plataforma i acreditar l’acceptació de les condicions.",
        "Enviar novetats i comunicacions comercials de Culdesac únicament quan s’hagi marcat la casella opcional i separada de màrqueting al formulari d’inscripció. Acceptar la Política de privacitat o inscriure’s en un torneig no implica consentir màrqueting.",
      ],
    },
    {
      id: "legal-bases",
      title: "4. Bases jurídiques",
      paragraphs: [
        "La inscripció, el pagament, les comunicacions operatives i la gestió competitiva necessària es basen en l’execució del contracte. Les obligacions comptables, fiscals, de consum i els requeriments d’autoritats es basen en el compliment d’obligacions legals.",
        "La seguretat, la prevenció del frau i la defensa davant reclamacions es basen en l’interès legítim de Culdesac, després de ponderar els drets de les persones afectades. La retransmissió del nickname, la imatge i la veu es basa en l’autorització expressa inclosa en l’acceptació de la Política de privacitat; el màrqueting es basa en un consentiment independent, específic i revocable.",
      ],
    },
    {
      id: "required-data",
      title: "5. Dades obligatòries",
      paragraphs: [
        "Els camps marcats com a obligatoris són necessaris per tramitar la inscripció. Si no els facilites, no podrem reservar la plaça ni gestionar la participació.",
        "El DNI/NIE es demana per comprovar la identitat i impedir múltiples inscripcions per persona. No enviem aquest número a Stripe ni l’incloem al correu de confirmació.",
      ],
    },
    {
      id: "recipients",
      title: "6. Destinataris i proveïdors",
      paragraphs: [
        "No venem les teves dades. Hi poden accedir proveïdors subjectes a contractes de protecció de dades i només en la mesura necessària per prestar el servei.",
      ],
      items: [
        "Stripe, per processar pagaments, autenticar operacions i prevenir el frau, en els termes de la seva política de privacitat.",
        "Resend (Plus Five Five, Inc.), per enviar confirmacions i avisos per correu electrònic.",
        "Contabo GmbH, com a proveïdor d’allotjament i infraestructura, amb el servidor configurat en una regió de la Unió Europea.",
        "Plataformes de streaming i co-streamers autoritzats, quan es publiquin nickname, veu, imatge o resultats de les rondes retransmeses.",
        "Administracions, jutjats i autoritats quan una norma o requeriment vàlid ho exigeixi.",
        "Culdesac no comunica directament les dades d’inscripció a Discord ni a Epic Games. L’ús que cada participant faci dels seus comptes es regeix per la relació pròpia amb aquestes plataformes.",
      ],
    },
    {
      id: "transfers",
      title: "7. Transferències internacionals",
      paragraphs: [
        "La infraestructura principal de Contabo està configurada dins de la Unió Europea. Stripe presta els seus serveis a l’Espai Econòmic Europeu a través de les entitats indicades al seu avís de privacitat i pot utilitzar entitats del grup o proveïdors d’altres països. Resend és una empresa dels Estats Units i processa principalment dades en aquest país.",
        "Quan hi hagi tractament fora de l’Espai Econòmic Europeu, Culdesac o el proveïdor aplicarà un mecanisme admès pel RGPD, com una decisió d’adequació, el Marc de Privacitat de Dades UE-EUA quan sigui aplicable o les clàusules contractuals tipus de la Comissió Europea, a més de les garanties complementàries necessàries.",
      ],
    },
    {
      id: "retention",
      title: "8. Durant quant temps conservem les dades",
      paragraphs: [
        "Les dades d’inscripció, participació i verificació es conserven mentre es gestiona el torneig i, un cop acabat, fins a cinc anys per atendre obligacions contractuals o reclamacions. La documentació comptable, fiscal i de pagament es conserva durant sis anys. Les incidències i reclamacions es conserven durant cinc anys des del seu tancament, amb accés restringit quan ja no calgui utilitzar-les activament.",
        "Els registres tècnics i de seguretat es conserven com a màxim dotze mesos, excepte si cal preservar-los durant més temps per investigar una incidència o complir una obligació legal. Les dades de màrqueting es conserven fins que retiris el consentiment o després de dos anys d’inactivitat.",
        "Els enregistraments i publicacions de competició poden romandre accessibles de manera indefinida com a arxiu històric mentre es mantingui aquesta finalitat i la base jurídica aplicable. Això no converteix el consentiment en irrevocable: les sol·licituds de retirada o oposició s’analitzaran segons el cas i s’actuarà en la mesura tècnica i legalment possible.",
        "Quan finalitzen els terminis aplicables, les dades s’eliminen o queden bloquejades exclusivament per atendre possibles responsabilitats legals durant el termini de prescripció.",
      ],
    },
    {
      id: "minors",
      title: "9. Persones menors d’edat",
      paragraphs: [
        "La participació està limitada a persones de 12 anys o més. Les persones menors de 18 anys han de disposar de l’autorització del pare, mare o representant legal, que Culdesac pot verificar. Els premis de participants menors s’abonen al representant legal major d’edat després d’acreditar aquesta condició.",
        "En el cas de menors de catorze anys, el consentiment per tractar dades l’ha de prestar el titular de la pàtria potestat o tutela. Les autoritzacions d’imatge i veu de menors es gestionaran amb les garanties reforçades que exigeix la normativa i tenint sempre en compte l’interès superior del menor.",
      ],
    },
    {
      id: "rights",
      title: "10. Els teus drets",
      paragraphs: [
        "Pots sol·licitar l’accés, la rectificació, la supressió, l’oposició, la limitació i la portabilitat de les teves dades, així com retirar un consentiment sense afectar la licitud del tractament anterior. Quan el tractament es basi en l’interès legítim, també pots oposar-t’hi per motius relacionats amb la teva situació particular.",
        "Envia la sol·licitud a administracio@gamesportselectronics.cat indicant quin dret vols exercir. Podrem demanar informació addicional només quan sigui necessària per verificar la identitat. Respondrem dins del termini legal. També pots presentar una reclamació davant l’Agència Espanyola de Protecció de Dades a www.aepd.es.",
      ],
    },
    {
      id: "security",
      title: "11. Seguretat",
      paragraphs: [
        "Apliquem mesures tècniques i organitzatives proporcionades al risc per limitar l’accés, evitar pèrdues i protegir la confidencialitat de les dades. L’accés al backoffice està restringit a personal autoritzat.",
        "Cap sistema és infal·lible. Si es produeix una bretxa amb risc per a les persones afectades, actuarem d’acord amb les obligacions de notificació i comunicació aplicables.",
      ],
    },
    {
      id: "automated",
      title: "12. Decisions automatitzades, analítica i galetes",
      paragraphs: [
        "No prenem decisions exclusivament automatitzades amb efectes jurídics o similars ni elaborem perfils sobre les persones participants.",
        "Actualment no utilitzem Google Analytics, Meta Pixel ni altres eines d’analítica publicitària. El web només utilitza emmagatzematge o galetes tècniques necessàries, com la preferència d’idioma i les associades a la sessió d’administració. En accedir a la passarel·la de Stripe, aquest proveïdor pot utilitzar les seves pròpies tecnologies segons la seva política. Si en el futur incorporem galetes no necessàries, oferirem informació específica i un mecanisme per acceptar-les o rebutjar-les abans d’instal·lar-les.",
      ],
    },
    {
      id: "updates-contact",
      title: "13. Canvis i contacte",
      paragraphs: [
        "Podem actualitzar aquesta política per reflectir canvis legals o del servei. Quan el canvi sigui rellevant, l’anunciarem de manera visible i actualitzarem la data de vigència.",
        "Per a qualsevol consulta de privacitat, contacta amb administracio@gamesportselectronics.cat o escriu a GAMESPORTS ELECTRONICS, S.L., carrer Joan Oró i Florensa, 9, 25153 Puigverd de Lleida (Lleida). Per a atenció general o reclamacions, pots escriure a culdesac@gamesportselectronics.cat o utilitzar el Discord oficial.",
      ],
    },
  ],
  references: [
    { label: "Reglament general de protecció de dades (EUR-Lex)", href: "https://eur-lex.europa.eu/legal-content/CA/TXT/?uri=CELEX:32016R0679" },
    { label: "Llei orgànica 3/2018 de protecció de dades (BOE)", href: "https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673" },
    { label: "Dret d’informació (AEPD)", href: "https://www.aepd.es/derechos-y-deberes/conoce-tus-derechos/derecho-de-informacion" },
    { label: "Privacitat i transferències de Stripe", href: "https://stripe.com/legal/privacy-center" },
    { label: "Acord de tractament de dades de Resend", href: "https://resend.com/legal/dpa" },
    { label: "Protecció de dades de Contabo", href: "https://contabo.com/en/legal/privacy/" },
  ],
};

export function getTermsDocument(locale: Locale): LegalDocument {
  return locale === "es" ? termsDocumentEs : termsDocument;
}

export function getPrivacyDocument(locale: Locale): LegalDocument {
  return locale === "es" ? privacyDocumentEs : privacyDocument;
}
