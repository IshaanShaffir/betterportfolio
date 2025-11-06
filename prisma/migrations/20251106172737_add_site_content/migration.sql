-- CreateTable
CREATE TABLE "site_content" (
    "id" SERIAL NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroBio" TEXT NOT NULL,
    "aboutParagraph1" TEXT NOT NULL,
    "aboutParagraph2" TEXT NOT NULL,
    "aboutParagraph3" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "favouriteStack" TEXT NOT NULL,
    "currentlyVibing" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_content_pkey" PRIMARY KEY ("id")
);
