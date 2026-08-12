import { Resend } from "resend";

import { getServerEnv } from "../env";
import { formatMoney } from "../money";

type Confirmation = { id: string; fullName: string; email: string; epicUsername: string; amountCents: number; currency: string };
type Tournament = { name: string; eventDate: Date };

export async function sendRegistrationConfirmation(registration: Confirmation, tournament: Tournament) {
  const env = getServerEnv();
  const amount = formatMoney(registration.amountCents, registration.currency);
  const date = new Intl.DateTimeFormat("ca-ES", { dateStyle: "long", timeStyle: "short", timeZone: env.APP_TIMEZONE }).format(tournament.eventDate);
  const subject = `Inscripció confirmada — ${tournament.name}`;
  const text = `Hola ${registration.fullName},\n\nLa teva inscripció al torneig ${tournament.name} ha quedat confirmada.\nJugador: ${registration.epicUsername}\nData: ${date}\nImport pagat: ${amount}\nCodi d'inscripció: ${registration.id}\n\nEns veiem al torneig.`;
  if (env.EMAIL_MODE === "console") { console.info("[email] confirmation", { registrationId: registration.id, to: registration.email }); return; }
  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: env.EMAIL_FROM!, to: registration.email, subject, text, html: `<p>${text.replace(/\n/g, "<br>")}</p>`, headers: { "Idempotency-Key": `registration-${registration.id}` } });
  if (error) throw new Error(error.message);
}
