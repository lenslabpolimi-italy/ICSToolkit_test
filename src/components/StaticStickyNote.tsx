"use client";

import React, { useRef, useEffect } from 'react';
import Draggable from 'react-draggable'; // NEW: Import Draggable
import { cn } from '@/lib/utils';
import { EcoIdea } from '@/types/lcd';

interface StaticStickyNoteProps {
  idea: EcoIdea;
  className?: string;
  onTextChange: (id: string, newText: string) => void;
  onDragStop: (id: string, x: number, y: number) => void; // NEW: Add onDragStop prop
}

const StaticStickyNote: React.FC<StaticStickyNoteProps> = ({ idea, className, onTextChange, onDragStop }) => {
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
      handle=".handle" // NEW: Specify a handle for dragging
      defaultPosition={{ x: idea.x, y: idea.y }} // NEW: Use idea's position
      onStop={(e, data) => onDragStop(idea.id, data.x, data.y)} // NEW: Handle drag stop
      // Removed bounds="parent" to allow free movement
    >
      <div
        className={cn(
          "absolute p-2 rounded-md shadow-md cursor-grab border", // Added absolute and cursor-grab
          "w-48 min-h-[100px] flex flex-col group", // Added group for hover effects
          "bg-yellow-400 text-gray-900 border-yellow-500", // Styling to match confirmed sticky notes
          className
        )}
        style={{ zIndex: 100 }} // Ensure notes are on top
      >
        <div className="handle absolute top-0 left-0 right-0 h-6 cursor-grab -mt-2 -mx-2 rounded-t-md" /> {/* NEW: Invisible handle for dragging */}
        
        <textarea
          ref={textareaRef}
          className="flex-grow w-full bg-transparent resize-none outline-none text-sm font-roboto-condensed overflow-y-auto"
          value={idea.text}
          onChange={(e) => onTextChange(idea.id, e.target.value)}
          rows={3} // Initial rows
          style={{ minHeight: '70px' }} // Minimum height for the textarea
        />
      </div>
    </Draggable>
  );
};

export default StaticStickyNote;