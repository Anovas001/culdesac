import { hashAdminPassword } from "../src/lib/password";

const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run admin:hash -- <password>");
  process.exitCode = 1;
} else {
  console.log(await hashAdminPassword(password));
}
