import type Stripe from "stripe";
import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ upsert: vi.fn(), markProcessed: vi.fn(), findRegistration: vi.fn(), updateRegistration: vi.fn(), send: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: {
  stripeWebhookEvent: { upsert: mocks.upsert, update: mocks.markProcessed },
  registration: { update: mocks.updateRegistration },
  $transaction: async (work: (tx: unknown) => Promise<unknown>) => work({ registration: { findUnique: mocks.findRegistration, update: mocks.updateRegistration } }),
} }));
vi.mock("@/lib/email/confirmation", () => ({ sendRegistrationConfirmation: mocks.send }));
import { processStripeEvent } from "./webhook";
const event = { id: "evt_test", type: "checkout.session.completed", data: { object: { id: "cs_test", metadata: { registrationId: "deleted_registration" }, payment_status: "paid", amount_total: 1500, currency: "eur" } } } as unknown as Stripe.Event;
beforeEach(() => {
  vi.clearAllMocks(); mocks.upsert.mockResolvedValue({ id: "evt_test", processedAt: null }); mocks.findRegistration.mockResolvedValue(null); mocks.markProcessed.mockResolvedValue({});
});
it("acknowledges a late payment notification for a deleted registration without recreating or emailing it", async () => {
  await processStripeEvent(event);
  expect(mocks.updateRegistration).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled();
  expect(mocks.markProcessed).toHaveBeenCalledWith({ where: { id: "evt_test" }, data: { processedAt: expect.any(Date) } });
});
it("ignores an already-processed event even if its registration was subsequently deleted", async () => {
  mocks.upsert.mockResolvedValue({ id: "evt_test", processedAt: new Date() });
  await processStripeEvent(event);
  expect(mocks.findRegistration).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled();
});
it("keeps rejecting invalid checkout metadata instead of treating it as a deletion", async () => {
  const invalid = { ...event, data: { object: { ...event.data.object, metadata: {} } } } as unknown as Stripe.Event;
  await expect(processStripeEvent(invalid)).rejects.toThrow("Invalid checkout event");
  expect(mocks.markProcessed).not.toHaveBeenCalled();
});
it("still marks an existing matching registration paid and sends its confirmation", async () => {
  const registration = { id: "r1", status: "PENDING_PAYMENT", stripeCheckoutSessionId: "cs_test", amountCents: 1500, currency: "eur", tournament: {}, confirmationEmailSentAt: null };
  mocks.findRegistration.mockResolvedValue(registration);
  mocks.updateRegistration.mockResolvedValue({ ...registration, status: "PAID" });
  await processStripeEvent(event);
  expect(mocks.updateRegistration).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "r1" }, data: expect.objectContaining({ status: "PAID" }) }));
  expect(mocks.send).toHaveBeenCalledTimes(1);
});
