import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { clients, exercises, schedules, Client, Exercise, Schedule } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const fitnessRouter = router({
  // Clients
  getClients: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) throw new Error("Not authenticated");
    const db = await getDb();
    if (!db) return [];

    return await db.select().from(clients).where(eq(clients.userId, ctx.user.id));
  }),

  createClient: publicProcedure
    .input(z.object({
      name: z.string(),
      phone: z.string().optional(),
      email: z.string().optional(),
      birthDate: z.string().optional(),
      experience: z.string().optional(),
      injuries: z.string().optional(),
      contraindications: z.string().optional(),
      chronicDiseases: z.string().optional(),
      badHabits: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) throw new Error("Not authenticated");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(clients).values({
        userId: ctx.user.id,
        ...input,
      });

      return result;
    }),

  updateClient: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      birthDate: z.string().optional(),
      experience: z.string().optional(),
      injuries: z.string().optional(),
      contraindications: z.string().optional(),
      chronicDiseases: z.string().optional(),
      badHabits: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) throw new Error("Not authenticated");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...data } = input;
      await db.update(clients)
        .set(data)
        .where(and(eq(clients.id, id), eq(clients.userId, ctx.user.id)));

      return { success: true };
    }),

  deleteClient: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) throw new Error("Not authenticated");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(clients)
        .where(and(eq(clients.id, input), eq(clients.userId, ctx.user.id)));

      return { success: true };
    }),

  // Exercises
  getExercises: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) throw new Error("Not authenticated");
    const db = await getDb();
    if (!db) return [];

    return await db.select().from(exercises).where(eq(exercises.userId, ctx.user.id));
  }),

  createExercise: publicProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      muscleGroup: z.string().optional(),
      type: z.string().optional(),
      sets: z.number().optional(),
      reps: z.string().optional(),
      weight: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) throw new Error("Not authenticated");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(exercises).values({
        userId: ctx.user.id,
        ...input,
      });

      return result;
    }),

  updateExercise: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      muscleGroup: z.string().optional(),
      type: z.string().optional(),
      sets: z.number().optional(),
      reps: z.string().optional(),
      weight: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) throw new Error("Not authenticated");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...data } = input;
      await db.update(exercises)
        .set(data)
        .where(and(eq(exercises.id, id), eq(exercises.userId, ctx.user.id)));

      return { success: true };
    }),

  deleteExercise: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) throw new Error("Not authenticated");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(exercises)
        .where(and(eq(exercises.id, input), eq(exercises.userId, ctx.user.id)));

      return { success: true };
    }),

  // Schedules
  getSchedules: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) throw new Error("Not authenticated");
    const db = await getDb();
    if (!db) return [];

    return await db.select().from(schedules).where(eq(schedules.userId, ctx.user.id));
  }),

  createSchedule: publicProcedure
    .input(z.object({
      clientId: z.number().optional(),
      exerciseId: z.number().optional(),
      date: z.string(),
      time: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) throw new Error("Not authenticated");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(schedules).values({
        userId: ctx.user.id,
        ...input,
      });

      return result;
    }),

  updateSchedule: publicProcedure
    .input(z.object({
      id: z.number(),
      clientId: z.number().optional(),
      exerciseId: z.number().optional(),
      date: z.string().optional(),
      time: z.string().optional(),
      notes: z.string().optional(),
      completed: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) throw new Error("Not authenticated");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...data } = input;
      await db.update(schedules)
        .set(data)
        .where(and(eq(schedules.id, id), eq(schedules.userId, ctx.user.id)));

      return { success: true };
    }),

  deleteSchedule: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) throw new Error("Not authenticated");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(schedules)
        .where(and(eq(schedules.id, input), eq(schedules.userId, ctx.user.id)));

      return { success: true };
    }),

  // Public Onboarding Flow
  submitOnboarding: publicProcedure
    .input(z.object({
      trainerId: z.number(),
      name: z.string(),
      phone: z.string().optional(),
      email: z.string().optional(),
      birthDate: z.string().optional(),
      experience: z.string().optional(),
      injuries: z.string().optional(),
      contraindications: z.string().optional(),
      chronicDiseases: z.string().optional(),
      badHabits: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Note: This is a public endpoint (or protected by generic auth) where a client 
      // submits data to be added to a Trainer's list. 
      // Real-world: Should probably verify a token or invite code.
      // For now: Trusted MVP flow logic.

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { trainerId, ...data } = input;

      const result = await db.insert(clients).values({
        userId: trainerId,
        ...data,
      });

      return result;
    }),
});
