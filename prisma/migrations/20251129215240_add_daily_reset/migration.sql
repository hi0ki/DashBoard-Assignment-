-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "last_reset_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
