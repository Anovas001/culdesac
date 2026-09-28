import type { Prisma, RegistrationStatus } from "@/generated/prisma/client";

export const registrationStatusLabels = {
  PAID: "Pagada",
  INVITED: "Invitació",
  PENDING_PAYMENT: "Pendent de pagament",
  EXPIRED: "Caducada",
  CANCELLED: "Cancel·lada",
  REFUNDED: "Reemborsada",
} satisfies Record<RegistrationStatus, string>;

export const registrationStatuses = Object.keys(registrationStatusLabels) as RegistrationStatus[];

export function parseRegistrationStatus(value: string | undefined | null) {
  return registrationStatuses.find((status) => status === value);
}

export const confirmedRegistrationStatuses: RegistrationStatus[] = ["PAID", "INVITED"];
export type RegistrationFilter = RegistrationStatus | "CONFIRMED";
export const registrationFilterLabels = { CONFIRMED: "Confirmades", ...registrationStatusLabels };
export const registrationFilters: RegistrationFilter[] = ["CONFIRMED", ...registrationStatuses];

export function parseRegistrationFilter(value: string | undefined | null): RegistrationFilter | undefined {
  return value === "CONFIRMED" ? value : parseRegistrationStatus(value);
}

export function registrationFilterWhere(filter?: RegistrationFilter): Prisma.RegistrationWhereInput {
  if (filter === "CONFIRMED") return { status: { in: confirmedRegistrationStatuses } };
  return filter ? { status: filter } : {};
}
