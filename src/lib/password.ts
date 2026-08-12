import { hash } from "bcryptjs";

export function hashAdminPassword(password: string): Promise<string> {
  return hash(password, 12);
}
