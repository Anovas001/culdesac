import type { LegalDocument } from "./legal-documents";

export const termsDocumentEs: LegalDocument = {
  eyebrow: "CONDICIONES DE PARTICIPACIÓN",
  title: "Términos y condiciones",
  description: "Condiciones generales de acceso, inscripción, pago y participación en los torneos organizados bajo la marca Culdesac.",
  version: "Borrador · versión 0.1 · [[FECHA DE ENTRADA EN VIGOR]]",
  isDraft: true,
  sections: [
    {
      id: "organizer",
      title: "1. Identificación del organizador",
      paragraphs: [
        "Los torneos Culdesac están organizados por [[RAZÓN SOCIAL]], con NIF/CIF [[NIF/CIF]], domicilio en [[DOMICILIO SOCIAL COMPLETO]] y correo de contacto [[CORREO LEGAL]].",
        "Datos registrales, si procede: [[REGISTRO MERCANTIL, TOMO, FOLIO Y HOJA]]. Culdesac es el nombre comercial utilizado para presentar y gestionar las competiciones.",
      ],
    },
    {
      id: "scope",
      title: "2. Objeto y aceptación",
      paragraphs: [
        "Estos términos regulan la relación entre el organizador y cualquier persona que se inscriba en un torneo publicado en la web. Los datos específicos de cada edición —formato, calendario, precio, plazas y premio— completan estas condiciones.",
        "Al marcar la casilla de aceptación y formalizar el pago, la persona participante declara haber leído y aceptado estos términos y las reglas particulares del torneo. En caso de contradicción se aplicará [[ORDEN DE PREVALENCIA ENTRE BASES Y TÉRMINOS]].",
      ],
    },
    {
      id: "eligibility",
      title: "3. Requisitos de participación",
      paragraphs: [
        "Puede participar cualquier persona que cumpla la edad mínima de [[EDAD MÍNIMA]], resida en [[ÁMBITO TERRITORIAL]] y disponga de cuentas operativas de Fortnite/Epic Games y Discord.",
        "Las personas menores de edad deberán contar con [[TIPO DE AUTORIZACIÓN DEL PADRE, MADRE O TUTOR Y PROCEDIMIENTO]]. La inscripción es personal y no puede cederse sin autorización escrita del organizador.",
      ],
    },
    {
      id: "registration",
      title: "4. Inscripción y veracidad de los datos",
      paragraphs: [
        "Para reservar plaza es necesario completar el formulario con nombre y apellidos, DNI/NIE, código postal, correo electrónico, tag de Discord y nickname de Fortnite, aceptar estos términos y completar el pago.",
        "La persona participante garantiza que los datos son exactos, actuales y propios. Cada persona solo puede disponer de una inscripción por torneo. El organizador podrá solicitar una verificación razonable de identidad antes de competir o entregar un premio.",
      ],
    },
    {
      id: "payment",
      title: "5. Precio y pago",
      paragraphs: [
        "El precio final de cada torneo, impuestos incluidos cuando corresponda, se muestra antes del botón de pago. El cobro se procesa mediante Stripe; Culdesac no almacena los datos completos de la tarjeta.",
        "La plaza solo queda confirmada cuando el pago consta como completado. La persona participante recibe una confirmación en el correo indicado. Si el pago falla o caduca, la reserva no se considera formalizada.",
      ],
    },
    {
      id: "withdrawal",
      title: "6. Desistimiento, cancelaciones y devoluciones",
      paragraphs: [
        "La política aplicable antes del inicio del torneo es: [[PLAZO Y PROCEDIMIENTO PARA CANCELAR LA INSCRIPCIÓN Y SOLICITAR UNA DEVOLUCIÓN]].",
        "Debe confirmarse con asesoramiento jurídico si, por tratarse de un servicio relacionado con una actividad de ocio con fecha de ejecución específica, resulta aplicable alguna excepción legal al derecho de desistimiento. Esta versión no limita ningún derecho imperativo de las personas consumidoras.",
        "Si Culdesac cancela definitivamente una edición, se aplicará [[DEVOLUCIÓN TOTAL / REPROGRAMACIÓN / OTRAS OPCIONES Y PLAZOS]].",
      ],
    },
    {
      id: "competition-rules",
      title: "7. Formato y reglas de competición",
      paragraphs: [
        "Cada edición se rige por sus bases específicas, disponibles en [[URL O DOCUMENTO DE BASES]]. Estas bases deben indicar como mínimo formato, plataforma, región del servidor, horarios, sistema de resultados, desempate y canales de asistencia.",
        "Es responsabilidad de cada participante conectarse puntualmente, mantener operativas sus cuentas y consultar las comunicaciones enviadas por correo o Discord.",
      ],
    },
    {
      id: "conduct",
      title: "8. Conducta, juego limpio y descalificación",
      paragraphs: [
        "Se prohíben las trampas, la explotación deliberada de errores, la suplantación de identidad, los acuerdos para alterar resultados, el acoso y cualquier conducta contraria a las reglas de Fortnite, Epic Games o Discord.",
        "Ante una incidencia, el organizador podrá investigar, solicitar pruebas y aplicar medidas proporcionadas, incluida la descalificación. El procedimiento de reclamación será [[CANAL, PLAZO Y SISTEMA DE REVISIÓN]].",
      ],
    },
    {
      id: "prizes",
      title: "9. Premios",
      paragraphs: [
        "Los premios, criterios de adjudicación y plazo de entrega constarán en las bases de cada torneo. Para recibirlos, la persona ganadora deberá acreditar su identidad y facilitar los datos estrictamente necesarios.",
        "El tratamiento fiscal de los premios, las posibles retenciones y las obligaciones de la persona ganadora serán [[TRATAMIENTO FISCAL Y RESPONSABLE DE LAS RETENCIONES]].",
      ],
    },
    {
      id: "image-rights",
      title: "10. Imagen, voz y retransmisión",
      paragraphs: [
        "La participación no autoriza por sí sola cualquier uso promocional de la imagen o la voz. Las retransmisiones, grabaciones y usos de contenido se regularán mediante [[BASE JURÍDICA, ALCANCE, CANALES, PLAZO Y MECANISMO DE AUTORIZACIÓN]].",
        "Las personas participantes deberán respetar los derechos de terceros y no podrán incorporar contenido ilícito o sin autorización.",
      ],
    },
    {
      id: "liability",
      title: "11. Disponibilidad y responsabilidad",
      paragraphs: [
        "Culdesac adoptará medidas razonables para organizar el torneo, pero no puede garantizar la disponibilidad continua de servicios de terceros, conexiones particulares, Fortnite, Epic Games, Discord o Stripe.",
        "Las limitaciones de responsabilidad se interpretarán conforme a la normativa aplicable y no excluirán responsabilidades que legalmente no puedan limitarse.",
      ],
    },
    {
      id: "changes",
      title: "12. Cambios, suspensión y fuerza mayor",
      paragraphs: [
        "Por motivos técnicos, de seguridad, fraude, fuerza mayor o funcionamiento competitivo, el organizador podrá ajustar horarios o formato cuando sea necesario y proporcionado, informándolo por los canales disponibles.",
        "Las consecuencias de una reprogramación o suspensión se regirán por [[POLÍTICA DE CAMBIOS, AVISOS Y ALTERNATIVAS]].",
      ],
    },
    {
      id: "privacy",
      title: "13. Protección de datos",
      paragraphs: [
        "El tratamiento de datos personales se detalla en la Política de privacidad de Culdesac. La confirmación de lectura de la política es independiente de los consentimientos opcionales para finalidades adicionales.",
      ],
    },
    {
      id: "law-contact",
      title: "14. Ley aplicable, reclamaciones y contacto",
      paragraphs: [
        "Estos términos se rigen por la normativa española y europea aplicable. Cualquier cláusula sobre jurisdicción se entiende sin perjuicio del fuero imperativo que corresponda a la persona consumidora. Propuesta pendiente: [[JUZGADOS O MECANISMO DE RESOLUCIÓN DE CONFLICTOS]].",
        "Para consultas o reclamaciones: [[CORREO DE ATENCIÓN]], [[DIRECCIÓN POSTAL]] y [[TELÉFONO U OTRO CANAL, SI SE OFRECE]].",
      ],
    },
  ],
  references: [
    { label: "Ley de servicios de la sociedad de la información (BOE)", href: "https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758" },
    { label: "Texto de defensa de consumidores y usuarios (BOE)", href: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555" },
  ],
};

export const privacyDocumentEs: LegalDocument = {
  eyebrow: "TRANSPARENCIA Y DATOS",
  title: "Política de privacidad",
  description: "Información sobre cómo recogemos, utilizamos, protegemos y conservamos los datos de participantes y personas usuarias de Culdesac.",
  version: "Borrador · versión 0.1 · [[FECHA DE ENTRADA EN VIGOR]]",
  isDraft: true,
  sections: [
    {
      id: "controller",
      title: "1. Responsable del tratamiento",
      paragraphs: [
        "Responsable: [[RAZÓN SOCIAL]], NIF/CIF [[NIF/CIF]], domicilio en [[DOMICILIO SOCIAL COMPLETO]] y correo de privacidad [[CORREO DE PRIVACIDAD]].",
        "Delegado/a de protección de datos, si procede: [[DATOS DEL DPD O ‘NO APLICA’]].",
      ],
    },
    {
      id: "data",
      title: "2. Qué datos tratamos",
      paragraphs: ["Recogemos directamente los datos que facilitas en el formulario y los datos técnicos imprescindibles para gestionar la inscripción."],
      items: [
        "Identificación: nombre y apellidos y DNI/NIE.",
        "Contacto y localización general: correo electrónico y código postal.",
        "Identidad de juego: tag de Discord y nickname de Fortnite/Epic Games.",
        "Inscripción y pago: torneo, importe, estado, identificadores de la sesión de Stripe, fechas y confirmación enviada.",
        "Datos técnicos y de seguridad: [[REGISTROS REALMENTE RECOGIDOS, COMO IP, NAVEGADOR Y MARCAS TEMPORALES]].",
        "Datos necesarios para premios e incidencias: [[CATEGORÍAS ADICIONALES, SI LAS HAY]].",
      ],
    },
    {
      id: "purposes",
      title: "3. Para qué utilizamos los datos",
      paragraphs: ["Tratamos los datos únicamente para finalidades determinadas y relacionadas con la actividad de Culdesac."],
      items: [
        "Gestionar la inscripción, el pago, el acceso y las comunicaciones operativas del torneo.",
        "Identificar a la persona participante y evitar inscripciones duplicadas o usos fraudulentos.",
        "Organizar partidas, resultados, incidencias, reclamaciones y, si procede, entregar premios.",
        "Cumplir obligaciones contables, fiscales, de consumo y otras obligaciones legales aplicables.",
        "Proteger la plataforma, prevenir abusos y acreditar la aceptación de las condiciones.",
        "Enviar comunicaciones comerciales solo si [[MECANISMO DE CONSENTIMIENTO COMERCIAL, SI SE DESEA IMPLEMENTAR]].",
      ],
    },
    {
      id: "legal-bases",
      title: "4. Bases jurídicas",
      paragraphs: [
        "La gestión de la inscripción y del pago se basa en la ejecución del contrato solicitado. Las obligaciones contables, fiscales y de consumo se basan en el cumplimiento de obligaciones legales.",
        "La prevención del fraude y la defensa ante reclamaciones pueden basarse en el interés legítimo, previa ponderación. Los usos de imagen, voz o marketing no necesarios se basarán en un consentimiento separado, específico y revocable.",
      ],
    },
    {
      id: "required-data",
      title: "5. Datos obligatorios",
      paragraphs: [
        "Los campos marcados con un asterisco son necesarios para tramitar la inscripción. Si no los facilitas, no podremos reservar la plaza ni gestionar la participación.",
        "El DNI/NIE se solicita para comprobar la identidad e impedir múltiples inscripciones por persona. No enviamos este número a Stripe ni lo incluimos en el correo de confirmación.",
      ],
    },
    {
      id: "recipients",
      title: "6. Destinatarios y proveedores",
      paragraphs: ["No vendemos tus datos. Pueden acceder a ellos proveedores que actúan como encargados del tratamiento y solo en la medida necesaria para prestar el servicio."],
      items: [
        "Stripe (entidad contractual aplicable), para procesar pagos y prevenir fraude.",
        "Resend (entidad contractual aplicable), para enviar confirmaciones y avisos operativos.",
        "Proveedor de alojamiento y base de datos: [[PROVEEDOR, ENTIDAD Y REGIÓN]].",
        "Discord, Epic Games o plataformas de competición: [[QUÉ DATOS SE COMPARTEN REALMENTE Y EN QUÉ CASOS]].",
        "Administraciones, juzgados o autoridades cuando una norma lo exija.",
      ],
    },
    {
      id: "transfers",
      title: "7. Transferencias internacionales",
      paragraphs: ["Algunos proveedores pueden tratar datos fuera del Espacio Económico Europeo. En ese caso se utilizarán los mecanismos exigidos por el RGPD. Debe completarse: [[TRANSFERENCIAS REALES, PAÍSES Y GARANTÍAS DE STRIPE, RESEND Y HOSTING]]."],
    },
    {
      id: "retention",
      title: "8. Durante cuánto tiempo conservamos los datos",
      paragraphs: [
        "Datos de inscripción y participación: [[PLAZO DE CONSERVACIÓN]]. Datos de facturación y pago: [[PLAZO LEGAL FISCAL/CONTABLE]]. Registros de incidencias y reclamaciones: [[PLAZO]].",
        "Cuando finalicen los plazos, los datos se eliminarán o quedarán bloqueados únicamente para atender posibles responsabilidades legales.",
      ],
    },
    {
      id: "minors",
      title: "9. Personas menores de edad",
      paragraphs: [
        "La participación está limitada a personas de [[EDAD MÍNIMA]] años o más. Para participantes menores de edad se aplicará [[SISTEMA DE AUTORIZACIÓN Y VERIFICACIÓN DEL TUTOR]].",
        "Cuando un tratamiento se base en el consentimiento se aplicarán los umbrales y garantías específicos de la normativa de protección de datos.",
      ],
    },
    {
      id: "rights",
      title: "10. Tus derechos",
      paragraphs: [
        "Puedes solicitar acceso, rectificación, supresión, oposición, limitación y portabilidad de tus datos, así como retirar un consentimiento sin afectar a la licitud del tratamiento anterior.",
        "Envía la solicitud a [[CORREO DE PRIVACIDAD]] indicando qué derecho deseas ejercer. También puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).",
      ],
    },
    {
      id: "security",
      title: "11. Seguridad",
      paragraphs: [
        "Aplicamos medidas técnicas y organizativas proporcionadas al riesgo para limitar el acceso, evitar pérdidas y proteger la confidencialidad de los datos. El acceso al backoffice está restringido a personal autorizado.",
        "Ningún sistema es infalible. Si se produce una brecha con riesgo para las personas afectadas, actuaremos conforme a las obligaciones de notificación y comunicación aplicables.",
      ],
    },
    {
      id: "automated",
      title: "12. Decisiones automatizadas y cookies",
      paragraphs: [
        "No tomamos decisiones automatizadas con efectos jurídicos ni elaboramos perfiles sobre participantes, excepto [[DESCRIBIR SI EN EL FUTURO SE IMPLEMENTA ALGÚN SISTEMA]].",
        "La configuración actual de cookies y analítica es [[INDICAR COOKIES, ANALÍTICA Y HERRAMIENTA DE CONSENTIMIENTO]]. Si se incorporan cookies no necesarias se ofrecerá una política específica y un mecanismo de consentimiento.",
      ],
    },
    {
      id: "updates-contact",
      title: "13. Cambios y contacto",
      paragraphs: [
        "Podemos actualizar esta política para reflejar cambios legales o del servicio. Cuando el cambio sea relevante, lo anunciaremos de forma visible y actualizaremos la fecha de vigencia.",
        "Para cualquier consulta de privacidad, contacta con [[CORREO DE PRIVACIDAD]] o escribe a [[DIRECCIÓN POSTAL]].",
      ],
    },
  ],
  references: [
    { label: "Reglamento general de protección de datos (EUR-Lex)", href: "https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32016R0679" },
    { label: "Ley Orgánica 3/2018 de protección de datos (BOE)", href: "https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673" },
    { label: "Derecho de información (AEPD)", href: "https://www.aepd.es/derechos-y-deberes/conoce-tus-derechos/derecho-de-informacion" },
  ],
};
