"use client";

import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { XCircle, CheckCircle2 } from 'lucide-react'; // Import CheckCircle2 icon
import { cn } from '@/lib/utils';
import ConfirmationDialog from './ConfirmationDialog'; // NEW: Import ConfirmationDialog

interface StickyNoteProps {
  id: string;
  x: number;
  y: number;
  text: string;
  strategyId: string;
  subStrategyId?: string;
  guidelineId?: string;
  isConfirmed: boolean; // NEW: Add isConfirmed prop
  onDragStop: (id: string, x: number, y: number) => void;
  onTextChange: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
  onConfirmToggle: (id: string) => void; // NEW: Add onConfirmToggle prop
}

const StickyNote: React.FC<StickyNoteProps> = ({
  id,
  x,
  y,
  text,
  isConfirmed, // Destructure new prop
  onDragStop,
  onTextChange,
  onDelete,
  onConfirmToggle, // Destructure new prop
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // NEW: State for confirmation dialog

  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const noteColorClass = isConfirmed
    ? 'bg-yellow-400 text-gray-900 border-yellow-500' // Sharper, more saturated yellow
    : 'bg-yellow-200 text-gray-800 border-yellow-300'; // Light yellow

  const handleConfirmClick = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDialogConfirm = () => {
    onConfirmToggle(id); // Call the parent's toggle function
    setIsConfirmDialogOpen(false);
  };

  return (
    <Draggable
      handle=".handle"
      defaultPosition={{ x, y }}
      onStop={(e, data) => onDragStop(id, data.x, data.y)}
      // Removed bounds="parent" to allow free movement
    >
      <div
        className={cn(
          "absolute p-2 rounded-md shadow-md cursor-grab border",
          "w-48 min-h-[100px] max-h-[200px] flex flex-col group", // Added group for hover effects
          noteColorClass // Apply dynamic color class
        )}
        style={{ zIndex: 100 }} // Ensure notes are on top
      >
        <div className="handle absolute top-0 left-0 right-0 h-6 cursor-grab -mt-2 -mx-2 rounded-t-md" /> {/* Invisible handle for dragging */}
        
        <button
          onClick={() => onDelete(id)}
          className="absolute top-1 right-1 text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete note"
        >
          <XCircle size={18} />
        </button>

        {/* NEW: Confirmation button now opens dialog */}
        <button
          onClick={handleConfirmClick} // Open dialog on click
          className={cn(
            "absolute top-1 left-1 text-gray-500 hover:text-green-600 opacity-0 group-hover:opacity-100 transition-opacity",
            isConfirmed && "opacity-100 text-green-600 hover:text-green-700" // Always visible and green if confirmed
          )}
          aria-label={isConfirmed ? "Unconfirm idea" : "Confirm idea"}
          title={isConfirmed ? "Unconfirm idea" : "Confirm idea"}
        >
          <CheckCircle2 size={18} />
        </button>

        <textarea
          ref={textareaRef}
          className="flex-grow w-full bg-transparent resize-none outline-none text-sm font-roboto-condensed overflow-y-auto pr-6 pl-6" // Adjusted padding for new button
          value={text}
          onChange={(e) => onTextChange(id, e.target.value)}
          placeholder="Write your idea here..."
          rows={3} // Initial rows
          style={{ minHeight: '70px' }} // Minimum height for the textarea
        />

        {/* NEW: Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onConfirm={handleConfirmDialogConfirm}
          title={isConfirmed ? "Unconfirm this idea?" : "Confirm this idea?"}
          description={
            isConfirmed
              ? "Are you sure you want to unmark this idea as chosen?"
              : "Are you sure you want to mark this idea as chosen? Confirmed ideas will be sent to the Evaluation Radar."
          }
          confirmButtonText={isConfirmed ? "Unconfirm" : "Confirm"}
          confirmButtonVariant={isConfirmed ? "destructive" : "default"} // Red for unconfirm, default for confirm
        />
      </div>
    </Draggable>
  );
};

export default StickyNote;