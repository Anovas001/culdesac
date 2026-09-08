import { Resend } from "resend";

import { getServerEnv } from "../env";
import {
  confirmationReplyTo,
  renderRegistrationConfirmation,
  type Confirmation,
  type ConfirmationTournament,
} from "./confirmation-template";

export async function sendRegistrationConfirmation(registration: Confirmation, tournament: ConfirmationTournament) {
  const env = getServerEnv();
  const content = renderRegistrationConfirmation(registration, tournament, {
    siteUrl: env.APP_URL,
    timeZone: env.APP_TIMEZONE,
  });
  if (env.EMAIL_MODE === "console") { console.info("[email] confirmation", { registrationId: registration.id, to: registration.email }); return; }
  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM!,
    to: registration.email,
    replyTo: confirmationReplyTo,
    ...content,
    headers: { "Idempotency-Key": `registration-${registration.id}` },
  });
  if (error) throw new Error(error.message);
}
