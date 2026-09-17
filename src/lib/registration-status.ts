import type { RegistrationStatus } from "@/generated/prisma/client";

export const registrationStatusLabels = {
  PAID: "Pagada",
  PENDING_PAYMENT: "Pendent de pagament",
  EXPIRED: "Caducada",
  CANCELLED: "Cancel·lada",
  REFUNDED: "Reemborsada",
} satisfies Record<RegistrationStatus, string>;

export const registrationStatuses = Object.keys(registrationStatusLabels) as RegistrationStatus[];

export function parseRegistrationStatus(value: string | undefined | null) {
  return registrationStatuses.find((status) => status === value);
}
