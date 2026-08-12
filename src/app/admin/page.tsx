import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieName, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { logout } from "./login/actions";
export const dynamic = "force-dynamic";
export default async function Admin() { if (!await isAdmin((await cookies()).get(cookieName)?.value)) redirect("/admin/login"); const tournaments = await db.tournament.findMany({ orderBy: { eventDate: "desc" }, include: { _count: { select: { registrations: { where: { status: "PAID" } } } } } }); const registrations = await db.registration.findMany({ take: 30, orderBy: { createdAt: "desc" }, include: { tournament: { select: { name: true } } } }); return <main className="shell"><form action={logout}><button>Sortir</button></form><h1>Dashboard</h1><section className="card"><h2>Tornejos</h2>{tournaments.map(t => <p key={t.id}><strong>{t.name}</strong> · {t.status} · {t._count.registrations}{t.capacity ? ` / ${t.capacity}` : ""} · {formatMoney(t.priceCents, t.currency)}</p>)}</section><section className="card"><h2>Últimes inscripcions</h2>{registrations.map(r => <p key={r.id}><strong>{r.fullName}</strong> · {r.tournament.name} · {r.status} · {r.email}</p>)}</section></main>; }
