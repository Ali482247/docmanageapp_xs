-- AlterTable
ALTER TABLE "public"."Document" ADD COLUMN     "mainExecutorId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_mainExecutorId_fkey" FOREIGN KEY ("mainExecutorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
