"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react'; // Changed from Plus to PlusCircle
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
        "fixed bottom-8 right-8 rounded-lg p-2 shadow-lg z-50", // Changed rounded-full to rounded-lg, adjusted padding
        "h-14 w-14 flex items-center justify-center", // Kept size
        "transition-all duration-200 ease-in-out",
        buttonColorClass,
        disabled && "opacity-50 cursor-not-allowed"
      )}
      aria-label="Add new evaluation note"
    >
      <PlusCircle className="h-8 w-8 text-white" /> {/* Changed icon to PlusCircle and adjusted size/color */}
    </Button>
  );
};

export default FloatingAddNoteButton;