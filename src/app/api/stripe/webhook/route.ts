import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { processStripeEvent } from "@/services/payments/webhook";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    const event = getStripe().webhooks.constructEvent(await request.text(), signature, getServerEnv().STRIPE_WEBHOOK_SECRET!);
    await processStripeEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) { console.error("[stripe] webhook", error); return NextResponse.json({ error: "Invalid webhook" }, { status: 400 }); }
}
