import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Foundation-only schema. The procurement / Reliability Core schema is owned by
// the next milestone — do not extend this table for product data.
export default defineSchema({
  healthProbes: defineTable({
    deploymentName: v.string(),
    note: v.string(),
    createdAt: v.number(),
  }),
});
