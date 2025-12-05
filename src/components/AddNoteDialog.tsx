"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { ConceptType } from '@/types/lcd';
import { cn } from '@/lib/utils';

interface AddNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  conceptType: ConceptType;
  strategyId: string;
}

const AddNoteDialog: React.FC<AddNoteDialogProps> = ({ isOpen, onClose, onSave, conceptType, strategyId }) => {
  const [noteText, setNoteText] = useState('');

  const handleSave = () => {
    if (noteText.trim()) {
      onSave(noteText);
      setNoteText(''); // Clear text after saving
    }
    onClose();
  };

  const headerColorClass = conceptType === 'A' ? 'text-app-concept-a-base' : 'text-app-concept-b-base';
  // Updated button colors to use standard Tailwind red-500/600 and blue-500/600
  const buttonColorClass = conceptType === 'A' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className={cn("font-palanquin", headerColorClass)}>Add Your Idea/Note</DialogTitle>
          <DialogDescription className="font-roboto">
            Type your idea/note below<br />It will appear to eco idea board after you save.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            id="note"
            placeholder="Write your note here..."
            className="col-span-3 font-roboto-condensed min-h-[100px]"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={!noteText.trim()}
            className={cn("font-roboto-condensed", buttonColorClass)}
          >
            <Check className="mr-2 h-4 w-4" /> Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoteDialog;