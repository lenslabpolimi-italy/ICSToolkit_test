"use client";

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { EcoIdea } from '@/types/lcd';

interface StaticStickyNoteProps {
  idea: EcoIdea;
  className?: string;
  onTextChange: (id: string, newText: string) => void; // NEW: Added onTextChange prop
}

const StaticStickyNote: React.FC<StaticStickyNoteProps> = ({ idea, className, onTextChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [idea.text]);

  return (
    <div
      className={cn(
        "p-2 rounded-md shadow-md border",
        "w-48 min-h-[100px] flex flex-col",
        "bg-yellow-400 text-gray-900 border-yellow-500", // Styling to match confirmed sticky notes
        className
      )}
    >
      <textarea
        ref={textareaRef}
        className="flex-grow w-full bg-transparent resize-none outline-none text-sm font-roboto-condensed overflow-y-auto"
        value={idea.text}
        onChange={(e) => onTextChange(idea.id, e.target.value)} // NEW: Added onChange handler
        rows={3} // Initial rows
        style={{ minHeight: '70px' }} // Minimum height for the textarea
      />
    </div>
  );
};

export default StaticStickyNote;