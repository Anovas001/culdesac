export function summarizeRegistrations(statuses: string[]) {
  return { paid: statuses.filter((status) => status === "PAID").length, outstanding: statuses.filter((status) => status === "PENDING_PAYMENT").length, total: statuses.length };
}
