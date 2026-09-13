import { z } from "zod";
const vendorId = z.enum(["catalogue", "studio", "express", "social"]);
const text = z.string().trim().min(1).max(1500);
export const agentCommandSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("ask_requirements"), question: text }).strict(),
  z.object({ type: z.literal("request_quote"), vendorId }).strict(),
  z
    .object({ type: z.literal("clarify_quote"), vendorId, question: text })
    .strict(),
  z
    .object({ type: z.literal("recommend"), vendorId, rationale: text })
    .strict(),
  z.object({ type: z.literal("execute_effect"), effectKey: text }).strict(),
  z.object({ type: z.literal("verify_effect"), effectKey: text }).strict(),
  z.object({ type: z.literal("complete_mission") }).strict(),
]);
export const commandSchema = z.union([
  agentCommandSchema,
  z.discriminatedUnion("type", [
    z
      .object({
        type: z.literal("create"),
        key: z.string().regex(/^[a-zA-Z0-9-]{1,80}$/),
        request: text,
      })
      .strict(),
    z
      .object({
        type: z.literal("answer_requirements"),
        quantity: z.number().int().min(1).max(1000),
        budgetCents: z.number().int().positive().max(10000000),
        deadlineAt: z.number().int().positive(),
        branded: z.boolean(),
      })
      .strict(),
    z
      .object({
        type: z.literal("approve"),
        recommendationVersion: z.number().int().positive(),
      })
      .strict(),
    z
      .object({
        type: z.literal("reject"),
        recommendationVersion: z.number().int().positive(),
      })
      .strict(),
    z.object({ type: z.literal("inject_update") }).strict(),
    z.object({ type: z.literal("run_agent") }).strict(),
  ]),
]);
