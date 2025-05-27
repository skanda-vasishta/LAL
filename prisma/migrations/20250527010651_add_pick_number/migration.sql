/*
  Warnings:

  - Added the required column `pickNumber` to the `trade_draft_picks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "trade_draft_picks" ADD COLUMN     "pickNumber" INTEGER NOT NULL;
