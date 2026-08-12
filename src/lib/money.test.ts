import { describe, expect, it } from "vitest";

import { formatMoney } from "./money";

describe("formatMoney", () => {
  it("formats integer euro cents for Spain", () => {
    expect(formatMoney(1500, "eur")).toBe("15,00 €");
  });
});
