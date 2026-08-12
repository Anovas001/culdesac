-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'EXPIRED', 'CANCELLED', 'REFUNDED');

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rules" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'eur',
    "capacity" INTEGER,
    "heroImageUrl" TEXT,
    "status" "TournamentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "activeTournamentId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailNormalized" TEXT NOT NULL,
    "epicUsername" TEXT NOT NULL,
    "epicUsernameNormalized" TEXT NOT NULL,
    "discordUsername" TEXT,
    "phone" TEXT,
    "acceptedTerms" BOOLEAN NOT NULL,
    "acceptedPrivacy" BOOLEAN NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "amountCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "confirmationEmailSentAt" TIMESTAMP(3),
    "confirmationEmailLastError" TEXT,
    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeWebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Tournament_slug_key" ON "Tournament"("slug");
CREATE INDEX "Tournament_status_idx" ON "Tournament"("status");
CREATE UNIQUE INDEX "SiteSettings_activeTournamentId_key" ON "SiteSettings"("activeTournamentId");
CREATE UNIQUE INDEX "Registration_stripeCheckoutSessionId_key" ON "Registration"("stripeCheckoutSessionId");
CREATE UNIQUE INDEX "Registration_stripePaymentIntentId_key" ON "Registration"("stripePaymentIntentId");
CREATE INDEX "Registration_tournamentId_status_idx" ON "Registration"("tournamentId", "status");
CREATE UNIQUE INDEX "Registration_tournamentId_emailNormalized_key" ON "Registration"("tournamentId", "emailNormalized");
CREATE UNIQUE INDEX "Registration_tournamentId_epicUsernameNormalized_key" ON "Registration"("tournamentId", "epicUsernameNormalized");

ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_activeTournamentId_fkey" FOREIGN KEY ("activeTournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
