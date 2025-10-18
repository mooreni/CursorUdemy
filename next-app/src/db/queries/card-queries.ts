import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { cardsTable, decksTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

// Types
export interface Card {
  id: number;
  front: string;
  back: string;
  deckId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Zod schemas for card mutations (as per data-handling rule)
export const CreateCardSchema = z.object({
  front: z.string().min(1, "Front text is required"),
  back: z.string().min(1, "Back text is required"),
  deckId: z.number().int().positive("Invalid deck ID"),
});

export const UpdateCardSchema = z.object({
  id: z.number().int().positive("Invalid card ID"),
  front: z.string().min(1, "Front text is required"),
  back: z.string().min(1, "Back text is required"),
});

export type CreateCardInput = z.infer<typeof CreateCardSchema>;
export type UpdateCardInput = z.infer<typeof UpdateCardSchema>;

/**
 * Verify that a card belongs to a deck owned by the authenticated user
 * @param cardId The card ID to verify
 * @param userId The user ID to verify ownership against
 * @returns The card if ownership is verified
 */
async function verifyCardOwnership(cardId: number, userId: string): Promise<Card> {
  const result = await db.select()
    .from(cardsTable)
    .leftJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(
      eq(cardsTable.id, cardId),
      eq(decksTable.userId, userId)
    ));
    
  if (!result.length) {
    throw new Error("Card not found or access denied");
  }
  
  return result[0].cards;
}

/**
 * Get all cards for a specific deck owned by the authenticated user
 * @param deckId The ID of the deck to get cards from
 * @returns Array of cards in the deck
 */
export async function getDeckCards(deckId: number): Promise<Card[]> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Verify deck ownership first
  const deckCheck = await db.select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ));
    
  if (!deckCheck.length) {
    throw new Error("Deck not found or access denied");
  }
  
  return await db.select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(desc(cardsTable.updatedAt));
}

/**
 * Create a new card in a deck owned by the authenticated user
 * @param input The card data to create
 * @returns The created card
 */
export async function createCard(input: CreateCardInput): Promise<Card> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Validate input with Zod
  const validatedInput = CreateCardSchema.parse(input);
  
  // Verify deck ownership
  const deckCheck = await db.select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, validatedInput.deckId),
      eq(decksTable.userId, userId)
    ));
    
  if (!deckCheck.length) {
    throw new Error("Deck not found or access denied");
  }
  
  const [newCard] = await db.insert(cardsTable).values({
    ...validatedInput,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();
  
  // Update deck's updatedAt timestamp
  await db.update(decksTable)
    .set({ updatedAt: new Date() })
    .where(eq(decksTable.id, validatedInput.deckId));
  
  return newCard;
}

/**
 * Update a card owned by the authenticated user
 * @param input The card data to update
 * @returns The updated card
 */
export async function updateCard(input: UpdateCardInput): Promise<Card> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Validate input with Zod
  const validatedInput = UpdateCardSchema.parse(input);
  
  // Verify ownership before update
  const existingCard = await verifyCardOwnership(validatedInput.id, userId);
  
  const [updatedCard] = await db.update(cardsTable)
    .set({
      front: validatedInput.front,
      back: validatedInput.back,
      updatedAt: new Date()
    })
    .where(eq(cardsTable.id, validatedInput.id))
    .returning();
    
  // Update deck's updatedAt timestamp
  await db.update(decksTable)
    .set({ updatedAt: new Date() })
    .where(eq(decksTable.id, existingCard.deckId));
    
  return updatedCard;
}

/**
 * Delete a card owned by the authenticated user
 * @param cardId The ID of the card to delete
 * @returns The deckId of the deleted card for revalidation purposes
 */
export async function deleteCard(cardId: number): Promise<number> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Verify ownership before deletion
  const existingCard = await verifyCardOwnership(cardId, userId);
  
  await db.delete(cardsTable)
    .where(eq(cardsTable.id, cardId));
    
  // Update deck's updatedAt timestamp
  await db.update(decksTable)
    .set({ updatedAt: new Date() })
    .where(eq(decksTable.id, existingCard.deckId));
    
  // Return deckId for revalidation
  return existingCard.deckId;
}
