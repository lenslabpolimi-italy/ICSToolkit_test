"use client";

import React from 'react';
import { PlusCircle } from 'lucide-react';
import { ConceptType } from '@/types/lcd';
import { cn } from '@/lib/utils';

interface FloatingAddNoteButtonProps {
  onClick: () => void;
  conceptType: ConceptType;
  disabled?: boolean;
}

const FloatingAddNoteButton: React.FC<FloatingAddNoteButtonProps> = ({ onClick, conceptType, disabled }) => {
  // Using standard Tailwind red-500/600 and blue-500/600 for consistent lightness
  const buttonColorClass = conceptType === 'A' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600';
  const iconColorClass = 'text-white'; // Icon color is white for both concepts

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "fixed bottom-8 right-8 rounded-md p-2 shadow-lg z-50",
        "h-[60px] w-[60px] flex items-center justify-center",
        "transition-all duration-200 ease-in-out",
        "cursor-pointer",
        buttonColorClass,
        disabled && "opacity-50 cursor-not-allowed"
      )}
      aria-label="Add new evaluation note"
      title="Add new evaluation note"
    >
      <PlusCircle className={cn("h-8 w-8", iconColorClass)} />
    </button>
  );
};

export default FloatingAddNoteButton;