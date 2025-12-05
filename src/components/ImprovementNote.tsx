"use client";

import React, { useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Strategy } from '@/types/lcd';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ImprovementNoteProps {
  id: string;
  x: number;
  y: number;
  text: string;
  strategyId: string;
  strategies: Strategy[]; // All strategies for the dropdown
  onDragStop: (id: string, x: number, y: number) => void;
  onTextChange: (id: string, newText: string) => void;
  onStrategyChange: (id: string, newStrategyId: string) => void;
  onDelete: (id: string) => void;
}

const ImprovementNote: React.FC<ImprovementNoteProps> = ({
  id,
  x,
  y,
  text,
  strategyId,
  strategies,
  onDragStop,
  onTextChange,
  onStrategyChange,
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

  const noteColorClasses = 'bg-green-200 text-green-800 border-green-300'; // Distinct green color for improvement notes

  return (
    <Draggable
      handle=".handle"
      defaultPosition={{ x, y }}
      onStop={(e, data) => onDragStop(id, data.x, data.y)}
    >
      <div
        className={cn(
          "absolute p-2 rounded-md shadow-md cursor-grab border",
          "w-48 min-h-[120px] max-h-[250px] flex flex-col group",
          noteColorClasses
        )}
        style={{ zIndex: 100 }} // Ensure notes are on top
      >
        <div className="handle absolute top-0 left-0 right-0 h-6 cursor-grab -mt-2 -mx-2 rounded-t-md" /> {/* Invisible handle for dragging */}
        
        <button
          onClick={() => onDelete(id)}
          className="absolute top-1 right-1 text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete improvement idea"
        >
          <XCircle size={18} />
        </button>

        <div className="mb-2">
          <Select value={strategyId} onValueChange={(value) => onStrategyChange(id, value)}>
            <SelectTrigger className="h-8 text-xs font-roboto-condensed bg-green-100 border-green-200">
              <SelectValue placeholder="Select Strategy" />
            </SelectTrigger>
            <SelectContent>
              {strategies.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.id}. {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <textarea
          ref={textareaRef}
          className="flex-grow w-full bg-transparent resize-none outline-none text-sm font-roboto-condensed overflow-y-auto pr-2"
          value={text}
          onChange={(e) => onTextChange(id, e.target.value)}
          placeholder="Write your improvement idea here..."
          rows={3} // Initial rows
          style={{ minHeight: '50px' }} // Minimum height for the textarea
        />
      </div>
    </Draggable>
  );
};

export default ImprovementNote;