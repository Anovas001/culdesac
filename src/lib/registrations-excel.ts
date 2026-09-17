import ExcelJS from "exceljs";
import type { Registration } from "@/generated/prisma/client";
import { registrationStatusLabels } from "./registration-status";

export type ExportRegistration = Pick<Registration,
  "id" | "fullName" | "epicUsername" | "discordUsername" | "email" | "phone" |
  "dni" | "postalCode" | "status" | "amountCents" | "currency" | "createdAt" | "paidAt"
>;

type ExportOptions = {
  tournament: { name: string; slug: string; eventDate: Date };
  registrations: ExportRegistration[];
  status?: ExportRegistration["status"];
  timeZone: string;
  exportedAt?: Date;
};

// Excel dates have no time zone. Store the displayed local components as a numeric date.
function localExcelDate(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)!.value);
  return new Date(Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"), value("second")));
}

export async function buildRegistrationsExcel({ tournament, registrations, status, timeZone, exportedAt = new Date() }: ExportOptions) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Culdesac";
  workbook.created = exportedAt;
  workbook.title = `Inscripcions — ${tournament.name}`;
  const sheet = workbook.addWorksheet("Inscripcions", {
    views: [{ state: "frozen", xSplit: 2, ySplit: 5, activeCell: "C6" }],
    pageSetup: { orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: "1:5" },
  });
  const columns = [
    { name: "Nom i cognoms", width: 30 },
    { name: "Nickname Fortnite", width: 26 },
    { name: "Tag Discord", width: 26 },
    { name: "Present", width: 14 },
    { name: "Observacions", width: 42 },
    { name: "Correu electrònic", width: 34 },
    { name: "Telèfon", width: 20 },
    { name: "DNI / NIE", width: 16 },
    { name: "Codi postal", width: 14 },
    { name: "Estat", width: 26 },
    { name: "Import d’inscripció", width: 24 },
    { name: "Moneda", width: 12 },
    { name: "Data d’inscripció", width: 24 },
    { name: "Data de pagament", width: 24 },
    { name: "Codi d’inscripció", width: 34 },
  ];
  sheet.columns = columns.map(({ width }) => ({ width }));
  sheet.mergeCells("A1:O1");
  sheet.getCell("A1").value = `CULDESAC · ${tournament.name}`;
  sheet.getCell("A1").font = { name: "Calibri", bold: true, size: 20, color: { argb: "FFFFF200" } };
  sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF171324" } };
  sheet.getCell("A1").alignment = { vertical: "middle", wrapText: true };
  sheet.getRow(1).height = 42;
  const formatDate = (date: Date) => new Intl.DateTimeFormat("ca-ES", { dateStyle: "short", timeStyle: "short", timeZone }).format(date);
  sheet.mergeCells("A2:O2");
  sheet.getCell("A2").value = `Torneig: ${formatDate(tournament.eventDate)} · Hores en ${timeZone} · Exportació: ${formatDate(exportedAt)}`;
  sheet.mergeCells("A3:O3");
  sheet.getCell("A3").value = `Filtre: ${status ? registrationStatusLabels[status] : "Totes les inscripcions"} · ${registrations.length} inscripcions · Present i Observacions són camps de treball editables; no se sincronitzen amb el web.`;
  for (const number of [2, 3]) {
    sheet.getRow(number).height = 30;
    sheet.getCell(`A${number}`).font = { name: "Calibri", size: 11, color: { argb: "FF494256" } };
    sheet.getCell(`A${number}`).alignment = { vertical: "middle", wrapText: true };
  }

  // Plain strings are shared-string cells, never formulas or hyperlinks, even if they start with = or +.
  const rows = registrations.map((registration) => [
    registration.fullName, registration.epicUsername, registration.discordUsername,
    "", "", registration.email, registration.phone ?? "", registration.dni,
    registration.postalCode, registrationStatusLabels[registration.status],
    registration.amountCents / 100, registration.currency.toUpperCase(),
    localExcelDate(registration.createdAt, timeZone),
    registration.paidAt ? localExcelDate(registration.paidAt, timeZone) : null,
    registration.id,
  ]);
  if (rows.length) {
    sheet.addTable({
      name: "InscripcionsCuldesac", ref: "A5", headerRow: true,
      style: { theme: "TableStyleMedium4", showRowStripes: true },
      columns: columns.map(({ name }) => ({ name, filterButton: true })),
      rows,
    });
  } else {
    sheet.getRow(5).values = columns.map(({ name }) => name);
    sheet.autoFilter = "A5:O5";
  }
  sheet.getRow(5).height = 32;
  sheet.getRow(5).eachCell((cell) => {
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6500BF" } };
    cell.alignment = { vertical: "middle", wrapText: true };
  });
  for (let number = 6; number < 6 + rows.length; number++) {
    const row = sheet.getRow(number);
    row.height = 38;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { name: "Calibri", size: 11, color: { argb: "FF171324" } };
      cell.alignment = { vertical: "middle", wrapText: true };
    });
    for (const column of [1, 2, 3, 6, 7, 8, 9, 15]) row.getCell(column).numFmt = "@";
    row.getCell(11).numFmt = "#,##0.00";
    for (const column of [13, 14]) row.getCell(column).numFmt = "dd/mm/yyyy hh:mm";
    for (const column of [4, 5]) row.getCell(column).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF9D6" } };
    row.getCell(4).dataValidation = { type: "list", allowBlank: true, formulae: ['"Sí,No"'], showErrorMessage: true, errorTitle: "Valor no vàlid", error: "Tria Sí, No o deixa el camp buit." };
  }
  const slug = tournament.slug.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").slice(0, 80) || "torneig";
  return {
    buffer: await workbook.xlsx.writeBuffer(),
    filename: `inscripcions-${slug}-${status?.toLowerCase() ?? "totes"}-${exportedAt.toISOString().slice(0, 10)}.xlsx`,
  };
}
