-- AlterTable
ALTER TABLE "users" ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "marvelcdb_profile" TEXT,
ADD COLUMN     "pending_email" TEXT,
ADD COLUMN     "pending_email_token" TEXT,
ADD COLUMN     "pending_email_token_expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "users_pending_email_token_idx" ON "users"("pending_email_token");
