"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { cookieName, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendRegistrationConfirmation } from "@/lib/email/confirmation";
import { tournamentSchema } from "@/lib/validation/tournament";

async function requireAdminAction() { if (!await isAdmin((await cookies()).get(cookieName)?.value)) throw new Error("No autoritzat."); }
function asObject(formData: FormData) { return Object.fromEntries(formData); }
export async function saveTournament(formData: FormData) { await requireAdminAction(); const raw = asObject(formData); const parsed = tournamentSchema.safeParse(raw); if (!parsed.success) redirect(`/admin/tournaments/${raw.id || "new"}?error=validation`); try { if (raw.id) await db.tournament.update({ where: { id: String(raw.id) }, data: parsed.data }); else { const tournament = await db.tournament.create({ data: parsed.data }); redirect(`/admin/tournaments/${tournament.id}`); } } catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") redirect(`/admin/tournaments/${raw.id || "new"}?error=slug`); throw error; } revalidatePath("/"); revalidatePath("/admin"); redirect(`/admin/tournaments/${raw.id}`); }
export async function setActiveTournament(formData: FormData) { await requireAdminAction(); const id = String(formData.get("id")); await db.siteSettings.upsert({ where: { id: 1 }, update: { activeTournamentId: id }, create: { id: 1, activeTournamentId: id } }); revalidatePath("/"); revalidatePath("/admin"); revalidatePath(`/admin/tournaments/${id}`); }
export async function setTournamentStatus(formData: FormData) { await requireAdminAction(); const id = String(formData.get("id")); const status = String(formData.get("status")); if (!["DRAFT","OPEN","CLOSED","COMPLETED"].includes(status)) throw new Error("Estat invàlid."); await db.tournament.update({ where: { id }, data: { status: status as "DRAFT" } }); revalidatePath("/"); revalidatePath("/admin"); revalidatePath(`/admin/tournaments/${id}`); }
export async function resendConfirmation(formData: FormData) { await requireAdminAction(); const id = String(formData.get("id")); const registration = await db.registration.findUnique({ where: { id }, include: { tournament: true } }); if (!registration || registration.status !== "PAID") throw new Error("Només es poden reenviar inscripcions pagades."); try { await sendRegistrationConfirmation(registration, registration.tournament); await db.registration.update({ where: { id }, data: { confirmationEmailSentAt: new Date(), confirmationEmailLastError: null } }); } catch (error) { await db.registration.update({ where: { id }, data: { confirmationEmailLastError: error instanceof Error ? error.message.slice(0, 500) : "Email failed" } }); } revalidatePath(`/admin/tournaments/${registration.tournamentId}/registrations`); }
