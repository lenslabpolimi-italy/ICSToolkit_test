"use client";

import React, { useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { cn } from '@/lib/utils';

interface RadarStickyNoteProps {
  id: string;
  text: string;
  x: number;
  y: number;
  onTextChange: (id: string, newText: string) => void;
  onDragStop: (id: string, x: number, y: number) => void;
}

const RadarStickyNote: React.FC<RadarStickyNoteProps> = ({
  id,
  text,
  x,
  y,
  onTextChange,
  onDragStop,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Removed useEffect for dynamic height adjustment as the note now has a fixed height.

  // Styling for the confirmed yellow sticky note
  const noteColorClass = 'bg-yellow-400 text-gray-900 border-yellow-500';

  return (
    <Draggable
      handle=".handle"
      defaultPosition={{ x, y }}
      onStop={(e, data) => onDragStop(id, data.x, data.y)}
    >
      <div
        className={cn(
          "p-2 rounded-md shadow-sm border cursor-grab",
          "w-48 h-36 flex flex-col group", // Set fixed width w-48 (192px) and height h-36 (144px)
          noteColorClass
        )}
        style={{ zIndex: 100 }} // Ensure notes are on top
      >
        <div className="handle absolute top-0 left-0 right-0 h-6 cursor-grab -mt-2 -mx-2 rounded-t-md" /> {/* Invisible handle for dragging */}
        <textarea
          ref={textareaRef}
          className="flex-grow w-full h-full bg-transparent resize-none outline-none text-sm font-roboto-condensed overflow-y-auto" // Textarea fills parent height
          value={text}
          onChange={(e) => onTextChange(id, e.target.value)}
          placeholder="Write your idea here..."
          // Removed rows and minHeight style as h-full handles it
        />
      </div>
    </Draggable>
  );
};

export default RadarStickyNote;