-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_token_expires_at" TIMESTAMP(3),
ADD COLUMN     "email_verification_token" TEXT,
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password_reset_token" TEXT,
ADD COLUMN     "password_token_expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "users_email_verification_token_idx" ON "users"("email_verification_token");

-- CreateIndex
CREATE INDEX "users_password_reset_token_idx" ON "users"("password_reset_token");
