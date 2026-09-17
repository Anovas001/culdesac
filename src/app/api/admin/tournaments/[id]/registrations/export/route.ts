import { cookies } from "next/headers";
import { cookieName, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseRegistrationStatus } from "@/lib/registration-status";
import { buildRegistrationsExcel } from "@/lib/registrations-excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateHeaders = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
function fail(error: string, status: number) {
  return Response.json({ error }, { status, headers: privateHeaders });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin((await cookies()).get(cookieName)?.value)) {
    return fail("La sessió ha caducat. Torna a iniciar sessió per exportar les inscripcions.", 401);
  }
  const rawStatus = new URL(request.url).searchParams.get("status");
  const status = parseRegistrationStatus(rawStatus);
  if (rawStatus !== null && !status) return fail("El filtre d’inscripcions no és vàlid.", 400);
  const { id } = await params;
  try {
    const tournament = await db.tournament.findUnique({
      where: { id }, select: { name: true, slug: true, eventDate: true },
    });
    if (!tournament) return fail("No s’ha trobat el torneig.", 404);
    const registrations = await db.registration.findMany({
      where: { tournamentId: id, ...(status ? { status } : {}) },
      orderBy: [{ fullName: "asc" }, { id: "asc" }],
      select: { id: true, fullName: true, epicUsername: true, discordUsername: true,
        email: true, phone: true, dni: true, postalCode: true, status: true,
        amountCents: true, currency: true, createdAt: true, paidAt: true },
    });
    const { buffer, filename } = await buildRegistrationsExcel({
      tournament, registrations, status, timeZone: process.env.APP_TIMEZONE ?? "Europe/Madrid",
    });
    return new Response(new Uint8Array(buffer), { headers: {
      ...privateHeaders,
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    } });
  } catch {
    console.error("[registrations-export] Could not generate workbook", { tournamentId: id });
    return fail("No s’ha pogut generar l’Excel. Torna-ho a provar.", 500);
  }
}
