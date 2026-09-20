import { formatMoney } from "../money";
import { DISCORD_INVITE_URL } from "../community-links";

export type Confirmation = {
  id: string;
  fullName: string;
  email: string;
  epicUsername: string;
  amountCents: number;
  currency: string;
};
export type ConfirmationTournament = { name: string; eventDate: Date };
export type ConfirmationTemplateOptions = {
  siteUrl: string;
  timeZone: string;
  preview?: boolean;
};

export const confirmationReplyTo = "culdesac@gamesportselectronics.cat";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

/** Inline styles and presentation tables keep the receipt usable in email clients. */
export function renderRegistrationConfirmation(
  registration: Confirmation,
  tournament: ConfirmationTournament,
  options: ConfirmationTemplateOptions,
) {
  const site = new URL(options.siteUrl);
  if (!["https:", "http:"].includes(site.protocol)) {
    throw new Error("Email site URL must use HTTP or HTTPS.");
  }
  const siteUrl = site.origin;
  const amount = formatMoney(registration.amountCents, registration.currency);
  const date = new Intl.DateTimeFormat("ca-ES", {
    dateStyle: "long", timeStyle: "short", timeZone: options.timeZone,
  }).format(tournament.eventDate);
  const dateWithZone = `${date} (${options.timeZone})`;
  const subject = `${options.preview ? "[MOSTRA] " : ""}Inscripció confirmada — ${tournament.name}`;
  const nextStep = "Entra al Discord de Culdesac: és on es gestiona tota la competició, es publiquen les convocatòries i pots contactar amb els àrbitres. Uneix-t’hi abans que comenci el torneig. Conserva aquest correu: hi tens les dades de la teva inscripció.";
  const previewNote = "Mostra de disseny amb dades d’exemple. No s’ha creat cap inscripció ni s’ha fet cap cobrament.";
  const text = `${options.preview ? `${previewNote}\n\n` : ""}CULDESAC · JA ETS DINS.\n\nHola ${registration.fullName},\n\nHem rebut el teu pagament i la teva plaça està confirmada.\n\n${tournament.name}\nParticipant: ${registration.fullName}\nJugador de Fortnite: ${registration.epicUsername}\nData i hora: ${dateWithZone}\nImport pagat: ${amount}\nCodi d’inscripció: ${registration.id}\n\nEl següent pas: entra al Discord.\n${nextStep}\n\nEntrar al Discord: ${DISCORD_INVITE_URL}\n\nTorna a Culdesac: ${siteUrl}/\n\nTens algun dubte? Respon aquest correu o escriu a ${confirmationReplyTo}.\n\nEns veiem al Culdesac.\nTu contra el quadre.\n\nReps aquest correu com a confirmació de la teva inscripció.\nCondicions: ${siteUrl}/legal/terms\nPrivacitat: ${siteUrl}/legal/privacy`;

  const name = escapeHtml(registration.fullName);
  const nickname = escapeHtml(registration.epicUsername);
  const title = escapeHtml(tournament.name);
  const url = escapeHtml(siteUrl);
  const html = `<!doctype html>
<html lang="ca">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${escapeHtml(subject)}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    table { border-collapse:collapse; }
    img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
    a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; }
    @media only screen and (max-width:600px) {
      .outer { padding:12px 8px !important; }
      .pad { padding-left:24px !important; padding-right:24px !important; }
      .headline { font-size:56px !important; line-height:54px !important; }
      .brand-note { font-size:10px !important; letter-spacing:1px !important; }
      .detail { display:block !important; width:100% !important; padding-right:0 !important; }
      .event-title { font-size:25px !important; line-height:31px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:#0a0a0f;color:#f5f5f7;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;font-size:1px;color:#0a0a0f;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${options.preview ? escapeHtml(previewNote) : `Pagament rebut. La teva plaça a ${title} està confirmada. Aquí tens les dades per competir.`}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0a0a0f" style="width:100%;background-color:#0a0a0f;">
    <tr><td class="outer" align="center" style="padding:32px 16px;">
      <!--[if mso]><table role="presentation" width="640" align="center"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background-color:#14141c;">
        <tr><td height="6" bgcolor="#fff200" style="height:6px;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td class="pad" bgcolor="#0a0a0f" style="padding:18px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="140" valign="middle"><a href="${url}/" style="text-decoration:none;"><img src="${url}/brand/culdesac-logo.png" width="120" height="120" alt="Culdesac" style="display:block;width:120px;height:120px;color:#fff200;font-size:20px;font-weight:bold;"></a></td>
            <td class="brand-note" align="right" valign="middle" style="color:#c4c4d1;font-size:11px;line-height:20px;font-weight:bold;letter-spacing:2px;">LA COMPETICIÓ<br><span style="color:#fff200;">ONLINE DE FORTNITE</span></td>
          </tr></table>
        </td></tr>
        ${options.preview ? `<tr><td class="pad" bgcolor="#242430" style="padding:12px 40px;color:#c4c4d1;font-size:12px;line-height:18px;">${escapeHtml(previewNote)}</td></tr>` : ""}
        <tr><td class="pad" bgcolor="#390078" style="padding:36px 40px 40px;background-color:#390078;background-image:linear-gradient(125deg,#390078,#6500bf);">
          <p style="margin:0 0 22px;color:#fff200;font-size:11px;line-height:18px;font-weight:bold;letter-spacing:2px;">PAGAMENT REBUT / PLAÇA CONFIRMADA</p>
          <h1 class="headline" style="margin:0 0 24px;font-family:Arial Black,Arial,Helvetica,sans-serif;font-size:76px;line-height:70px;font-weight:900;letter-spacing:-3px;color:#ffffff;">JA ETS<br><span style="color:#fff200;">DINS.</span></h1>
          <p style="margin:0 0 8px;color:#ffffff;font-size:18px;line-height:28px;font-weight:bold;overflow-wrap:anywhere;">Hola ${name},</p>
          <p style="margin:0;color:#eee5ff;font-size:16px;line-height:25px;">Hem rebut el teu pagament i la teva plaça està confirmada. Ara et toca demostrar-ho.</p>
        </td></tr>
        <tr><td bgcolor="#ff00e5" align="center" style="padding:12px 20px;color:#0a0a0f;font-size:11px;line-height:18px;font-weight:bold;letter-spacing:2px;">CULDESAC &nbsp; / &nbsp; TU CONTRA EL QUADRE.</td></tr>
        <tr><td class="pad" style="padding:34px 40px 28px;">
          <p style="margin:0 0 12px;color:#fff200;font-size:11px;line-height:18px;font-weight:bold;letter-spacing:2px;">01 / LA TEVA INSCRIPCIÓ</p>
          <h2 class="event-title" style="margin:0 0 26px;color:#f5f5f7;font-size:30px;line-height:36px;font-weight:800;overflow-wrap:anywhere;">${title}</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;">
            <tr>
              <td class="detail" width="55%" valign="top" style="padding:0 20px 22px 0;">
                <p style="margin:0 0 6px;color:#b5b5c5;font-size:11px;line-height:18px;font-weight:bold;letter-spacing:1px;">PARTICIPANT</p>
                <p style="margin:0;color:#f5f5f7;font-size:16px;line-height:24px;font-weight:bold;word-wrap:break-word;overflow-wrap:anywhere;">${name}</p>
              </td>
              <td class="detail" width="45%" valign="top" style="padding:0 0 22px;">
                <p style="margin:0 0 6px;color:#b5b5c5;font-size:11px;line-height:18px;font-weight:bold;letter-spacing:1px;">JUGADOR DE FORTNITE</p>
                <p style="margin:0;color:#f5f5f7;font-size:16px;line-height:24px;font-weight:bold;word-wrap:break-word;overflow-wrap:anywhere;">${nickname}</p>
              </td>
            </tr>
            <tr>
              <td class="detail" width="55%" valign="top" style="padding:0 20px 24px 0;">
                <p style="margin:0 0 6px;color:#b5b5c5;font-size:11px;line-height:18px;font-weight:bold;letter-spacing:1px;">DATA I HORA</p>
                <p style="margin:0;color:#f5f5f7;font-size:16px;line-height:24px;font-weight:bold;">${escapeHtml(date)}</p>
                <p style="margin:4px 0 0;color:#b5b5c5;font-size:12px;line-height:18px;">Hora peninsular · ${escapeHtml(options.timeZone)}</p>
              </td>
              <td class="detail" width="45%" valign="top" style="padding:0 0 24px;">
                <p style="margin:0 0 6px;color:#b5b5c5;font-size:11px;line-height:18px;font-weight:bold;letter-spacing:1px;">IMPORT PAGAT</p>
                <p style="margin:0;color:#fff200;font-size:28px;line-height:34px;font-weight:bold;">${escapeHtml(amount)}</p>
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#20202b" style="width:100%;table-layout:fixed;border-top:1px dashed #626273;">
            <tr><td style="padding:18px 20px;">
              <p style="margin:0 0 8px;color:#b5b5c5;font-size:11px;line-height:18px;font-weight:bold;letter-spacing:1px;">CODI D’INSCRIPCIÓ</p>
              <p style="margin:0;color:#f5f5f7;font-family:Consolas,monospace;font-size:14px;line-height:22px;word-break:break-all;">${escapeHtml(registration.id)}</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td class="pad" style="padding:4px 40px 36px;">
          <p style="margin:0 0 12px;color:#fff200;font-size:11px;line-height:18px;font-weight:bold;letter-spacing:2px;">02 / EL SEGÜENT PAS</p>
          <h2 style="margin:0 0 12px;color:#f5f5f7;font-size:23px;line-height:29px;">La competició continua al Discord.</h2>
          <p style="margin:0 0 24px;color:#c4c4d1;font-size:15px;line-height:25px;">${nextStep}</p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="#fff200" align="center" style="background-color:#fff200;mso-padding-alt:16px 26px;">
            <a href="${DISCORD_INVITE_URL}" style="display:inline-block;border:1px solid #fff200;padding:16px 26px;color:#0a0a0f;font-size:14px;line-height:20px;font-weight:bold;text-decoration:none;letter-spacing:0.5px;mso-padding-alt:0;">ENTRAR AL DISCORD &nbsp; ↗</a>
          </td></tr></table>
          <p style="margin:24px 0 0;color:#b5b5c5;font-size:13px;line-height:22px;">Tens algun dubte? <a href="mailto:${confirmationReplyTo}" style="color:#f5f5f7;text-decoration:underline;">Respon aquest correu</a> i t’ajudarem.</p>
        </td></tr>
        <tr><td class="pad" bgcolor="#0a0a0f" style="padding:28px 40px;border-top:1px solid #353541;">
          <p style="margin:0 0 8px;color:#f5f5f7;font-size:18px;line-height:24px;font-weight:bold;">Ens veiem al Culdesac.</p>
          <p style="margin:0 0 20px;color:#fff200;font-size:12px;line-height:20px;">Tu contra el quadre.</p>
          <p style="margin:0 0 12px;color:#a3a3b5;font-size:11px;line-height:19px;">Reps aquest correu com a confirmació de la teva inscripció${options.preview ? " (mostra de disseny)" : ""}.<br>Culdesac · Gamesports Electrònics</p>
          <p style="margin:0;color:#a3a3b5;font-size:11px;line-height:20px;"><a href="${url}/legal/terms" style="color:#c4c4d1;text-decoration:underline;">Termes i condicions</a> &nbsp; · &nbsp; <a href="${url}/legal/privacy" style="color:#c4c4d1;text-decoration:underline;">Privacitat</a></p>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}
