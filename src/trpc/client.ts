"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_app";

/**
 * "React" tRPC client — exposes typed hooks such as
 * trpc.task.list.useQuery(), trpc.task.create.useMutation(), etc.
 * The AppRouter type guarantees end-to-end type inference (the frontend
 * "knows" the exact shape of the data without needing to manually
 * generate or duplicate types).
 */
export const trpc = createTRPCReact<AppRouter>();
