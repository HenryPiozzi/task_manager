import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

/**
 * tRPC context. This could hold, for example, authentication data or a
 * database connection. Since the challenge does not require auth, we
 * keep the context empty for now, but the structure is already in place
 * so it can be extended easily later.
 */
export const createTRPCContext = async () => {
  return {};
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson, // allows Date, Map, etc. to be serialized correctly
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Exposes Zod validation errors in a structured way, making it
        // easy to show field-specific messages on the frontend.
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export { TRPCError };
