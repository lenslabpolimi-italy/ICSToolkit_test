"use client";

import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConceptType } from '@/types/lcd';

interface EvaluationNoteProps {
  id: string;
  x: number;
  y: number;
  text: string;
  strategyId: string;
  conceptType: ConceptType;
  onDragStop: (id: string, x: number, y: number) => void;
  onTextChange: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
}

const EvaluationNote: React.FC<EvaluationNoteProps> = ({
  id,
  x,
  y,
  text,
  conceptType,
  onDragStop,
  onTextChange,
  onDelete,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const noteColorClasses = conceptType === 'A'
    ? 'bg-red-200 text-red-800 border-red-300'
    : 'bg-blue-200 text-blue-800 border-blue-300';

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
          "w-48 min-h-[100px] max-h-[200px] flex flex-col group",
          noteColorClasses
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

        <textarea
          ref={textareaRef}
          className="flex-grow w-full bg-transparent resize-none outline-none text-sm font-roboto-condensed overflow-y-auto pr-6"
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

export default EvaluationNote;