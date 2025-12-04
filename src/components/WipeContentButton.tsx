"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useLcd } from '@/context/LcdContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WipeContentButtonProps {
  sectionKey: string;
  label?: string;
  className?: string; // Add className prop
}

const WipeContentButton: React.FC<WipeContentButtonProps> = ({ sectionKey, label = 'Wipe Content', className }) => {
  const { resetSection } = useLcd();

  const handleWipe = () => {
    resetSection(sectionKey);
    toast.success(`Content for ${label} has been wiped!`);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleWipe}
      className={cn(
        "absolute bottom-4 right-6 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700", // Changed right-4 to right-6
        className // Merge custom classes
      )}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
};

export default WipeContentButton;