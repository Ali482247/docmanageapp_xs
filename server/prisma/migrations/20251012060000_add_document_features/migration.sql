-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('YANGI', 'IJROGA_YUBORILDI', 'KORIB_CHIQILMOQDA', 'BAJARILGAN');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN "status" "DocumentStatus" NOT NULL DEFAULT 'YANGI',
ADD COLUMN "stageDeadline" TIMESTAMP(3),
ADD COLUMN "metadata" JSONB;

-- CreateTable
CREATE TABLE "DocumentCoExecutor" (
    "id" SERIAL NOT NULL,
    "documentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentCoExecutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentContributor" (
    "id" SERIAL NOT NULL,
    "documentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentContributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "documentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "details" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AISuggestion" (
    "id" SERIAL NOT NULL,
    "documentId" INTEGER NOT NULL,
    "suggestedMainExecutorId" INTEGER,
    "reason" TEXT,
    "sentiment" TEXT,
    "riskFlag" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AISuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentCoExecutor_documentId_userId_key" ON "DocumentCoExecutor"("documentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentContributor_documentId_userId_key" ON "DocumentContributor"("documentId", "userId");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");
CREATE INDEX "Document_stage_idx" ON "Document"("stage");
CREATE INDEX "Document_deadline_idx" ON "Document"("deadline");
CREATE INDEX "Document_stageDeadline_idx" ON "Document"("stageDeadline");

-- AddForeignKey
ALTER TABLE "DocumentCoExecutor" ADD CONSTRAINT "DocumentCoExecutor_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentCoExecutor" ADD CONSTRAINT "DocumentCoExecutor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentContributor" ADD CONSTRAINT "DocumentContributor_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentContributor" ADD CONSTRAINT "DocumentContributor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISuggestion" ADD CONSTRAINT "AISuggestion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;