"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { decksTable, cardsTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getDashboardStats() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  try {
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
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalDecks: 0,
      totalCards: 0,
      studySessions: 0
    };
  }
}

export async function getRecentDecks() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  try {
    const recentDecks = await db.select({
      id: decksTable.id,
      title: decksTable.title,
      description: decksTable.description,
      createdAt: decksTable.createdAt,
      cardCount: sql<number>`count(${cardsTable.id})`.as('cardCount')
    })
    .from(decksTable)
    .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .where(eq(decksTable.userId, userId))
    .groupBy(decksTable.id, decksTable.title, decksTable.description, decksTable.createdAt)
    .orderBy(decksTable.createdAt)
    .limit(5);
    
    return recentDecks;
  } catch (error) {
    console.error("Error fetching recent decks:", error);
    return [];
  }
}
