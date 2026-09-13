import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { mission, event, receipt } from "./validators";

export default defineSchema({
  // A bounded mission aggregate makes evidence, decisions and effects atomic.
  missions: defineTable({ key: v.string(), data: mission }).index("by_key", [
    "key",
  ]),
  missionEvents: defineTable({ missionKey: v.string(), data: event }).index(
    "by_missionKey",
    ["missionKey"],
  ),
  // Independent fixture transport state. Never an external provider success claim.
  fixtureReceipts: defineTable(receipt).index("by_key", ["key"]),
  healthProbes: defineTable({
    deploymentName: v.string(),
    note: v.string(),
    createdAt: v.number(),
  }),
});
