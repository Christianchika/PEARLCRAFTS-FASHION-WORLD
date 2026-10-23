ALTER TABLE "CustomOrderQuotation"
ADD COLUMN "shareTokenHash" TEXT;

CREATE UNIQUE INDEX "CustomOrderQuotation_shareTokenHash_key"
ON "CustomOrderQuotation"("shareTokenHash");
