import { afterEach, describe, expect, test } from "vitest";

import { getServerEnv } from "./env";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("getServerEnv", () => {
  test("accepts blank optional integration credentials in console email mode", () => {
    process.env = {
      ...process.env,
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://user:password@localhost:5432/db",
      APP_URL: "http://localhost:3000",
      ADMIN_EMAIL: "admin@example.com",
      ADMIN_PASSWORD_HASH: "hash",
      SESSION_SECRET: "a".repeat(32),
      EMAIL_MODE: "console",
      RESEND_API_KEY: "",
      EMAIL_FROM: "",
      STRIPE_SECRET_KEY: "sk_test_example",
      STRIPE_WEBHOOK_SECRET: "whsec_example",
    };

    expect(getServerEnv().EMAIL_MODE).toBe("console");
  });
});
