import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getRecentDecks, getDashboardStats } from "@/lib/actions/dashboard-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AddDeckDialog } from "@/components/AddDeckDialog";
import { Plus, BookOpen, Crown } from "lucide-react";
import { truncateText } from "@/lib/utils";

export default async function DashboardPage() {
  try {
    // Check billing status and get dashboard data
    const { has } = await auth();
    const hasProPlan = has({ plan: 'pro' });
    const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });
    
    // Fetch dashboard data (authentication handled in helper functions)
    const [recentDecks, dashboardStats] = await Promise.all([
      getRecentDecks(),
      getDashboardStats()
    ]);
    
    // Check if user can add more decks
    const canAddMoreDecks = hasUnlimitedDecks || dashboardStats.totalDecks < 3;

    return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                {hasProPlan ? "Welcome to your Pro dashboard! Enjoy unlimited features." : "Welcome to your dashboard"}
              </p>
            </div>
            {hasProPlan && (
              <Badge variant="default" className="bg-primary text-primary-foreground font-medium">
                <Crown className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            )}
          </div>
        </header>

        {/* Decks */}
        <div className="mt-8">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">Decks</h2>
            {canAddMoreDecks ? (
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
            ) : (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" className="w-8 h-8 p-0" disabled>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upgrade to Pro for unlimited decks</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {!hasUnlimitedDecks && (
              <Badge variant="secondary" className="text-xs">
                {dashboardStats.totalDecks}/3 decks
              </Badge>
            )}
          </div>
          
          {/* Show upgrade prompt when limit is reached */}
          {!canAddMoreDecks && (
            <Card className="mb-6 border-muted-foreground/20 bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">
                        Deck Limit Reached
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Free users are limited to 3 decks. Upgrade to Pro for unlimited decks.
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="default">
                    <Link href="/pricing">
                      Upgrade to Pro
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
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
                  {canAddMoreDecks ? (
                    <AddDeckDialog 
                      triggerButton={
                        <Button variant="default">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Deck
                        </Button>
                      }
                    />
                  ) : (
                    <div className="space-y-4">
                      <Button disabled variant="default">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Deck
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Free users are limited to 3 decks. 
                        <Link href="/pricing" className="text-primary hover:underline ml-1">
                          Upgrade to Pro
                        </Link> for unlimited decks.
                      </p>
                    </div>
                  )}
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
    throw error; // Re-throw other errors
  }
}
