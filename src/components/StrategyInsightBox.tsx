"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Strategy, PriorityLevel } from '@/types/lcd';
import { getPriorityTagClasses } from '@/utils/lcdUtils';

interface StrategyInsightBoxProps {
  strategy: Strategy;
  priority?: PriorityLevel; // Made optional
  className?: string; // For positioning
  style?: React.CSSProperties; // For inline styles like top, left, transform
}

const StrategyInsightBox: React.FC<StrategyInsightBoxProps> = ({
  strategy,
  priority,
  className,
  style
}) => {
  const { displayText, classes } = priority ? getPriorityTagClasses(priority) : { displayText: '', classes: '' };

  return (
    <div className={cn(
      "bg-white p-2 rounded-lg flex flex-col justify-center items-start",
      "w-48 h-20",
      className
    )} style={style}>
      <div className="flex items-center">
        <h4 className="text-sm font-palanquin font-semibold text-app-header flex items-center"> {/* Added flex and items-center */}
          {strategy.id}. {strategy.name}
          {priority && ( // Conditionally render priority tag
            <span className={cn(
              "text-xs font-roboto-condensed px-1 rounded-sm ml-2", // Changed mr-2 to ml-2 for spacing after name
              classes
            )}>
              {displayText}
            </span>
          )}
        </h4>
      </div>
    </div>
  );
};

export default StrategyInsightBox;