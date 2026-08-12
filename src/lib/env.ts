import { z } from "zod";

const databaseSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection URL."),
});

export function getDatabaseUrl(): string {
  if (!process.env.DATABASE_URL) {
    return "postgresql://build:build@localhost:5432/build";
  }
  return databaseSchema.parse(process.env).DATABASE_URL;
}

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  APP_URL: z.string().url().transform((value) => value.replace(/\/$/, "")),
  APP_TIMEZONE: z.string().default("Europe/Madrid"),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD_HASH: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  EMAIL_MODE: z.enum(["console", "resend"]).default("console"),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(3).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
}).superRefine((value, context) => {
  if (value.NODE_ENV === "production" && value.EMAIL_MODE !== "resend") {
    context.addIssue({ code: "custom", message: "Production requires EMAIL_MODE=resend.", path: ["EMAIL_MODE"] });
  }
  if (value.EMAIL_MODE === "resend" && (!value.RESEND_API_KEY || !value.EMAIL_FROM)) {
    context.addIssue({ code: "custom", message: "Resend mode requires RESEND_API_KEY and EMAIL_FROM.", path: ["RESEND_API_KEY"] });
  }
});

export type ServerEnv = z.output<typeof serverSchema>;

export function getServerEnv(): ServerEnv {
  return serverSchema.parse(process.env);
}
