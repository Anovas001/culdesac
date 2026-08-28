import { NextResponse } from "next/server";
import { registrationSchema } from "@/lib/validation/registration";
import { prismaRegistrationRepository } from "@/services/registrations/repository";
import { ClosedTournamentError, DuplicatePaidRegistrationError, createOrReuseRegistration } from "@/services/registrations/service";
import { getStripe } from "@/lib/stripe";
import { getServerEnv } from "@/lib/env";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const parsed = registrationSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ code: "INVALID_REGISTRATION", error: parsed.error.issues[0]?.message ?? "Revisa les dades del formulari.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
    const result = await createOrReuseRegistration(prismaRegistrationRepository, parsed.data);
    const stripe = getStripe(); const env = getServerEnv();
    const current = await db.registration.findUniqueOrThrow({ where: { id: result.registration.id } });
    if (current.stripeCheckoutSessionId) { try { await stripe.checkout.sessions.expire(current.stripeCheckoutSessionId); } catch { /* best effort */ } }
    const session = await stripe.checkout.sessions.create({ mode: "payment", payment_method_types: ["card"], customer_email: parsed.data.email, client_reference_id: current.id, metadata: { registrationId: current.id, tournamentId: result.tournament.id }, payment_intent_data: { metadata: { registrationId: current.id, tournamentId: result.tournament.id } }, line_items: [{ price_data: { currency: current.currency, product_data: { name: result.tournament.id }, unit_amount: current.amountCents }, quantity: 1 }], expires_at: Math.floor(Date.now() / 1000) + 1800, success_url: `${env.APP_URL}/registration/success?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${env.APP_URL}/registration/cancelled` });
    await db.registration.update({ where: { id: current.id }, data: { stripeCheckoutSessionId: session.id, status: "PENDING_PAYMENT" } });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof ClosedTournamentError) return NextResponse.json({ code: "TOURNAMENT_CLOSED", error: error.message }, { status: 409 });
    if (error instanceof DuplicatePaidRegistrationError) return NextResponse.json({ code: "ALREADY_REGISTERED", error: error.message }, { status: 409 });
    console.error("[registration]", error); return NextResponse.json({ code: "PAYMENT_FAILED", error: "No s'ha pogut iniciar el pagament." }, { status: 500 });
  }
}
