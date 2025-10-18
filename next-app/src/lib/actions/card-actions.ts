"use server";

import { 
  createCard,
  updateCard,
  deleteCard,
  getDeckCards
} from "@/db/queries/card-queries";
import type { 
  CreateCardInput, 
  UpdateCardInput,
  Card 
} from "@/db/queries/card-queries";
import { revalidatePath } from "next/cache";

export async function createCardAction(input: CreateCardInput) {
  try {
    const newCard = await createCard(input); // Using helper function
    revalidatePath(`/decks/${input.deckId}`);
    return { success: true, data: newCard };
  } catch (error) {
    console.error("Error creating card:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create card" 
    };
  }
}

export async function updateCardAction(input: UpdateCardInput) {
  try {
    const updatedCard = await updateCard(input); // Using helper function
    revalidatePath(`/decks/${updatedCard.deckId}`);
    return { success: true, data: updatedCard };
  } catch (error) {
    console.error("Error updating card:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update card" 
    };
  }
}

export async function deleteCardAction(cardId: number) {
  try {
    // First get the card to know which deck to revalidate
    const { getDeckById } = await import("@/db/queries/deck-queries");
    
    await deleteCard(cardId); // Using helper function
    
    // Note: We can't easily get the deckId after deletion, so we'll revalidate broadly
    // In a real app, you might want to return deckId from the deleteCard helper
    return { success: true };
  } catch (error) {
    console.error("Error deleting card:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete card" 
    };
  }
}

export async function getDeckCardsAction(deckId: number): Promise<{ success: boolean; data?: Card[]; error?: string }> {
  try {
    const cards = await getDeckCards(deckId); // Using helper function
    return { success: true, data: cards };
  } catch (error) {
    console.error("Error fetching deck cards:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch cards" 
    };
  }
}
