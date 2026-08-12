import { SignJWT, jwtVerify } from "jose";
import { compare } from "bcryptjs";
import { getServerEnv } from "./env";

const cookieName = "culdesac_admin";
function key() { return new TextEncoder().encode(getServerEnv().SESSION_SECRET); }
export async function verifyAdminPassword(email: string, password: string) { const env = getServerEnv(); return email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase() && compare(password, env.ADMIN_PASSWORD_HASH); }
export async function createAdminToken() { return new SignJWT({ admin: true }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("12h").sign(key()); }
export async function isAdmin(token?: string) { if (!token) return false; try { const { payload } = await jwtVerify(token, key()); return payload.admin === true; } catch { return false; } }
export { cookieName };
