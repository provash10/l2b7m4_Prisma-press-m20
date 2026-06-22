/*
  Warnings:

  - You are about to drop the column `createdAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `profilePhoto` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "createdAt",
DROP COLUMN "profilePhoto",
DROP COLUMN "updatedAt",
ALTER COLUMN "bio" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profilePhoto" TEXT;
