"use server";

import { 
  getDashboardStats as getDashboardStatsQuery,
  getRecentDecks as getRecentDecksQuery 
} from "@/db/queries/deck-queries";
import type { DashboardStats, DeckWithCardCount } from "@/db/queries/deck-queries";

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    return await getDashboardStatsQuery(); // Using helper function
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      throw error; // Re-throw auth errors
    }
    return {
      totalDecks: 0,
      totalCards: 0,
      studySessions: 0
    };
  }
}

export async function getRecentDecks(limit: number = 5): Promise<DeckWithCardCount[]> {
  try {
    return await getRecentDecksQuery(limit); // Using helper function
  } catch (error) {
    console.error("Error fetching recent decks:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      throw error; // Re-throw auth errors
    }
    return [];
  }
}
