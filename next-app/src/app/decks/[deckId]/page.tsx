import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDeckWithCards } from "@/db/queries/deck-queries";
import { deleteDeckFormAction } from "@/lib/actions/deck-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AddCardDialog } from "@/components/AddCardDialog";
import { EditDeckDialog } from "@/components/EditDeckDialog";
import { FlashcardModal } from "@/components/FlashcardModal";
import { ArrowLeft, BookOpen, Plus, Trash2 } from "lucide-react";

interface DeckPageProps {
  params: {
    deckId: string;
  };
}


export default async function DeckPage({ params }: DeckPageProps) {
  try {
    const { deckId } = await params;
    const parsedDeckId = parseInt(deckId);
    
    // Validate that deckId is a valid number
    if (isNaN(parsedDeckId)) {
      notFound();
    }

    // Fetch deck with cards (authentication handled in helper function)
    const deckWithCards = await getDeckWithCards(parsedDeckId);

    // Transform the data to separate deck info and cards
    const deck = deckWithCards[0]?.decks;
    const cards = deckWithCards
      .filter(item => item.cards !== null)
      .map(item => item.cards!);

    if (!deck) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-background">
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
                    <AlertDialog>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete Deck</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the deck "{deck.title}" 
                            and all {cards.length} {cards.length === 1 ? 'card' : 'cards'} inside it.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <form action={deleteDeckFormAction} className="contents">
                          <input type="hidden" name="deckId" value={parsedDeckId} />
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <Button 
                              type="submit"
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Deck
                            </Button>
                          </AlertDialogFooter>
                        </form>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Badge variant="secondary" className="text-sm">
                      {cards.length} {cards.length === 1 ? 'card' : 'cards'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground mb-4">
              Created {new Date(deck.createdAt).toLocaleDateString()}
              {deck.updatedAt !== deck.createdAt && (
                <span> • Updated {new Date(deck.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
            
            {cards.length > 0 && (
              <Button asChild variant="default">
                <Link href={`/decks/${deckId}/study`}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Study
                </Link>
              </Button>
            )}
          </div>

          {/* Cards Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold">Cards</h2>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <AddCardDialog 
                        deckId={parsedDeckId} 
                        triggerButton={
                          <Button size="sm" className="w-8 h-8 p-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add Card</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {cards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      deckId={parsedDeckId} 
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
