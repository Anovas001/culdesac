-- Preserve legacy registrations while introducing the newly required identity fields.
ALTER TABLE "Registration"
ADD COLUMN "dni" TEXT,
ADD COLUMN "dniNormalized" TEXT,
ADD COLUMN "postalCode" VARCHAR(5);

UPDATE "Registration"
SET
  "dni" = 'LEGACY-' || "id",
  "dniNormalized" = 'LEGACY-' || "id",
  "postalCode" = '00000',
  "discordUsername" = COALESCE("discordUsername", 'legacy-' || "id");

ALTER TABLE "Registration"
ALTER COLUMN "dni" SET NOT NULL,
ALTER COLUMN "dniNormalized" SET NOT NULL,
ALTER COLUMN "postalCode" SET NOT NULL,
ALTER COLUMN "discordUsername" SET NOT NULL,
DROP COLUMN "phone";

CREATE UNIQUE INDEX "Registration_tournamentId_dniNormalized_key"
ON "Registration"("tournamentId", "dniNormalized");
