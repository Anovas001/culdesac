import Stripe from "stripe";

import { getServerEnv } from "./env";

export function getStripe() {
  const key = getServerEnv().STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured.");
  return new Stripe(key);
}
