"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditCardDialog } from "@/components/EditCardDialog";

// Helper function to truncate text
function truncateText(text: string, maxLength: number = 40): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

interface Card {
  id: number;
  front: string;
  back: string;
  deckId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface FlashcardModalProps {
  card: Card;
}

export function FlashcardModal({ card }: FlashcardModalProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleCardClick = () => {
    setIsDetailsOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditOpen(true);
  };

  return (
    <>
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <Card 
          className="hover:shadow-md transition-shadow h-40 group relative cursor-pointer" 
          onClick={handleCardClick}
        >
          <CardContent className="p-4 h-full flex flex-col">
            <div className="absolute top-2 right-2 z-10 flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-6 h-6 p-0"
                onClick={handleEditClick}
              >
                <Edit className="h-3 w-3" />
              </Button>
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
      
      {/* Edit Dialog */}
      <EditCardDialog 
        card={card}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  );
}
