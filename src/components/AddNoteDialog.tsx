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
  const buttonColorClass = conceptType === 'A' ? 'bg-app-concept-a-base hover:bg-app-concept-a-dark' : 'bg-app-concept-b-base hover:bg-app-concept-b-dark';

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