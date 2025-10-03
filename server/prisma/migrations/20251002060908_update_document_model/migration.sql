/*
  Warnings:

  - You are about to drop the column `userId` on the `Document` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('Kiruvchi', 'Chiquvchi');

-- CreateEnum
CREATE TYPE "public"."DocumentStage" AS ENUM ('PENDING_REGISTRATION', 'REGISTRATION', 'RESOLUTION', 'ASSIGNMENT', 'EXECUTION', 'DRAFTING', 'REVISION_REQUESTED', 'SIGNATURE', 'DISPATCH', 'FINAL_REVIEW', 'COMPLETED', 'REJECTED', 'ON_HOLD', 'CANCELLED', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "public"."Document" DROP CONSTRAINT "Document_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Document" DROP COLUMN "userId",
ADD COLUMN     "authorId" INTEGER NOT NULL,
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "source" TEXT,
ADD COLUMN     "stage" "public"."DocumentStage" NOT NULL DEFAULT 'PENDING_REGISTRATION',
ADD COLUMN     "type" "public"."DocumentType" NOT NULL DEFAULT 'Kiruvchi';

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
