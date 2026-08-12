import { describe, expect, test } from "vitest";
import { summarizeRegistrations } from "./admin-dashboard";

describe("summarizeRegistrations", () => {
  test("separates paid registrations from outstanding payments", () => {
    expect(summarizeRegistrations(["PAID", "PENDING_PAYMENT", "PAID", "EXPIRED"])).toEqual({ paid: 2, outstanding: 1, total: 4 });
  });
});
