-- CreateTable
CREATE TABLE "public"."Violation" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "correspondenceId" INTEGER,

    CONSTRAINT "Violation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Violation" ADD CONSTRAINT "Violation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Violation" ADD CONSTRAINT "Violation_correspondenceId_fkey" FOREIGN KEY ("correspondenceId") REFERENCES "public"."Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
