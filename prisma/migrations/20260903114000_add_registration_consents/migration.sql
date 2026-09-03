ALTER TABLE "Registration"
ADD COLUMN "acceptedImageRights" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "acceptedImageRightsAt" TIMESTAMP(3),
ADD COLUMN "acceptedMarketing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "acceptedMarketingAt" TIMESTAMP(3);

-- Existing registrations predate these separate consent controls and remain unconsented.
