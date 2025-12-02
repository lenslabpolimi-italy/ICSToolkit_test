"use client";

import React, { useState, useRef, useEffect } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';

interface DraggableStickyNoteProps {
  id: string;
  initialX: number;
  initialY: number;
  text: string;
  onDragStop: (id: string, x: number, y: number) => void;
  onTextChange: (id: string, text: string) => void;
}

const DraggableStickyNote: React.FC<DraggableStickyNoteProps> = ({
  id,
  initialX,
  initialY,
  text,
  onDragStop,
  onTextChange,
}) => {
  const [currentText, setCurrentText] = useState(text);
  const nodeRef = useRef(null);

  // Update internal text state if prop changes (e.g., from context reset)
  useEffect(() => {
    setCurrentText(text);
  }, [text]);

  const handleDragStop: DraggableEventHandler = (e, data) => {
    onDragStop(id, data.x, data.y);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentText(e.target.value);
    onTextChange(id, e.target.value);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      defaultPosition={{ x: initialX, y: initialY }}
      onStop={handleDragStop}
      // Removed bounds="parent" to allow free movement
    >
      <div
        ref={nodeRef}
        className="absolute w-48 h-36 p-2 rounded-md shadow-md border bg-yellow-400 text-gray-900 border-yellow-500 text-sm font-roboto-condensed flex flex-col"
        style={{ cursor: 'grab', zIndex: 100 }} // Ensure notes are on top and indicate draggable
      >
        <textarea
          className="flex-grow resize-none bg-transparent outline-none placeholder-gray-600 text-gray-900"
          value={currentText}
          onChange={handleTextChange}
          placeholder="Write your idea here..."
        />
      </div>
    </Draggable>
  );
};

export default DraggableStickyNote;