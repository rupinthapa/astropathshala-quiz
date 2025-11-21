import { Hono } from "hono";
import { prisma } from "../../src/lib/prisma";
import { QuestionType, QuestionOption } from "@prisma/client";
import fs from "fs";
import path from "path";

// Type guard to check if a string is a valid QuestionType
function isQuestionType(value: string): value is QuestionType {
  return Object.values(QuestionType).includes(value as QuestionType);
}

// Type guard to check if a string is a valid QuestionOption
function isQuestionOption(value: string): value is QuestionOption {
  return Object.values(QuestionOption).includes(value as QuestionOption);
}

export const questionsRouter = new Hono();

/**
 * SAVE UPLOADED FILE
 */
async function saveUploadedFile(file: File | null): Promise<string | null> {
  if (!file) return null;

  const uploadDir = path.join(process.cwd(), "public", "uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, `${Date.now()}-${file.name}`);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  fs.writeFileSync(filePath, buffer);

  return `/uploads/${path.basename(filePath)}`;
}

/**
 * CREATE QUESTION
 */
questionsRouter.post("/create", async (c) => {
  const form = await c.req.formData();
  const roundId = Number(form.get("roundId"));
  const text = String(form.get("text"));
  
  // Validate and parse question type
  const typeValue = form.get("type");
  if (typeof typeValue !== 'string' || !isQuestionType(typeValue)) {
    return c.json({ error: "Invalid question type" }, 400);
  }
  const type = typeValue as QuestionType;
  
  // Parse options
  const optionA = form.get("optionA")?.toString() ?? null;
  const optionB = form.get("optionB")?.toString() ?? null;
  const optionC = form.get("optionC")?.toString() ?? null;
  const optionD = form.get("optionD")?.toString() ?? null;
  
  // Validate and parse correct option if provided
  const correctOptionValue = form.get("correctOption");
  const correctOption = correctOptionValue && typeof correctOptionValue === 'string' && isQuestionOption(correctOptionValue)
    ? correctOptionValue as QuestionOption
    : null;
    
  const points = Number(form.get("points"));
  const timeLimitSec = Number(form.get("timeLimitSec"));

  const mediaFile = form.get("mediaFile") as File | null;
  const mediaURL = await saveUploadedFile(mediaFile);

  const lastQuestion = await prisma.question.findFirst({
    where: { roundId },
    orderBy: { orderInRound: "desc" },
  });

  const orderInRound = lastQuestion ? lastQuestion.orderInRound + 1 : 1;

  const newQuestion = await prisma.question.create({
    data: {
      roundId,
      text,
      type,
      optionA,
      optionB,
      optionC,
      optionD,
      correctOption,
      mediaURL,
      points,
      timeLimitSec,
      orderInRound,
    },
  });

  return c.json({ success: true, question: newQuestion });
});

/**
 * UPDATE QUESTION
 */
questionsRouter.post("/update", async (c) => {
  const form = await c.req.formData();
  const questionId = Number(form.get("questionId"));

  const text = String(form.get("text"));
  
  // Validate and parse question type
  const typeValue = form.get("type");
  if (typeof typeValue !== 'string' || !isQuestionType(typeValue)) {
    return c.json({ error: "Invalid question type" }, 400);
  }
  const type = typeValue as QuestionType;
  
  // Parse options
  const optionA = form.get("optionA")?.toString() ?? null;
  const optionB = form.get("optionB")?.toString() ?? null;
  const optionC = form.get("optionC")?.toString() ?? null;
  const optionD = form.get("optionD")?.toString() ?? null;
  
  // Validate and parse correct option if provided
  const correctOptionValue = form.get("correctOption");
  const correctOption = correctOptionValue && typeof correctOptionValue === 'string' && isQuestionOption(correctOptionValue)
    ? correctOptionValue as QuestionOption
    : null;
  const points = Number(form.get("points"));
  const timeLimitSec = Number(form.get("timeLimitSec"));

  const mediaFile = form.get("mediaFile") as File | null;
  const mediaURL = mediaFile ? await saveUploadedFile(mediaFile) : undefined;

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: {
      text,
      type,
      optionA,
      optionB,
      optionC,
      optionD,
      correctOption,
      points,
      timeLimitSec,
      ...(mediaURL ? { mediaURL } : {}),
    },
  });

  return c.json({ success: true, updated });
});

/**
 * DELETE QUESTION
 */
questionsRouter.post("/delete", async (c) => {
  const form = await c.req.formData();
  const questionId = Number(form.get("questionId"));

  await prisma.question.delete({
    where: { id: questionId },
  });

  return c.json({ success: true });
});
