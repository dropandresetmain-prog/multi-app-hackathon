import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { assertAccess } from "./environment";
import { commandSchema } from "../lib/procurement/commands";
import { dispatch } from "./effectAdapter";

export const command = action({
  args: { accessToken: v.string(), key: v.string(), command: v.string() },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    assertAccess(args.accessToken);
    const command = commandSchema.parse(JSON.parse(args.command));
    if (command.type === "execute_effect" || command.type === "verify_effect")
      return await dispatch(ctx, args.key, command);
    return await ctx.runMutation(internal.missions.apply, {
      key: args.key,
      command: JSON.stringify(command),
    });
  },
});
