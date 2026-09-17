import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { buildRegistrationsExcel, type ExportRegistration } from "./registrations-excel";

const registration: ExportRegistration = {
  id: "registration-123", fullName: "Àlex Martí", epicUsername: "=1+1",
  discordUsername: "@alex", email: "alex@example.com", phone: "+34600000000",
  dni: "01234567L", postalCode: "08001", status: "PAID", amountCents: 250,
  currency: "eur", createdAt: new Date("2026-09-08T09:15:00Z"),
  paidAt: new Date("2026-09-08T09:16:00Z"),
};
const options = {
  tournament: { name: "Culdesac Open", slug: "culdesac-open", eventDate: new Date("2026-10-10T16:00:00Z") },
  registrations: [registration], timeZone: "Europe/Madrid", exportedAt: new Date("2026-09-08T11:00:00Z"),
};

describe("Excel registration export", () => {
  it("round-trips actual XLSX with typed amounts, literal identifiers, local dates and referee tools", async () => {
    const { buffer, filename } = await buildRegistrationsExcel({ ...options, status: "PAID" });
    const book = new ExcelJS.Workbook();
    await book.xlsx.load(buffer);
    const sheet = book.getWorksheet("Inscripcions")!;
    expect(filename).toBe("inscripcions-culdesac-open-paid-2026-09-08.xlsx");
    expect(sheet.getCell("A3").text).toContain("Filtre: Pagada · 1 inscripcions");
    expect(sheet.getCell("A6").value).toBe("Àlex Martí");
    expect(sheet.getCell("B6").value).toBe("=1+1");
    expect(sheet.getCell("B6").type).toBe(ExcelJS.ValueType.String);
    expect(sheet.getCell("G6").value).toBe("+34600000000");
    expect(sheet.getCell("H6").value).toBe("01234567L");
    expect(sheet.getCell("I6").value).toBe("08001");
    expect(sheet.getCell("K6").value).toBe(2.5);
    expect(sheet.getCell("M6").value).toEqual(new Date("2026-09-08T11:15:00Z"));
    expect(sheet.getCell("N6").value).toEqual(new Date("2026-09-08T11:16:00Z"));
    expect(sheet.views[0]).toMatchObject({ state: "frozen", ySplit: 5, xSplit: 2 });
    expect(sheet.getTable("InscripcionsCuldesac")).toBeDefined();
    expect(sheet.getCell("D6").dataValidation).toMatchObject({ type: "list", allowBlank: true });
    expect(sheet.getCell("E6").text).toBe("");
  });

  it("exports empty results with headers and filter metadata", async () => {
    const { buffer } = await buildRegistrationsExcel({ ...options, registrations: [] });
    const book = new ExcelJS.Workbook();
    await book.xlsx.load(buffer);
    const sheet = book.getWorksheet("Inscripcions")!;
    expect(sheet.getCell("A3").text).toContain("0 inscripcions");
    expect(sheet.getCell("A5").value).toBe("Nom i cognoms");
    expect(sheet.getCell("A6").value).toBeNull();
    expect(sheet.autoFilter).toBeDefined();
  });

  it("handles absent contact/payment data, zero amounts and winter time", async () => {
    const { buffer, filename } = await buildRegistrationsExcel({
      ...options, tournament: { ...options.tournament, slug: 'nom/"\r\nà' },
      registrations: [{ ...registration, phone: null, paidAt: null, status: "PENDING_PAYMENT", amountCents: 0, createdAt: new Date("2026-01-10T23:30:00Z") }],
    });
    const book = new ExcelJS.Workbook();
    await book.xlsx.load(buffer);
    const sheet = book.getWorksheet("Inscripcions")!;
    expect(sheet.getCell("G6").text).toBe("");
    expect(sheet.getCell("N6").value).toBeNull();
    expect(sheet.getCell("K6").value).toBe(0);
    expect(sheet.getCell("J6").value).toBe("Pendent de pagament");
    expect(sheet.getCell("M6").value).toEqual(new Date("2026-01-11T00:30:00Z"));
    expect(filename).not.toMatch(/["/\r\n]/);
  });
});
