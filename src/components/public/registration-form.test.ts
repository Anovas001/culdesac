import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("registration consent controls", () => {
  const component = readFileSync(new URL("./registration-form.tsx", import.meta.url), "utf8");

  it("submits the explicit marketing choice", () => {
    expect(component).toContain('acceptedMarketing: formData.get("acceptedMarketing") === "on"');
  });

  it("uses privacy acceptance instead of a separate image-rights checkbox", () => {
    expect(component).not.toContain('name="acceptedImageRights"');
    expect(component).toMatch(/name="acceptedPrivacy"[^>]*required/);
    expect(component).toMatch(/name="acceptedMarketing"[^>]*type="checkbox"(?![^>]*required)/);
  });

  it("collects a required telephone number with mobile-friendly attributes", () => {
    expect(component).toMatch(/name="phone"[^>]*type="tel"[^>]*required/);
    expect(component).toContain('autoComplete="tel"');
    expect(component).toContain('inputMode="tel"');
  });
});
