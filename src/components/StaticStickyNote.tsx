"use client";

import React, { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EcoIdea } from '@/types/lcd';

interface StaticStickyNoteProps {
  idea: EcoIdea & { x: number; y: number }; // EcoIdea with position
  onTextChange: (id: string, newText: string) => void;
  onDragStop: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
}

const StaticStickyNote: React.FC<StaticStickyNoteProps> = ({
  idea,
  onTextChange,
  onDragStop,
  onDelete,
}) => {
  const nodeRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(idea.text);

  useEffect(() => {
    setCurrentText(idea.text); // Update internal state if idea.text changes from outside
  }, [idea.text]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentText(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (currentText !== idea.text) {
      onTextChange(idea.id, currentText);
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".handle"
      defaultPosition={{ x: idea.x - 10, y: idea.y - 5 }} {/* Adjusted position here */}
      onStop={(e, data) => onDragStop(idea.id, data.x, data.y)}
    >
      <div
        ref={nodeRef}
        className={cn(
          "absolute p-2 rounded-md shadow-md cursor-grab border",
          "w-48 min-h-[100px] flex flex-col group",
          isEditing ? "border-blue-500" : "border-gray-200",
          idea.color === 'yellow' ? 'bg-yellow-100' : 'bg-blue-100' // Default to yellow if not specified
        )}
      >
        <div className="flex justify-between items-center mb-1 handle cursor-grab">
          <span className="text-xs font-semibold text-gray-600">
            Strategy {idea.strategyId}
          </span>
          <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
        {isEditing ? (
          <Textarea
            value={currentText}
            onChange={handleTextareaChange}
            onBlur={handleBlur}
            autoFocus
            className="flex-grow resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm bg-transparent"
          />
        ) : (
          <div
            className="flex-grow text-sm text-gray-800 cursor-text overflow-hidden whitespace-pre-wrap"
            onClick={() => setIsEditing(true)}
          >
            {currentText || "Click to add note..."}
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onDelete(idea.id)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </Draggable>
  );
};

export default StaticStickyNote;