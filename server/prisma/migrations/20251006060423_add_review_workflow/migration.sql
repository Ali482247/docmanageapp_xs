-- CreateEnum
CREATE TYPE "public"."ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."DocumentReviewer" (
    "id" SERIAL NOT NULL,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "documentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "DocumentReviewer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentReviewer_documentId_userId_key" ON "public"."DocumentReviewer"("documentId", "userId");

-- AddForeignKey
ALTER TABLE "public"."DocumentReviewer" ADD CONSTRAINT "DocumentReviewer_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentReviewer" ADD CONSTRAINT "DocumentReviewer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
