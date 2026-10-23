-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL DEFAULT 'store-settings',
    "storeName" TEXT NOT NULL DEFAULT 'PEARLCRAFTS FASHION WORLD',
    "productFocus" TEXT NOT NULL DEFAULT 'Fascinators, headpieces and hair accessories',
    "businessAddress" TEXT NOT NULL DEFAULT '',
    "businessHours" TEXT NOT NULL DEFAULT '',
    "businessEmail" TEXT NOT NULL DEFAULT 'info@pearlcrafts.com',
    "businessPhone" TEXT NOT NULL DEFAULT '+256 782 595 996',
    "whatsappNumber" TEXT NOT NULL DEFAULT '+256 782 595 996',
    "facebookUrl" TEXT NOT NULL DEFAULT 'https://www.facebook.com/pearlcraftsfashionworld',
    "instagramUrl" TEXT NOT NULL DEFAULT 'https://www.instagram.com/pearlcrafts.fw_ug',
    "tiktokUrl" TEXT NOT NULL DEFAULT 'https://www.tiktok.com/@pearlcraftsfashionworld',
    "orderNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "deliveryInstructions" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);
