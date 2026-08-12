"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieName, createAdminToken, verifyAdminPassword } from "@/lib/auth";
export async function login(formData: FormData) { const email = String(formData.get("email") ?? ""); const password = String(formData.get("password") ?? ""); if (!await verifyAdminPassword(email, password)) redirect("/admin/login?error=1"); (await cookies()).set(cookieName, await createAdminToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 43200 }); redirect("/admin"); }
export async function logout() { (await cookies()).delete(cookieName); redirect("/admin/login"); }
