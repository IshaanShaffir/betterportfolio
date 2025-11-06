/*
  Warnings:

  - Added the required column `heroHeading` to the `site_content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `heroSubheading` to the `site_content` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "site_content" ADD COLUMN "heroHeading" TEXT NOT NULL DEFAULT 'Hi, I''m Ishaan.',
ADD COLUMN "heroSubheading" TEXT NOT NULL DEFAULT 'I build practical, thoughtful web experiences.';

-- Remove defaults after adding columns
ALTER TABLE "site_content" ALTER COLUMN "heroHeading" DROP DEFAULT,
ALTER COLUMN "heroSubheading" DROP DEFAULT;
