import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { clients } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const clientRouter = router({
    create: publicProcedure
        .input(z.object({
            name: z.string(),
            phone: z.string().optional(),
            email: z.string().optional(),
            birthDate: z.string().optional(),
            height: z.number().optional(),
            weight: z.number().optional(),
            gender: z.enum(["male", "female"]).optional(),
            goals: z.string().optional(),
            telegramId: z.string().optional(),
            experience: z.string().optional(),
            injuries: z.string().optional(),
            contraindications: z.string().optional(),
            chronicDiseases: z.string().optional(),
            badHabits: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const db = await getDb();
            if (!db) throw new Error("Database not available");

            // For MVP, we assign all self-registered clients to the first admin user (ID 1)
            // Later we can implement Logic to match trainer by referral link or code
            const defaultTrainerId = 1;

            // Check if client already exists by telegramId
            if (input.telegramId) {
                const existing = await db.select().from(clients).where(eq(clients.telegramId, input.telegramId));
                if (existing.length > 0) {
                    // Update existing or return error? Let's just update for now
                    // or throw error "You are already registered"
                    throw new Error("Вы уже зарегистрированы!");
                }
            }

            const result = await db.insert(clients).values({
                userId: defaultTrainerId,
                ...input,
            });

            return result;
        }),

    list: publicProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];

        // For MVP, fetch all clients (assuming single trainer)
        return db.select().from(clients);
    }),
});
