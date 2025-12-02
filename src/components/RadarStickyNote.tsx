"use client";

import React, { useRef, useEffect } from 'react';
import Draggable from 'react-draggable'; // NEW: Import Draggable
import { cn } from '@/lib/utils';

interface RadarStickyNoteProps {
  id: string;
  text: string;
  x: number; // NEW: Add x position
  y: number; // NEW: Add y position
  onTextChange: (id: string, newText: string) => void;
  onDragStop: (id: string, x: number, y: number) => void; // NEW: Add onDragStop handler
}

const RadarStickyNote: React.FC<RadarStickyNoteProps> = ({
  id,
  text,
  x, // NEW: Destructure x
  y, // NEW: Destructure y
  onTextChange,
  onDragStop, // NEW: Destructure onDragStop
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  // Styling for the confirmed yellow sticky note
  const noteColorClass = 'bg-yellow-400 text-gray-900 border-yellow-500';

  return (
    <Draggable // NEW: Wrap with Draggable
      handle=".handle"
      defaultPosition={{ x, y }}
      onStop={(e, data) => onDragStop(id, data.x, data.y)}
    >
      <div
        className={cn(
          "absolute p-2 rounded-md shadow-sm border cursor-grab", // NEW: Added absolute and cursor-grab
          "w-full min-h-[70px] flex flex-col group", // Added group for hover effects
          noteColorClass
        )}
        style={{ zIndex: 100 }} // Ensure notes are on top
      >
        <div className="handle absolute top-0 left-0 right-0 h-6 cursor-grab -mt-2 -mx-2 rounded-t-md" /> {/* Invisible handle for dragging */}
        <textarea
          ref={textareaRef}
          className="flex-grow w-full bg-transparent resize-none outline-none text-sm font-roboto-condensed overflow-y-auto"
          value={text}
          onChange={(e) => onTextChange(id, e.target.value)}
          placeholder="Write your idea here..."
          rows={3} // Initial rows
          style={{ minHeight: '70px' }} // Minimum height for the textarea
        />
      </div>
    </Draggable>
  );
};

export default RadarStickyNote;