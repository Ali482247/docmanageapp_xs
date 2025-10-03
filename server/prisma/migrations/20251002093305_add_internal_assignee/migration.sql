-- AlterTable
ALTER TABLE "public"."Document" ADD COLUMN     "internalAssigneeId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_internalAssigneeId_fkey" FOREIGN KEY ("internalAssigneeId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
