ALTER TABLE "Tournament"
  ADD COLUMN "challongeTournamentId" TEXT,
  ADD COLUMN "challongeUrl" TEXT,
  ADD COLUMN "challongeCommunity" TEXT,
  ADD COLUMN "challongePublishAttemptedAt" TIMESTAMP(3),
  ADD COLUMN "challongeLastSyncedAt" TIMESTAMP(3),
  ADD COLUMN "challongeLastError" TEXT;

ALTER TABLE "Registration"
  ADD COLUMN "challongeParticipantId" TEXT,
  ADD COLUMN "challongePublishedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Tournament_challongeTournamentId_key" ON "Tournament"("challongeTournamentId");
CREATE UNIQUE INDEX "Registration_tournamentId_challongeParticipantId_key" ON "Registration"("tournamentId", "challongeParticipantId");
