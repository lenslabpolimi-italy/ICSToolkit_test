"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { EcoIdea } from '@/types/lcd'; // Assuming EcoIdea type is available

interface ConfirmedIdeasBoxProps {
  ideas: EcoIdea[];
  className?: string;
  style?: React.CSSProperties;
}

const ConfirmedIdeasBox: React.FC<ConfirmedIdeasBoxProps> = ({ ideas, className, style }) => {
  if (ideas.length === 0) {
    return null; // Don't render if there are no confirmed ideas
  }

  return (
    <div className={cn(
      "bg-green-50 border border-green-200 p-2 rounded-lg shadow-sm",
      "w-48 max-h-[150px] overflow-y-auto", // Fixed width, max height with scroll
      className
    )} style={style}>
      <h5 className="text-xs font-palanquin font-semibold text-green-800 mb-1">Confirmed Ideas:</h5>
      <ul className="list-disc list-inside text-xs text-green-700 font-roboto-condensed space-y-0.5">
        {ideas.map((idea) => (
          <li key={idea.id}>{idea.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default ConfirmedIdeasBox;