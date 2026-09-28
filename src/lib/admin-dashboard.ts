export function summarizeRegistrations(statuses: string[]) {
  const paid = statuses.filter((status) => status === "PAID").length;
  const invited = statuses.filter((status) => status === "INVITED").length;
  return { paid, invited, confirmed: paid + invited, outstanding: statuses.filter((status) => status === "PENDING_PAYMENT").length, total: statuses.length };
}
