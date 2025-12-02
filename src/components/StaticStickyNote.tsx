"use client";

import React, { useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { XCircle } from 'lucide-react'; // NEW: Import XCircle icon
import { cn } from '@/lib/utils';
import { EcoIdea } from '@/types/lcd';

interface StaticStickyNoteProps {
  idea: EcoIdea;
  className?: string;
  onTextChange: (id: string, newText: string) => void;
  onDragStop: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void; // NEW: Add onDelete prop
}

const StaticStickyNote: React.FC<StaticStickyNoteProps> = ({ idea, className, onTextChange, onDragStop, onDelete }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [idea.text]);

  return (
    <Draggable
      handle=".handle"
      defaultPosition={{ x: idea.x, y: idea.y }}
      onStop={(e, data) => onDragStop(idea.id, data.x, data.y)}
      // Removed bounds="parent" to allow free movement
    >
      <div
        className={cn(
          "absolute p-2 rounded-md shadow-md cursor-grab border",
          "w-48 min-h-[100px] flex flex-col group",
          "bg-yellow-400 text-gray-900 border-yellow-500",
          className
        )}
        style={{ zIndex: 100 }}
      >
        <div className="handle absolute top-0 left-0 right-0 h-6 cursor-grab -mt-2 -mx-2 rounded-t-md" />
        
        {/* NEW: Delete button */}
        <button
          onClick={() => onDelete(idea.id)}
          className="absolute top-1 right-1 text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete note"
        >
          <XCircle size={18} />
        </button>

        <textarea
          ref={textareaRef}
          className="flex-grow w-full bg-transparent resize-none outline-none text-sm font-roboto-condensed overflow-y-auto pr-6" // Adjusted padding for new button
          value={idea.text}
          onChange={(e) => onTextChange(idea.id, e.target.value)}
          rows={3}
          style={{ minHeight: '70px' }}
        />
      </div>
    </Draggable>
  );
};

export default StaticStickyNote;