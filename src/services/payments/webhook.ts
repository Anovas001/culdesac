import type Stripe from "stripe";
import { db } from "@/lib/db";
import { sendRegistrationConfirmation } from "@/lib/email/confirmation";

export async function processStripeEvent(event: Stripe.Event) {
  const prior = await db.stripeWebhookEvent.upsert({ where: { id: event.id }, create: { id: event.id, type: event.type }, update: {} });
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const registrationId = session.metadata?.registrationId;
    if (!registrationId || session.payment_status !== "paid" || session.amount_total === null || !session.currency) throw new Error("Invalid checkout event.");
    const registration = await db.$transaction(async (tx) => {
      const r = await tx.registration.findUnique({ where: { id: registrationId }, include: { tournament: true } });
      if (!r) throw new Error("Registration not found.");
      if (r.status === "PAID") return r;
      if (r.stripeCheckoutSessionId !== session.id || r.amountCents !== session.amount_total || r.currency !== session.currency) throw new Error("Checkout does not match registration.");
      return tx.registration.update({ where: { id: r.id }, data: { status: "PAID", paidAt: new Date(), stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null }, include: { tournament: true } });
    });
    if (!registration.confirmationEmailSentAt) {
      try { await sendRegistrationConfirmation(registration, registration.tournament); await db.registration.update({ where: { id: registration.id }, data: { confirmationEmailSentAt: new Date(), confirmationEmailLastError: null } }); }
      catch (error) { await db.registration.update({ where: { id: registration.id }, data: { confirmationEmailLastError: error instanceof Error ? error.message.slice(0, 500) : "Email failed" } }); }
    }
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    await db.registration.updateMany({ where: { stripeCheckoutSessionId: session.id, status: "PENDING_PAYMENT" }, data: { status: "EXPIRED" } });
  }
  await db.stripeWebhookEvent.update({ where: { id: prior.id }, data: { processedAt: new Date() } });
}
