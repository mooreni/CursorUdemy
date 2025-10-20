import { redirect } from "next/navigation";
import Link from "next/link";
import { getRecentDecks } from "@/lib/actions/dashboard-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AddDeckDialog } from "@/components/AddDeckDialog";
import { Plus, BookOpen } from "lucide-react";
import { truncateText } from "@/lib/utils";

export default async function DashboardPage() {
  try {
    // Fetch dashboard data (authentication handled in helper functions)
    const recentDecks = await getRecentDecks();

    return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your dashboard</p>
        </header>

        {/* Decks */}
        <div className="mt-8">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">Decks</h2>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <AddDeckDialog 
                      triggerButton={
                        <Button size="sm" className="w-8 h-8 p-0">
                          <Plus className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Deck</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {recentDecks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentDecks.map((deck) => (
                <Card key={deck.id} className="hover:shadow-md transition-shadow h-[200px] flex flex-col">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 flex-shrink-0 h-[60px]">
                    <CardTitle className="text-sm font-medium line-clamp-2 flex-1 mr-2">
                      {deck.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
                    </Badge>
                  </CardHeader>
                  
                  <CardContent className="pb-2 flex-1 flex flex-col justify-between min-h-0">
                     <CardDescription className="text-xs text-muted-foreground mt-2">
                        {truncateText(deck.description || 'No description available', 73)}
                      </CardDescription>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col items-start gap-2 flex-shrink-0 pt-2">
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(deck.createdAt).toLocaleDateString()}
                    </div>
                     <Button asChild size="sm" className="w-full">
                       <Link href={`/decks/${deck.id}`}>
                         Study
                       </Link>
                     </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No decks found. Create your first deck to get started!</p>
                  <Button asChild variant="default">
                    <Link href="/decks/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Deck
                    </Link>
                  </Button>
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
    throw error; // Re-throw other errors
  }
}
