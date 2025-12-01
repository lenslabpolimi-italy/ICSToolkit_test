"use client";

import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConceptType } from '@/types/lcd';

interface RadarEcoIdeaNoteProps {
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

const RadarEcoIdeaNote: React.FC<RadarEcoIdeaNoteProps> = ({
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  // Changed to use yellow colors consistently for radar notes
  const noteColorClasses = 'bg-yellow-300 text-gray-800 border-yellow-400';

  return (
    <Draggable
      handle=".handle"
      defaultPosition={{ x, y }}
      onStop={(e, data) => onDragStop(id, data.x, data.y)}
    >
      <div
        className={cn(
          "absolute p-2 rounded-md shadow-md cursor-grab border",
          "w-48 min-h-[100px] max-h-[200px] flex flex-col group",
          noteColorClasses
        )}
        style={{ zIndex: 100 }}
      >
        <div className="handle absolute top-0 left-0 right-0 h-6 cursor-grab -mt-2 -mx-2 rounded-t-md" />
        
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
          rows={3}
          style={{ minHeight: '70px' }}
        />
      </div>
    </Draggable>
  );
};

export default RadarEcoIdeaNote;