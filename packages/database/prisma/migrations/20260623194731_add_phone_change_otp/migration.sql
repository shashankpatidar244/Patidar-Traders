-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "pendingPhone" TEXT;
