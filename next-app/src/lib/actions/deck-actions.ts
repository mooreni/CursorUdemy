"use server";

import { createDeck, updateDeck, deleteDeck } from "@/db/queries/deck-queries";
import type { CreateDeckInput, UpdateDeckInput } from "@/db/queries/deck-queries";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createDeckAction(input: CreateDeckInput) {
  try {
    const newDeck = await createDeck(input); // Using helper function
    revalidatePath("/dashboard");
    return { success: true, data: newDeck };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create deck" 
    };
  }
}

export async function updateDeckAction(input: UpdateDeckInput) {
  try {
    const updatedDeck = await updateDeck(input); // Using helper function
    revalidatePath("/dashboard");
    revalidatePath(`/decks/${input.id}`);
    return { success: true, data: updatedDeck };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update deck" 
    };
  }
}

export async function deleteDeckAction(deckId: number) {
  console.log(`Delete deck action called for deck ${deckId}`);
  
  try {
    await deleteDeck(deckId); // Using helper function - cascades to delete cards automatically
    console.log(`Deck ${deckId} deleted successfully, revalidating paths`);
    
    // Revalidate dashboard and any other relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/decks");
    
  } catch (error) {
    // Log error for debugging but don't return it since forms expect void
    console.error("Failed to delete deck:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to delete deck");
  }
  
  console.log("Redirecting to dashboard after successful deletion");
  // Redirect after successful deletion
  redirect("/dashboard");
}

export async function deleteDeckFormAction(formData: FormData) {
  const deckId = formData.get("deckId") as string;
  console.log("Delete deck form action called with deckId:", deckId);
  
  if (!deckId) {
    console.error("No deck ID provided in form data");
    throw new Error("Deck ID is required");
  }
  
  try {
    await deleteDeckAction(parseInt(deckId, 10));
  } catch (error) {
    console.error("Error in deleteDeckFormAction:", error);
    throw error;
  }
}
