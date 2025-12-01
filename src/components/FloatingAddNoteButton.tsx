"use client";

import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ConceptType } from '@/types/lcd';

interface FloatingAddNoteButtonProps {
  onClick: () => void;
  conceptType: ConceptType;
}

const FloatingAddNoteButton: React.FC<FloatingAddNoteButtonProps> = ({ onClick, conceptType }) => {
  const buttonColorClass = conceptType === 'A'
    ? 'bg-app-concept-a-light hover:bg-app-concept-a-dark'
    : 'bg-app-concept-b-light hover:bg-app-concept-b-dark';

  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-24 right-8 p-4 rounded-full shadow-lg transition-colors z-50",
        "w-16 h-16 flex items-center justify-center",
        buttonColorClass
      )}
      aria-label="Add new evaluation note"
    >
      <PlusCircle size={32} className="text-white" />
    </Button>
  );
};

export default FloatingAddNoteButton;