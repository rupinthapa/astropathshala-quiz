/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `RoundScore` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `RoundScore` table. All the data in the column will be lost.
  - You are about to drop the column `memberNames` on the `Team` table. All the data in the column will be lost.
  - Added the required column `type` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'PUZZLE', 'RAPID', 'BUZZER');

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "mediaURL" TEXT,
ADD COLUMN     "type" "QuestionType" NOT NULL,
ALTER COLUMN "optionA" DROP NOT NULL,
ALTER COLUMN "optionB" DROP NOT NULL,
ALTER COLUMN "optionC" DROP NOT NULL,
ALTER COLUMN "optionD" DROP NOT NULL,
ALTER COLUMN "correctOption" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RoundScore" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "memberNames",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "totalScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "used5050" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AnswerLog" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "selectedOption" "QuestionOption",
    "isCorrect" BOOLEAN NOT NULL,
    "pointsAwarded" INTEGER NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnswerLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuzzerEvent" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "pressedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuzzerEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AnswerLog" ADD CONSTRAINT "AnswerLog_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerLog" ADD CONSTRAINT "AnswerLog_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuzzerEvent" ADD CONSTRAINT "BuzzerEvent_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuzzerEvent" ADD CONSTRAINT "BuzzerEvent_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
