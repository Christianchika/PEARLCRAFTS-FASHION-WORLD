-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "CustomOrderQuotation" (
    "id" TEXT NOT NULL,
    "customOrderId" TEXT NOT NULL,
    "quotationNumber" TEXT NOT NULL,
    "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'UGX',
    "subtotal" INTEGER NOT NULL DEFAULT 0,
    "deliveryFee" INTEGER NOT NULL DEFAULT 0,
    "additionalFees" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "estimatedCompletion" TEXT,
    "paymentTerms" TEXT,
    "notes" TEXT,
    "validUntil" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "customerRespondedAt" TIMESTAMP(3),
    "createdByName" TEXT,
    "createdByEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomOrderQuotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomOrderQuoteItem" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "lineTotal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomOrderQuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomOrderQuotation_quotationNumber_key" ON "CustomOrderQuotation"("quotationNumber");

-- CreateIndex
CREATE INDEX "CustomOrderQuotation_customOrderId_createdAt_idx" ON "CustomOrderQuotation"("customOrderId", "createdAt");

-- CreateIndex
CREATE INDEX "CustomOrderQuotation_status_idx" ON "CustomOrderQuotation"("status");

-- CreateIndex
CREATE INDEX "CustomOrderQuoteItem_quotationId_idx" ON "CustomOrderQuoteItem"("quotationId");

-- AddForeignKey
ALTER TABLE "CustomOrderQuotation" ADD CONSTRAINT "CustomOrderQuotation_customOrderId_fkey" FOREIGN KEY ("customOrderId") REFERENCES "CustomOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderQuoteItem" ADD CONSTRAINT "CustomOrderQuoteItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "CustomOrderQuotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
