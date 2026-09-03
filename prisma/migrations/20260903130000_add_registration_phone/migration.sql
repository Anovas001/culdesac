ALTER TABLE "Registration"
ADD COLUMN "phone" VARCHAR(16);

-- Existing registrations remain NULL; the application requires the field for new submissions.
