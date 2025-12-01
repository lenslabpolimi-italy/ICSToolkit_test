"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
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

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "fixed bottom-8 right-8 rounded-md p-2 shadow-lg z-50", // Changed rounded-lg to rounded-md
        "h-[60px] w-[60px] flex items-center justify-center", // Changed h-14 w-14 to h-[60px] w-[60px]
        "transition-all duration-200 ease-in-out",
        buttonColorClass,
        disabled && "opacity-50 cursor-not-allowed"
      )}
      aria-label="Add new evaluation note"
    >
      <PlusCircle className="h-8 w-8 text-white" />
    </Button>
  );
};

export default FloatingAddNoteButton;