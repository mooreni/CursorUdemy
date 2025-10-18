import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { decksTable, cardsTable } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { z } from "zod";

// Types
export interface DashboardStats {
  totalDecks: number;
  totalCards: number;
  studySessions: number;
}

export interface DeckWithCardCount {
  id: number;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  cardCount: number;
}

export interface Deck {
  id: number;
  title: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Zod schemas for deck mutations (as per data-handling rule)
export const CreateDeckSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
});

export const UpdateDeckSchema = z.object({
  id: z.number().int().positive("Invalid deck ID"),
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
});

export type CreateDeckInput = z.infer<typeof CreateDeckSchema>;
export type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>;

/**
 * Get all decks for the authenticated user with card counts
 * @returns Array of user's decks with card counts
 */
export async function getUserDecks(): Promise<DeckWithCardCount[]> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return await db.select({
    id: decksTable.id,
    title: decksTable.title,
    description: decksTable.description,
    createdAt: decksTable.createdAt,
    updatedAt: decksTable.updatedAt,
    cardCount: sql<number>`count(${cardsTable.id})`.as('cardCount')
  })
    .from(decksTable)
    .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .where(eq(decksTable.userId, userId))
    .groupBy(decksTable.id)
    .orderBy(decksTable.updatedAt);
}

/**
 * Get a specific deck by ID for the authenticated user
 * @param deckId The ID of the deck to retrieve
 * @returns The deck if found and owned by user
 */
export async function getDeckById(deckId: number): Promise<Deck> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [deck] = await db.select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ));

  if (!deck) {
    throw new Error("Deck not found or access denied");
  }

  return deck;
}

/**
 * Get a deck with its cards for the authenticated user
 * @param deckId The ID of the deck to retrieve with cards
 * @returns The deck with its associated cards
 */
export async function getDeckWithCards(deckId: number) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify deck ownership first
  await getDeckById(deckId);

  const deck = await db.select()
    .from(decksTable)
    .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .orderBy(desc(cardsTable.updatedAt));

  if (!deck.length) {
    throw new Error("Deck not found");
  }

  return deck;
}

/**
 * Get dashboard statistics for the authenticated user
 * @returns Dashboard stats including total decks, cards, and study sessions
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Get total decks count for the user
  const deckCountResult = await db.select({
    count: sql<number>`count(*)`.as('count')
  }).from(decksTable).where(eq(decksTable.userId, userId));
  
  const totalDecks = deckCountResult[0]?.count || 0;
  
  // Get total cards count for all user's decks
  const cardCountResult = await db.select({
    count: sql<number>`count(*)`.as('count')
  })
  .from(cardsTable)
  .leftJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
  .where(eq(decksTable.userId, userId));
  
  const totalCards = cardCountResult[0]?.count || 0;
  
  return {
    totalDecks,
    totalCards,
    studySessions: 0 // Placeholder for now, can be implemented later
  };
}

/**
 * Get recent decks for the authenticated user with card counts
 * @param limit Number of recent decks to return (default: 5)
 * @returns Array of recent decks with card counts
 */
export async function getRecentDecks(limit: number = 5): Promise<DeckWithCardCount[]> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  const recentDecks = await db.select({
    id: decksTable.id,
    title: decksTable.title,
    description: decksTable.description,
    createdAt: decksTable.createdAt,
    updatedAt: decksTable.updatedAt,
    cardCount: sql<number>`count(${cardsTable.id})`.as('cardCount')
  })
  .from(decksTable)
  .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
  .where(eq(decksTable.userId, userId))
  .groupBy(decksTable.id, decksTable.title, decksTable.description, decksTable.createdAt, decksTable.updatedAt)
  .orderBy(decksTable.createdAt)
  .limit(limit);
  
  return recentDecks.map(deck => ({
    ...deck,
    cardCount: Number(deck.cardCount) || 0
  }));
}

/**
 * Create a new deck for the authenticated user
 * @param input The deck data to create
 * @returns The created deck
 */
export async function createDeck(input: CreateDeckInput): Promise<Deck> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Validate input with Zod
  const validatedInput = CreateDeckSchema.parse(input);
  
  const [newDeck] = await db.insert(decksTable).values({
    ...validatedInput,
    userId,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();
  
  return newDeck;
}

/**
 * Update a deck for the authenticated user
 * @param input The deck data to update
 * @returns The updated deck
 */
export async function updateDeck(input: UpdateDeckInput): Promise<Deck> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Validate input with Zod
  const validatedInput = UpdateDeckSchema.parse(input);
  
  // Verify ownership before update
  await getDeckById(validatedInput.id);
  
  const [updatedDeck] = await db.update(decksTable)
    .set({
      title: validatedInput.title,
      description: validatedInput.description,
      updatedAt: new Date()
    })
    .where(and(
      eq(decksTable.id, validatedInput.id),
      eq(decksTable.userId, userId)
    ))
    .returning();
    
  return updatedDeck;
}

/**
 * Delete a deck for the authenticated user
 * @param deckId The ID of the deck to delete
 */
export async function deleteDeck(deckId: number): Promise<void> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Verify ownership before deletion
  await getDeckById(deckId);
  
  await db.delete(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ));
}
