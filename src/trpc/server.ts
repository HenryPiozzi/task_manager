import "server-only";
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";

/**
 * Caller used directly in Server Components to achieve "real" SSR:
 * we call the tRPC router directly on the server (without going through
 * HTTP), which is faster and is the approach recommended by tRPC itself
 * for the Next.js App Router. The listing page (`app/page.tsx`) uses this
 * to render the tasks in the initial HTML.
 */
export async function createServerCaller() {
  const ctx = await createTRPCContext();
  return appRouter.createCaller(ctx);
}
