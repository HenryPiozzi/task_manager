import { z } from "zod";
import { createTRPCRouter, publicProcedure, TRPCError } from "../trpc";
import { tasksStore, type Task } from "../db";

// Validation schemas shared by create/update.
const titleSchema = z
  .string()
  .trim()
  .min(1, "Title is required.")
  .max(120, "Title must be at most 120 characters long.");

const descriptionSchema = z
  .string()
  .trim()
  .max(1000, "Description must be at most 1000 characters long.")
  .optional();

export const taskRouter = createTRPCRouter({
  /**
   * Lists tasks, most recent first.
   * Supports simple cursor-based pagination to enable infinite scroll
   * on the frontend (challenge bonus).
   */
  list: publicProcedure
    .input(
      z
        .object({
          cursor: z.number().nullish(), // starting index
          limit: z.number().min(1).max(50).default(10),
        })
        .optional()
    )
    .query(({ input }) => {
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor ?? 0;

      const sorted = [...tasksStore].sort(
        (a, b) => b.dataCriacao - a.dataCriacao
      );

      const page = sorted.slice(cursor, cursor + limit);
      const nextCursor =
        cursor + limit < sorted.length ? cursor + limit : undefined;

      return {
        items: page,
        nextCursor,
        total: sorted.length,
      };
    }),

  /** Fetches a single task by id (used on the edit page). */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const task = tasksStore.find((t) => t.id === input.id);
      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Task with id "${input.id}" was not found.`,
        });
      }
      return task;
    }),

  /** Creates a new task. Title is required (validated via Zod). */
  create: publicProcedure
    .input(
      z.object({
        titulo: titleSchema,
        descricao: descriptionSchema,
      })
    )
    .mutation(({ input }) => {
      const newTask: Task = {
        id: crypto.randomUUID(),
        titulo: input.titulo,
        descricao: input.descricao || undefined,
        dataCriacao: Date.now(),
      };
      tasksStore.push(newTask);
      return newTask;
    }),

  /**
   * Updates an existing task.
   * Returns a NOT_FOUND error if the id does not exist — as required by
   * the challenge.
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        titulo: titleSchema,
        descricao: descriptionSchema,
      })
    )
    .mutation(({ input }) => {
      const index = tasksStore.findIndex((t) => t.id === input.id);
      if (index === -1) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Cannot update: task with id "${input.id}" does not exist.`,
        });
      }

      const updated: Task = {
        ...tasksStore[index],
        titulo: input.titulo,
        descricao: input.descricao || undefined,
      };
      tasksStore[index] = updated;
      return updated;
    }),

  /**
   * Removes a task. Also returns NOT_FOUND if the id does not exist,
   * instead of failing silently.
   */
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const index = tasksStore.findIndex((t) => t.id === input.id);
      if (index === -1) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Cannot delete: task with id "${input.id}" does not exist.`,
        });
      }
      const [removed] = tasksStore.splice(index, 1);
      return removed;
    }),
});
