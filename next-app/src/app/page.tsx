export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-189px)] px-4 text-center">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Main Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              FlashCards
            </span>
          </h1>
          <div className="space-y-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            <p>Master any subject with our interactive flashcard learning system.</p>
            <p>Create, study, and track your progress all in one place.</p>
          </div>
        </div>

        {/* Call to Action Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-white">Get Started Today</h2>
          <div className="space-y-4">
            <p className="text-slate-300">
              Sign up or sign in to start creating your personalized flashcard decks.
            </p>
            <div className="flex items-center justify-center gap-1 text-sm text-slate-400">
              <span>Click the buttons in the header above to get started</span>
              <span>👆</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}