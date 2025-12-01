"use client";

import React from 'react';
// Removed import for Button from '@/components/ui/button'
import { PlusCircle } from 'lucide-react';
import { ConceptType } from '@/types/lcd';
import { cn } from '@/lib/utils';

interface FloatingAddNoteButtonProps {
  onClick: () => void;
  conceptType: ConceptType;
  disabled?: boolean;
}

const FloatingAddNoteButton: React.FC<FloatingAddNoteButtonProps> = ({ onClick, conceptType, disabled }) => {
  const buttonColorClass = conceptType === 'A' ? 'bg-app-concept-a-base hover:bg-app-concept-a-dark' : 'bg-app-concept-b-base hover:bg-app-concept-b-dark';
  const iconColorClass = 'text-white'; // Icon color is white for both concepts

  return (
    <button // Changed from <Button> to <button>
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "fixed bottom-8 right-8 rounded-md p-2 shadow-lg z-50",
        "h-[60px] w-[60px] flex items-center justify-center",
        "transition-all duration-200 ease-in-out",
        "cursor-pointer", // Added cursor-pointer for consistency
        buttonColorClass,
        disabled && "opacity-50 cursor-not-allowed"
      )}
      aria-label="Add new evaluation note"
      title="Add new evaluation note" // Added title for consistency
    >
      <PlusCircle className={cn("h-8 w-8", iconColorClass)} /> {/* Applied iconColorClass */}
    </button>
  );
};

export default FloatingAddNoteButton;