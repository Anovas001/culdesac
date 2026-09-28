import { describe, expect, test } from "vitest";
import { summarizeRegistrations } from "./admin-dashboard";

describe("summarizeRegistrations", () => {
  test("separates paid registrations from outstanding payments", () => {
    expect(summarizeRegistrations(["PAID", "INVITED", "PENDING_PAYMENT", "PAID", "EXPIRED"])).toEqual({ paid: 2, invited: 1, confirmed: 3, outstanding: 1, total: 5 });
  });
});
