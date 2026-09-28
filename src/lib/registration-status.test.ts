import { expect, it } from "vitest";
import { parseRegistrationFilter, registrationFilterWhere, registrationStatusLabels } from "./registration-status";

it("distinguishes invitations and selects paid and invited together for referees", () => {
  expect(registrationStatusLabels.INVITED).toBe("Invitació");
  expect(parseRegistrationFilter("CONFIRMED")).toBe("CONFIRMED");
  expect(parseRegistrationFilter("INVITED")).toBe("INVITED");
  expect(parseRegistrationFilter("INVALID")).toBeUndefined();
  expect(registrationFilterWhere("CONFIRMED")).toEqual({ status: { in: ["PAID", "INVITED"] } });
  expect(registrationFilterWhere("INVITED")).toEqual({ status: "INVITED" });
  expect(registrationFilterWhere()).toEqual({});
});
