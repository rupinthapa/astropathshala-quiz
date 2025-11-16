/*
  Warnings:

  - You are about to drop the column `color` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `totalScore` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `used5050` on the `Team` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RoundScore" ADD COLUMN     "quizEventId" INTEGER;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "color",
DROP COLUMN "createdAt",
DROP COLUMN "totalScore",
DROP COLUMN "updatedAt",
DROP COLUMN "used5050",
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "RoundScore" ADD CONSTRAINT "RoundScore_quizEventId_fkey" FOREIGN KEY ("quizEventId") REFERENCES "QuizEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
