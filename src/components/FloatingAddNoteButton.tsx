"use client";

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ConceptType } from '@/types/lcd';

interface FloatingAddNoteButtonProps {
  onClick: () => void;
  conceptType: ConceptType;
  disabled: boolean;
}

const FloatingAddNoteButton: React.FC<FloatingAddNoteButtonProps> = ({ onClick, conceptType, disabled }) => {
  const buttonColorClass = conceptType === 'A'
    ? 'bg-app-concept-a-base hover:bg-app-concept-a-dark'
    : 'bg-app-concept-b-base hover:bg-app-concept-b-dark';

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg flex items-center justify-center transition-colors",
        buttonColorClass,
        disabled && "opacity-50 cursor-not-allowed"
      )}
      aria-label="Add new evaluation note"
    >
      <Plus size={32} className="text-white" />
    </Button>
  );
};

export default FloatingAddNoteButton;