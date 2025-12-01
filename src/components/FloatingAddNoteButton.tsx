"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ConceptType } from '@/types/lcd';
import { cn } from '@/lib/utils';

interface FloatingAddNoteButtonProps {
  onClick: () => void;
  conceptType: ConceptType; // Keeping conceptType for potential future use, though color is now fixed
  disabled?: boolean;
}

const FloatingAddNoteButton: React.FC<FloatingAddNoteButtonProps> = ({ onClick, conceptType, disabled }) => {
  // Using a fixed red color from app-concept-a-light for the button background
  // and app-concept-a-base for the hover state, as per the image.
  const buttonBaseColorClass = 'bg-app-concept-a-light';
  const buttonHoverColorClass = 'hover:bg-app-concept-a-base';

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "fixed bottom-8 right-8 rounded-lg p-4 shadow-lg z-50", // Changed to rounded-lg for square with rounded corners
        "h-14 w-14 flex items-center justify-center",
        "transition-all duration-200 ease-in-out",
        buttonBaseColorClass,
        buttonHoverColorClass,
        disabled && "opacity-50 cursor-not-allowed"
      )}
      aria-label="Add new evaluation note"
    >
      <Plus className="h-6 w-6 text-white" />
    </Button>
  );
};

export default FloatingAddNoteButton;