import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDeckWithCards } from "@/db/queries/deck-queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddCardDialog } from "@/components/AddCardDialog";
import { EditDeckDialog } from "@/components/EditDeckDialog";
import { ArrowLeft, BookOpen, Plus, Eye } from "lucide-react";

interface DeckPageProps {
  params: {
    deckId: string;
  };
}

// Helper function to truncate text
function truncateText(text: string, maxLength: number = 40): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Component for individual cards with modal view
function FlashcardModal({ card }: { card: { id: number; front: string; back: string; deckId: number; createdAt: Date; updatedAt: Date; } }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="hover:shadow-md transition-shadow h-40 cursor-pointer group relative">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="absolute top-2 right-2 z-10">
              <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="h-1/2 flex flex-col justify-start mb-2">
              <h4 className="font-semibold text-xs text-muted-foreground mb-1">FRONT</h4>
              <p className="text-sm leading-tight flex-1">{truncateText(card.front)}</p>
            </div>
            <div className="h-1/2 flex flex-col justify-start">
              <h4 className="font-semibold text-xs text-muted-foreground mb-1">BACK</h4>
              <p className="text-sm leading-tight flex-1">{truncateText(card.back)}</p>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Flashcard Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">FRONT</h4>
            <div className="bg-muted/30 rounded-lg p-4 border">
              <p className="text-sm leading-relaxed">{card.front}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">BACK</h4>
            <div className="bg-muted/30 rounded-lg p-4 border">
              <p className="text-sm leading-relaxed">{card.back}</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Created {new Date(card.createdAt).toLocaleDateString()}
            {card.updatedAt !== card.createdAt && (
              <span> • Updated {new Date(card.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default async function DeckPage({ params }: DeckPageProps) {
  try {
    const deckId = parseInt(params.deckId);
    
    // Validate that deckId is a valid number
    if (isNaN(deckId)) {
      notFound();
    }

    // Fetch deck with cards (authentication handled in helper function)
    const deckWithCards = await getDeckWithCards(deckId);

    // Transform the data to separate deck info and cards
    const deck = deckWithCards[0]?.decks;
    const cards = deckWithCards
      .filter(item => item.cards !== null)
      .map(item => item.cards!);

    if (!deck) {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Deck Info */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{deck.title}</h1>
                    {deck.description && (
                      <p className="text-muted-foreground">{deck.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <EditDeckDialog deck={deck} />
                    <Badge variant="secondary" className="text-sm">
                      {cards.length} {cards.length === 1 ? 'card' : 'cards'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Created {new Date(deck.createdAt).toLocaleDateString()}
              {deck.updatedAt !== deck.createdAt && (
                <span> • Updated {new Date(deck.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          {/* Study Actions */}
          {cards.length > 0 && (
            <>
              <Separator className="mb-8" />
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Study Options</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Study Mode
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow">
                      <CardDescription className="mb-4 flex-grow">
                        Review all cards in this deck with flashcard-style studying
                      </CardDescription>
                      <Button asChild variant="default" className="w-full mt-auto">
                        <Link href={`/decks/${deckId}/study`}>
                          Start Studying
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Manage Cards
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow">
                      <CardDescription className="mb-4 flex-grow">
                        Add, edit, or remove cards from this deck
                      </CardDescription>
                      <Button asChild variant="secondary" className="w-full mt-auto">
                        <Link href={`/decks/${deckId}/manage`}>
                          Manage Cards
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <Separator className="mb-8" />
            </>
          )}

          {/* Cards Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Cards</h2>
              <AddCardDialog deckId={deckId} />
            </div>

            {cards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card) => (
                  <FlashcardModal key={card.id} card={card} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      This deck doesn't have any cards yet. Add your first card to get started!
                    </p>
                    <AddCardDialog 
                      deckId={deckId} 
                      triggerButton={
                        <Button variant="default">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Card
                        </Button>
                      } 
                    />
                  </div>
                </CardContent>
              </Card>
            )}
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
