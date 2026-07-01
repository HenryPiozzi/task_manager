import { createTRPCRouter } from "../trpc";
import { taskRouter } from "./task";

export const appRouter = createTRPCRouter({
  task: taskRouter,
});

// Type exported to the client (end-to-end type inference).
export type AppRouter = typeof appRouter;
