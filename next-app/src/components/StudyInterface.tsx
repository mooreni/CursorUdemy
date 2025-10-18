"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Shuffle, 
  CheckCircle,
  Eye,
  EyeOff 
} from "lucide-react";

interface Card {
  id: number;
  front: string;
  back: string;
  deckId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface StudyInterfaceProps {
  cards: Card[];
  deckId: number;
}

export function StudyInterface({ cards, deckId }: StudyInterfaceProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyCards, setStudyCards] = useState(cards);
  const [completedCards, setCompletedCards] = useState(new Set<number>());
  const [isStudyComplete, setIsStudyComplete] = useState(false);

  // Shuffle cards function
  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCompletedCards(new Set());
    setIsStudyComplete(false);
  };

  // Reset study session
  const resetStudy = () => {
    setStudyCards(cards);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCompletedCards(new Set());
    setIsStudyComplete(false);
  };

  // Navigate to next card
  const nextCard = () => {
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  // Navigate to previous card
  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  // Mark current card as known/completed
  const markAsKnown = () => {
    const currentCard = studyCards[currentCardIndex];
    const newCompleted = new Set(completedCards);
    newCompleted.add(currentCard.id);
    setCompletedCards(newCompleted);
    
    // Check if all cards are completed
    if (newCompleted.size === studyCards.length) {
      setIsStudyComplete(true);
    } else {
      // Auto-advance to next card
      nextCard();
    }
  };

  // Flip card
  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case ' ':
        case 'Enter':
          event.preventDefault();
          flipCard();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          previousCard();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextCard();
          break;
        case 'k':
        case 'K':
          if (isFlipped) {
            event.preventDefault();
            markAsKnown();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, currentCardIndex, studyCards.length]);

  const currentCard = studyCards[currentCardIndex];
  const isCurrentCardCompleted = completedCards.has(currentCard.id);
  const progress = Math.round((completedCards.size / studyCards.length) * 100);

  if (isStudyComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardContent className="p-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Study Session Complete!</h2>
            <p className="text-muted-foreground mb-6">
              You've reviewed all {studyCards.length} cards in this deck.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={resetStudy} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Study Again
              </Button>
              <Button onClick={shuffleCards} variant="default">
                <Shuffle className="h-4 w-4 mr-2" />
                Shuffle & Study
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress and Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Card {currentCardIndex + 1} of {studyCards.length}
            </Badge>
            <Badge variant={isCurrentCardCompleted ? "default" : "secondary"}>
              {isCurrentCardCompleted ? "Completed" : "In Progress"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={shuffleCards} variant="outline" size="sm">
              <Shuffle className="h-4 w-4 mr-2" />
              Shuffle
            </Button>
            <Button onClick={resetStudy} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          {progress}% complete ({completedCards.size}/{studyCards.length} cards)
        </p>
      </div>

      {/* Flashcard */}
      <Card className="mb-6 min-h-[400px] cursor-pointer hover:shadow-lg transition-shadow" onClick={flipCard}>
        <CardContent className="p-8 h-full flex flex-col justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Badge variant="outline" className="text-xs">
                {isFlipped ? 'BACK' : 'FRONT'}
              </Badge>
              {isFlipped ? (
                <EyeOff className="h-4 w-4 ml-2 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 ml-2 text-muted-foreground" />
              )}
            </div>
            
            <div className="min-h-[200px] flex items-center justify-center">
              <p className="text-xl leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>
            
            {!isFlipped && (
              <p className="text-sm text-muted-foreground mt-4">
                Click or press Space to reveal answer
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-4">
        <Button 
          onClick={previousCard} 
          disabled={currentCardIndex === 0}
          variant="outline"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {isFlipped && !isCurrentCardCompleted && (
          <Button onClick={markAsKnown} variant="default">
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Known
          </Button>
        )}

        <Button 
          onClick={nextCard} 
          disabled={currentCardIndex === studyCards.length - 1}
          variant="outline"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="text-center">
        <Separator className="mb-4" />
        <div className="text-xs text-muted-foreground">
          <p className="mb-2">Keyboard shortcuts:</p>
          <div className="flex justify-center gap-6 flex-wrap">
            <span><kbd className="bg-muted px-2 py-1 rounded">Space</kbd> Flip card</span>
            <span><kbd className="bg-muted px-2 py-1 rounded">←</kbd> Previous</span>
            <span><kbd className="bg-muted px-2 py-1 rounded">→</kbd> Next</span>
            <span><kbd className="bg-muted px-2 py-1 rounded">K</kbd> Mark as known</span>
          </div>
        </div>
      </div>
    </div>
  );
}
