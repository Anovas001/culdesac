import { createServer } from "node:http";
import { parseArgs } from "node:util";
import { Resend } from "resend";

import { confirmationReplyTo, renderRegistrationConfirmation } from "../src/lib/email/confirmation-template";
import { launchTournament } from "../src/lib/launch-tournament";

const { values } = parseArgs({
  options: {
    send: { type: "boolean", default: false },
    to: { type: "string" },
    "site-url": { type: "string", default: "https://culdesac.gsegames.com" },
    port: { type: "string", default: "3100" },
  },
});

const site = new URL(values["site-url"]!);
if (site.protocol !== "https:" || ["localhost", "0.0.0.0", "127.0.0.1", "[::1]"].includes(site.hostname)) {
  throw new Error("Use the public HTTPS site URL so images and links work in the email.");
}

const content = renderRegistrationConfirmation({
  id: "MOSTRA-CULDESAC-001",
  fullName: "Aniol Novas",
  email: values.to ?? "preview@example.com",
  epicUsername: "Anovas",
  amountCents: launchTournament.priceCents,
  currency: launchTournament.currency,
}, launchTournament, { siteUrl: site.origin, timeZone: "Europe/Madrid", preview: true });

if (values.send) {
  // Sending is deliberately explicit; previewing never contacts Resend or the database.
  if (!values.to || !process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error("Sending requires --to, RESEND_API_KEY and EMAIL_FROM (load .env first).");
  }
  const { data, error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: process.env.EMAIL_FROM,
    to: values.to,
    replyTo: confirmationReplyTo,
    ...content,
  }, { idempotencyKey: `confirmation-design-v1-${values.to}` });
  if (error) throw new Error(error.message);
  console.info(JSON.stringify({ emailId: data?.id, to: values.to, subject: content.subject }));
} else {
  const server = createServer((request, response) => {
    if (request.url !== "/") { response.writeHead(404).end(); return; }
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    response.end(content.html);
  });
  server.listen(Number(values.port), "127.0.0.1", () => {
    console.info(`Email preview: http://127.0.0.1:${values.port}/`);
  });
}
