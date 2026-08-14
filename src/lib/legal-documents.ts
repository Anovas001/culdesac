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
  version: "Esborrany · versió 0.1 · [[DATA D’ENTRADA EN VIGOR]]",
  isDraft: true,
  sections: [
    {
      id: "organizer",
      title: "1. Identificació de l’organitzador",
      paragraphs: [
        "Els tornejos Culdesac són organitzats per [[RAÓ SOCIAL]], amb NIF/CIF [[NIF/CIF]], domicili a [[DOMICILI SOCIAL COMPLET]] i correu de contacte [[CORREU LEGAL]].",
        "Dades registrals, si escau: [[REGISTRE MERCANTIL, TOM, FOLI I FULL]]. Culdesac és el nom comercial utilitzat per presentar i gestionar les competicions.",
      ],
    },
    {
      id: "scope",
      title: "2. Objecte i acceptació",
      paragraphs: [
        "Aquests termes regulen la relació entre l’organitzador i qualsevol persona que s’inscrigui en un torneig publicat al web. Les dades específiques de cada edició —format, calendari, preu, places i premi— completen aquestes condicions.",
        "En marcar la casella d’acceptació i formalitzar el pagament, la persona participant declara haver llegit i acceptat aquests termes i les regles particulars del torneig. Si hi ha contradicció, [[ORDRE DE PREVALENÇA ENTRE BASES I TERMES]].",
      ],
    },
    {
      id: "eligibility",
      title: "3. Requisits de participació",
      paragraphs: [
        "Pot participar-hi qualsevol persona que compleixi l’edat mínima de [[EDAT MÍNIMA]], resideixi a [[ÀMBIT TERRITORIAL]] i disposi d’un compte de Fortnite/Epic Games i Discord operatius.",
        "Les persones menors d’edat hauran de comptar amb [[TIPUS D’AUTORITZACIÓ DEL PARE, MARE O TUTOR I PROCEDIMENT]]. La inscripció és personal i no es pot cedir sense autorització escrita de l’organitzador.",
      ],
    },
    {
      id: "registration",
      title: "4. Inscripció i veracitat de les dades",
      paragraphs: [
        "Per reservar plaça cal completar el formulari amb nom i cognoms, DNI/NIE, codi postal, correu electrònic, tag de Discord i nickname de Fortnite, acceptar aquests termes i completar el pagament.",
        "La persona participant garanteix que les dades són exactes, actuals i pròpies. Cada persona només pot disposar d’una inscripció per torneig. L’organitzador pot demanar una verificació raonable d’identitat abans de competir o lliurar un premi.",
      ],
    },
    {
      id: "payment",
      title: "5. Preu i pagament",
      paragraphs: [
        "El preu final de cada torneig, impostos inclosos quan correspongui, es mostra abans del botó de pagament. El cobrament es processa mitjançant Stripe; Culdesac no emmagatzema les dades completes de la targeta.",
        "La plaça només queda confirmada quan el pagament consta com a completat. La persona participant rep una confirmació al correu indicat. Si el pagament falla o caduca, la reserva no es considera formalitzada.",
      ],
    },
    {
      id: "withdrawal",
      title: "6. Desistiment, cancel·lacions i devolucions",
      paragraphs: [
        "La política aplicable abans de l’inici del torneig és: [[TERMINI I PROCEDIMENT PER CANCEL·LAR LA INSCRIPCIÓ I SOL·LICITAR UNA DEVOLUCIÓ]].",
        "Cal confirmar amb assessorament jurídic si, per tractar-se d’un servei relacionat amb una activitat d’esbarjo amb data d’execució específica, resulta aplicable alguna excepció legal al dret de desistiment. Aquesta versió no limita cap dret imperatiu de les persones consumidores.",
        "Si Culdesac cancel·la definitivament una edició, s’aplicarà [[DEVOLUCIÓ TOTAL / REPROGRAMACIÓ / ALTRES OPCIONS I TERMINIS]].",
      ],
    },
    {
      id: "competition-rules",
      title: "7. Format i regles de competició",
      paragraphs: [
        "Cada edició es regeix per les seves bases específiques, disponibles a [[URL O DOCUMENT DE BASES]]. Aquestes bases han d’indicar com a mínim el format, plataforma, regió de servidor, horaris, sistema de resultats, desempat i canals d’assistència.",
        "És responsabilitat de cada participant connectar-se puntualment, mantenir operatius els seus comptes i consultar les comunicacions enviades per correu o Discord.",
      ],
    },
    {
      id: "conduct",
      title: "8. Conducta, joc net i desqualificació",
      paragraphs: [
        "Es prohibeixen les trampes, l’explotació deliberada d’errors, la suplantació d’identitat, els acords per alterar resultats, l’assetjament i qualsevol conducta contrària a les regles de Fortnite, Epic Games o Discord.",
        "Davant d’una incidència, l’organitzador podrà investigar, demanar proves i aplicar mesures proporcionades, inclosa la desqualificació. El procediment de reclamació serà [[CANAL, TERMINI I SISTEMA DE REVISIÓ]].",
      ],
    },
    {
      id: "prizes",
      title: "9. Premis",
      paragraphs: [
        "Els premis, criteris d’adjudicació i termini de lliurament constaran a les bases de cada torneig. Per rebre’ls, la persona guanyadora haurà d’acreditar la seva identitat i facilitar les dades estrictament necessàries.",
        "El tractament fiscal dels premis, les possibles retencions i les obligacions de la persona guanyadora seran [[TRACTAMENT FISCAL I RESPONSABLE DE LES RETENCIONS]]. Els premis no es poden substituir o transferir excepte quan les bases ho permetin.",
      ],
    },
    {
      id: "image-rights",
      title: "10. Retransmissions, imatge i continguts",
      paragraphs: [
        "Les partides poden ser retransmeses o enregistrades només en les condicions següents: [[CANALS, ABAST, DURADA I BASE LEGAL DE L’ÚS D’IMATGE, VEU I NICKNAME]]. Quan calgui consentiment, se sol·licitarà de manera separada i específica.",
        "La participació no transfereix a Culdesac la propietat dels comptes ni dels continguts de tercers. Fortnite, Epic Games i les marques relacionades pertanyen als seus titulars respectius; [[TEXT DE NO AFILIACIÓ EXIGIT PER LES BASES D’EPIC]].",
      ],
    },
    {
      id: "liability",
      title: "11. Incidències tècniques i responsabilitat",
      paragraphs: [
        "Culdesac adoptarà mesures raonables per gestionar el torneig, però no respon d’interrupcions atribuïbles a la connexió o equip del participant, a serveis de tercers o a causes de força major, sense perjudici de les responsabilitats que legalment no es puguin excloure.",
        "Davant d’una incidència general, l’organitzador podrà pausar, reprogramar o adaptar una ronda, comunicant la decisió pel canal oficial i aplicant criteris coherents i no discriminatoris.",
      ],
    },
    {
      id: "changes",
      title: "12. Modificacions i cancel·lació del torneig",
      paragraphs: [
        "L’organitzador pot introduir canvis necessaris per motius operatius, de seguretat o de força major. Els canvis essencials es comunicaran amb antelació raonable i mai no reduiran drets imperatius.",
        "Quan un canvi alteri substancialment el servei contractat, s’oferirà [[OPCIÓ DE REEMBORSAMENT O ALTERNATIVA]].",
      ],
    },
    {
      id: "privacy",
      title: "13. Protecció de dades",
      paragraphs: [
        "El tractament de dades personals es detalla a la Política de privacitat de Culdesac. La confirmació de lectura de la política és independent dels consentiments opcionals que es puguin demanar per a finalitats addicionals.",
      ],
    },
    {
      id: "law-contact",
      title: "14. Llei aplicable, reclamacions i contacte",
      paragraphs: [
        "Aquests termes es regeixen per la normativa espanyola i europea aplicable. Qualsevol clàusula sobre jurisdicció s’entén sense perjudici del fur imperatiu que correspongui a la persona consumidora. Proposta pendent: [[JUTJATS O MECANISME DE RESOLUCIÓ DE CONFLICTES]].",
        "Per a consultes o reclamacions: [[CORREU D’ATENCIÓ]], [[ADREÇA POSTAL]] i [[TELÈFON O ALTRE CANAL, SI SE N’OFEREIX]].",
      ],
    },
  ],
  references: [
    { label: "Llei de serveis de la societat de la informació (BOE)", href: "https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758" },
    { label: "Text de defensa de consumidors i usuaris (BOE)", href: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555" },
  ],
};

export const privacyDocument: LegalDocument = {
  eyebrow: "TRANSPARÈNCIA I DADES",
  title: "Política de privacitat",
  description: "Informació sobre com recollim, utilitzem, protegim i conservem les dades de participants i persones usuàries de Culdesac.",
  version: "Esborrany · versió 0.1 · [[DATA D’ENTRADA EN VIGOR]]",
  isDraft: true,
  sections: [
    {
      id: "controller",
      title: "1. Responsable del tractament",
      paragraphs: [
        "Responsable: [[RAÓ SOCIAL]], NIF/CIF [[NIF/CIF]], domicili a [[DOMICILI SOCIAL COMPLET]] i correu de privacitat [[CORREU DE PRIVACITAT]].",
        "Delegat/da de protecció de dades, si escau: [[DADES DEL DPD O ‘NO APLICA’]].",
      ],
    },
    {
      id: "data",
      title: "2. Quines dades tractem",
      paragraphs: ["Recollim directament les dades que facilites al formulari i les dades tècniques imprescindibles per gestionar la inscripció."],
      items: [
        "Identificació: nom i cognoms i DNI/NIE.",
        "Contacte i localització general: correu electrònic i codi postal.",
        "Identitat de joc: tag de Discord i nickname de Fortnite/Epic Games.",
        "Inscripció i pagament: torneig, import, estat, identificadors de la sessió de Stripe, dates i confirmació enviada.",
        "Dades tècniques i de seguretat: [[LOGS REALMENT RECOLLITS, COM ARA IP, NAVEGADOR I MARQUES TEMPORALS]].",
        "Dades necessàries per a premis i incidències: [[CATEGORIES ADDICIONALS, SI N’HI HA]].",
      ],
    },
    {
      id: "purposes",
      title: "3. Per a què utilitzem les dades",
      paragraphs: ["Tractem les dades només per a finalitats determinades i relacionades amb l’activitat de Culdesac."],
      items: [
        "Gestionar la inscripció, el pagament, l’accés i les comunicacions operatives del torneig.",
        "Identificar la persona participant i evitar inscripcions duplicades o usos fraudulents.",
        "Organitzar partides, resultats, incidències, reclamacions i, si escau, lliurar premis.",
        "Complir obligacions comptables, fiscals, de consum i altres obligacions legals aplicables.",
        "Protegir la plataforma, prevenir abusos i acreditar l’acceptació de les condicions.",
        "Enviar comunicacions comercials només si [[MECANISME DE CONSENTIMENT COMERCIAL, SI ES VOL IMPLEMENTAR]].",
      ],
    },
    {
      id: "legal-bases",
      title: "4. Bases jurídiques",
      paragraphs: [
        "La gestió de la inscripció i del pagament es basa en l’execució del contracte sol·licitat. Les obligacions comptables, fiscals i de consum es basen en el compliment d’obligacions legals.",
        "La prevenció del frau i la defensa davant reclamacions poden basar-se en l’interès legítim, prèvia ponderació. Els usos d’imatge, veu o màrqueting que no siguin necessaris es basaran en un consentiment separat, específic i revocable.",
      ],
    },
    {
      id: "required-data",
      title: "5. Dades obligatòries",
      paragraphs: [
        "Els camps marcats amb un asterisc són necessaris per tramitar la inscripció. Si no els facilites, no podrem reservar la plaça ni gestionar la participació.",
        "El DNI/NIE es demana per comprovar la identitat i impedir múltiples inscripcions per persona. No enviem aquest número a Stripe ni l’incloem al correu de confirmació.",
      ],
    },
    {
      id: "recipients",
      title: "6. Destinataris i proveïdors",
      paragraphs: [
        "No venem les teves dades. Poden accedir-hi proveïdors que actuen com a encarregats del tractament i només en la mesura necessària per prestar el servei.",
      ],
      items: [
        "Stripe (entitat contractual aplicable), per processar pagaments i prevenir frau.",
        "Resend (entitat contractual aplicable), per enviar confirmacions i avisos operatius.",
        "Proveïdor d’allotjament i base de dades: [[PROVEÏDOR, ENTITAT I REGIÓ]].",
        "Discord, Epic Games o plataformes de competició: [[QUINES DADES ES COMPARTEIXEN REALMENT I EN QUINS CASOS]].",
        "Administracions, jutjats o autoritats quan una norma ho exigeixi.",
      ],
    },
    {
      id: "transfers",
      title: "7. Transferències internacionals",
      paragraphs: [
        "Alguns proveïdors poden tractar dades fora de l’Espai Econòmic Europeu. En aquest cas, s’utilitzaran els mecanismes exigits pel RGPD, com decisions d’adequació o clàusules contractuals tipus. Cal completar: [[TRANSFERÈNCIES REALS, PAÏSOS I GARANTIES DE STRIPE, RESEND I HOSTING]].",
      ],
    },
    {
      id: "retention",
      title: "8. Durant quant temps conservem les dades",
      paragraphs: [
        "Dades d’inscripció i participació: [[TERMINI DE CONSERVACIÓ]]. Dades de facturació i pagament: [[TERMINI LEGAL FISCAL/COMPTABLE]]. Registres d’incidències i reclamacions: [[TERMINI]].",
        "Quan finalitzin els terminis, les dades s’eliminaran o quedaran bloquejades només per atendre possibles responsabilitats legals.",
      ],
    },
    {
      id: "minors",
      title: "9. Persones menors d’edat",
      paragraphs: [
        "La participació està limitada a persones de [[EDAT MÍNIMA]] anys o més. Per a participants menors d’edat s’aplicarà [[SISTEMA D’AUTORITZACIÓ I VERIFICACIÓ DEL TUTOR]].",
        "Quan un tractament es basi en el consentiment, s’aplicaran els llindars i garanties específiques de la normativa de protecció de dades, sense confondre’ls amb la capacitat legal per contractar o participar.",
      ],
    },
    {
      id: "rights",
      title: "10. Els teus drets",
      paragraphs: [
        "Pots sol·licitar accés, rectificació, supressió, oposició, limitació i portabilitat de les teves dades, així com retirar un consentiment sense afectar la licitud del tractament anterior.",
        "Envia la sol·licitud a [[CORREU DE PRIVACITAT]] indicant quin dret vols exercir. Podrem demanar informació addicional només quan sigui necessària per verificar la identitat. També pots reclamar davant l’Agència Espanyola de Protecció de Dades (www.aepd.es).",
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
      title: "12. Decisions automatitzades i galetes",
      paragraphs: [
        "No prenem decisions automatitzades amb efectes jurídics ni elaborem perfils sobre els participants, excepte [[DESCRIURE SI EN EL FUTUR S’IMPLEMENTA ALGUN SISTEMA]].",
        "La configuració actual de galetes i analítica és [[INDICAR GALETES, ANALÍTICA I EINA DE CONSENTIMENT]]. Si s’incorporen galetes no necessàries, es facilitarà una política específica i un mecanisme de consentiment.",
      ],
    },
    {
      id: "updates-contact",
      title: "13. Canvis i contacte",
      paragraphs: [
        "Podem actualitzar aquesta política per reflectir canvis legals o del servei. Quan el canvi sigui rellevant, l’anunciarem de manera visible i actualitzarem la data de vigència.",
        "Per qualsevol consulta de privacitat, contacta amb [[CORREU DE PRIVACITAT]] o escriu a [[ADREÇA POSTAL]].",
      ],
    },
  ],
  references: [
    { label: "Reglament general de protecció de dades (EUR-Lex)", href: "https://eur-lex.europa.eu/legal-content/CA/TXT/?uri=CELEX:32016R0679" },
    { label: "Llei orgànica 3/2018 de protecció de dades (BOE)", href: "https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673" },
    { label: "Dret d’informació (AEPD)", href: "https://www.aepd.es/derechos-y-deberes/conoce-tus-derechos/derecho-de-informacion" },
  ],
};
