import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieName, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { summarizeRegistrations } from "@/lib/admin-dashboard";
import { logout } from "./login/actions";
import { setActiveTournament, setTournamentStatus } from "./actions";

const dateFormat = new Intl.DateTimeFormat("ca-ES", { dateStyle: "medium", timeStyle: "short", timeZone: process.env.APP_TIMEZONE ?? "Europe/Madrid" });
const statusLabel: Record<string, string> = { DRAFT: "Esborrany", OPEN: "Obert", CLOSED: "Tancat", COMPLETED: "Finalitzat", PAID: "Pagada", PENDING_PAYMENT: "Pendent", EXPIRED: "Expirada", REFUNDED: "Reemborsada" };

export const dynamic = "force-dynamic";
export default async function Admin() {
  if (!await isAdmin((await cookies()).get(cookieName)?.value)) redirect("/admin/login");
  const [settings, tournaments, registrations] = await Promise.all([
    db.siteSettings.findUnique({
      where: { id: 1 },
      include: {
        activeTournament: {
          include: {
            _count: { select: { registrations: { where: { status: "PAID" } } } },
          },
        },
      },
    }),
    db.tournament.findMany({
      orderBy: [{ status: "asc" }, { eventDate: "desc" }],
      include: { _count: { select: { registrations: { where: { status: "PAID" } } } } },
    }),
    db.registration.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, fullName: true, email: true, status: true, createdAt: true, tournament: { select: { name: true, id: true } } } }),
  ]);
  const counts = summarizeRegistrations(registrations.map((registration) => registration.status));
  const active = settings?.activeTournament;
  return <main className="admin-shell">
    <header className="admin-header"><Link href="/admin" className="admin-brand"><span>GS</span> Game Sports Electronics</Link><nav><Link className="top-action" href="/admin/tournaments/new">+ Crear torneig</Link><form action={logout}><button className="link-button">Sortir</button></form></nav></header>
    <section className="admin-hero"><div><p className="eyebrow">CENTRE DE CONTROL</p><h1>Tornejos i inscripcions</h1><p>Gestiona què veu el públic, controla els pagaments i accedeix ràpidament a cada torneig.</p></div><Link className="button primary-button" href="/admin/tournaments/new">+ Nou torneig</Link></section>
    {active ? <section className="active-tournament"><div><p className="eyebrow">TORNEIG PÚBLIC ACTIU</p><h2>{active.name}</h2><p>{dateFormat.format(active.eventDate)} · {formatMoney(active.priceCents, active.currency)}</p><div className="active-meta"><span className="badge open">{statusLabel[active.status]}</span><span>{active._count.registrations}{active.capacity ? ` / ${active.capacity}` : ""} inscripcions pagades</span></div></div><div className="active-actions"><Link className="button" href={`/admin/tournaments/${active.id}`}>Gestionar torneig</Link><Link className="button subtle-button" href={`/admin/tournaments/${active.id}/registrations`}>Veure inscripcions</Link></div></section> : <section className="empty-active"><div><strong>Encara no hi ha cap torneig públic actiu.</strong><p>Crea un torneig o activa’n un d’existent perquè aparegui a la landing.</p></div><Link className="button" href="/admin/tournaments/new">Crear primer torneig</Link></section>}
    <section className="metrics"><div><small>Tornejos</small><strong>{tournaments.length}</strong><span>Històric inclòs</span></div><div><small>Pagaments recents</small><strong>{counts.paid}</strong><span>Dels últims {counts.total} registres</span></div><div><small>Pagaments pendents</small><strong>{counts.outstanding}</strong><span>Revisa’ls si cal</span></div></section>
    <section className="admin-card"><div className="section-head"><div><p className="eyebrow">GESTIÓ</p><h2>Els teus tornejos</h2></div><Link className="quiet-link" href="/admin/tournaments/new">Crear-ne un de nou →</Link></div><div className="tournament-list">{tournaments.map((tournament) => <article className="tournament-row" key={tournament.id}><div className="tournament-date"><strong>{new Intl.DateTimeFormat("ca-ES", { day: "2-digit" }).format(tournament.eventDate)}</strong><span>{new Intl.DateTimeFormat("ca-ES", { month: "short" }).format(tournament.eventDate).replace(".", "")}</span></div><div className="tournament-info"><div><Link href={`/admin/tournaments/${tournament.id}`}><h3>{tournament.name}</h3></Link>{settings?.activeTournamentId === tournament.id && <span className="badge active">PÚBLIC</span>}<span className={`badge ${tournament.status.toLowerCase()}`}>{statusLabel[tournament.status]}</span></div><p>{dateFormat.format(tournament.eventDate)} · {formatMoney(tournament.priceCents, tournament.currency)} · <strong>{tournament._count.registrations}{tournament.capacity ? ` / ${tournament.capacity}` : ""}</strong> pagades</p></div><div className="tournament-controls"><Link href={`/admin/tournaments/${tournament.id}`}>Editar</Link><Link href={`/admin/tournaments/${tournament.id}/registrations`}>Inscripcions</Link><form action={setActiveTournament}><input type="hidden" name="id" value={tournament.id}/><button disabled={settings?.activeTournamentId === tournament.id}>Fer públic</button></form><form action={setTournamentStatus}><input type="hidden" name="id" value={tournament.id}/><input type="hidden" name="status" value={tournament.status === "OPEN" ? "CLOSED" : "OPEN"}/><button className={tournament.status === "OPEN" ? "danger-button" : "success-button"}>{tournament.status === "OPEN" ? "Tancar" : "Obrir"}</button></form></div></article>)}</div></section>
    <section className="admin-card"><div className="section-head"><div><p className="eyebrow">ACTIVITAT</p><h2>Últimes inscripcions</h2></div>{active && <Link className="quiet-link" href={`/admin/tournaments/${active.id}/registrations`}>Veure totes →</Link>}</div><div className="recent-list">{registrations.map((registration) => <Link className="recent-row" href={`/admin/tournaments/${registration.tournament.id}/registrations`} key={registration.id}><span className="avatar">{registration.fullName.slice(0,1).toUpperCase()}</span><span className="recent-person"><strong>{registration.fullName}</strong><small>{registration.tournament.name} · {registration.email}</small></span><span className={`badge ${registration.status.toLowerCase()}`}>{statusLabel[registration.status]}</span><time>{new Intl.DateTimeFormat("ca-ES", { dateStyle: "short", timeStyle: "short" }).format(registration.createdAt)}</time></Link>)}{registrations.length === 0 && <p className="muted">Encara no hi ha inscripcions.</p>}</div></section>
  </main>;
}
