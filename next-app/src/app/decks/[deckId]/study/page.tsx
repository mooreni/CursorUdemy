import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDeckById } from "@/db/queries/deck-queries";
import { getDeckCards } from "@/db/queries/card-queries";
import { StudyInterface } from "@/components/StudyInterface";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";

interface StudyPageProps {
  params: {
    deckId: string;
  };
}

export default async function StudyPage({ params }: StudyPageProps) {
  try {
    const { deckId } = await params;
    const parsedDeckId = parseInt(deckId);
    
    // Validate that deckId is a valid number
    if (isNaN(parsedDeckId)) {
      notFound();
    }

    // Fetch deck and cards (authentication handled in helper functions)
    const [deck, cards] = await Promise.all([
      getDeckById(parsedDeckId),
      getDeckCards(parsedDeckId)
    ]);

    if (!deck) {
      notFound();
    }

    // If no cards, redirect back to deck page
    if (cards.length === 0) {
      redirect(`/decks/${deckId}`);
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/decks/${deckId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Deck
              </Link>
            </Button>
            <div className="text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4 inline mr-1" />
              {cards.length} {cards.length === 1 ? 'card' : 'cards'}
            </div>
          </div>

          {/* Deck Info */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Studying: {deck.title}</h1>
            {deck.description && (
              <p className="text-muted-foreground">{deck.description}</p>
            )}
          </div>

          {/* Study Interface */}
          <StudyInterface cards={cards} deckId={parsedDeckId} />
        </div>
        </div>
      </div>
    );
  } catch (error) {
    // Handle authentication errors by redirecting to home
    if (error instanceof Error && error.message === "Unauthorized") {
      redirect("/");
    }
    
    // Handle deck not found or access denied
    if (error instanceof Error && error.message === "Deck not found or access denied") {
      notFound();
    }
    
    // Re-throw other errors
    throw error;
  }
}
