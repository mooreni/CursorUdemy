"use server";

import { updateDeck } from "@/db/queries/deck-queries";
import type { UpdateDeckInput } from "@/db/queries/deck-queries";
import { revalidatePath } from "next/cache";

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
