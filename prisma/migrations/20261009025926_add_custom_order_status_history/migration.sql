-- CreateTable
CREATE TABLE "CustomOrderStatusHistory" (
    "id" TEXT NOT NULL,
    "customOrderId" TEXT NOT NULL,
    "fromStatus" "CustomOrderStatus",
    "toStatus" "CustomOrderStatus" NOT NULL,
    "changedById" TEXT,
    "changedByName" TEXT,
    "changedByEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomOrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomOrderStatusHistory_customOrderId_idx" ON "CustomOrderStatusHistory"("customOrderId");

-- CreateIndex
CREATE INDEX "CustomOrderStatusHistory_createdAt_idx" ON "CustomOrderStatusHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "CustomOrderStatusHistory" ADD CONSTRAINT "CustomOrderStatusHistory_customOrderId_fkey" FOREIGN KEY ("customOrderId") REFERENCES "CustomOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
