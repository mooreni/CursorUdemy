import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDashboardStats, getRecentDecks } from "@/lib/actions/dashboard-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, BookOpen, Calendar, BarChart3 } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch dashboard data
  const stats = await getDashboardStats();
  const recentDecks = await getRecentDecks();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your dashboard</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Decks</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDecks}</div>
              <p className="text-xs text-muted-foreground">Flashcard decks created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCards}</div>
              <p className="text-xs text-muted-foreground">Cards in all decks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.studySessions}</div>
              <p className="text-xs text-muted-foreground">Sessions this week</p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Deck
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Start building a new flashcard deck</p>
                <Button asChild variant="default">
                  <Link href="/decks/create">
                    Create Deck
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Browse Decks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">View and manage your existing decks</p>
                <Button asChild variant="secondary">
                  <Link href="/decks">
                    View Decks
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Recent Decks */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recent Decks</h2>
          <Card>
            <CardContent className="p-6">
              {recentDecks.length > 0 ? (
                <div className="space-y-4">
                  {recentDecks.map((deck) => (
                    <Card key={deck.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="flex justify-between items-start p-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{deck.title}</h3>
                            <Badge variant="secondary">
                              {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
                            </Badge>
                          </div>
                          {deck.description && (
                            <p className="text-muted-foreground text-sm mt-1 mb-2">{deck.description}</p>
                          )}
                          <p className="text-muted-foreground text-xs">
                            Created {new Date(deck.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/decks/${deck.id}/study`}>
                            Study
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
