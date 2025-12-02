"use client";

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RadarStickyNoteProps {
  id: string;
  text: string;
  onTextChange: (id: string, newText: string) => void;
}

const RadarStickyNote: React.FC<RadarStickyNoteProps> = ({
  id,
  text,
  onTextChange,
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
    <div
      className={cn(
        "p-2 rounded-md shadow-sm border",
        "w-full min-h-[70px] flex flex-col",
        noteColorClass
      )}
    >
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
  );
};

export default RadarStickyNote;