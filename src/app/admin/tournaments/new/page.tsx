import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieName, isAdmin } from "@/lib/auth";
import { TournamentForm } from "@/components/admin/tournament-form";
export default async function NewTournament() { if (!await isAdmin((await cookies()).get(cookieName)?.value)) redirect("/admin/login"); return <main className="admin-shell"><Link href="/admin">← Dashboard</Link><h1>Crear torneig</h1><TournamentForm /></main>; }
