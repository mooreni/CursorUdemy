import {
  SignInButton,
  SignUpButton,
  SignedOut,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  // Authentication and redirects are now handled by middleware
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-189px)] px-4 bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <CardTitle className="text-4xl md:text-6xl font-bold">
            FlashCards
          </CardTitle>
          <CardDescription className="text-xl md:text-2xl">
            Your personal flashcard platform
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <SignedOut>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <SignInButton mode="modal">
                <Button variant="default" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
        </CardContent>
      </Card>
    </div>
  );
}