"use client";

import React, { ReactNode } from 'react';
// Removed import for Textarea as it's no longer used
import { cn } from '@/lib/utils';
import { Strategy, PriorityLevel } from '@/types/lcd';
import { getPriorityTagClasses } from '@/utils/lcdUtils';

interface StrategyInsightBoxProps {
  strategy: Strategy;
  priority: PriorityLevel;
  text: string; // Keeping text prop for potential future display or re-introduction of editing
  // Removed onTextChange prop
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

const StrategyInsightBox: React.FC<StrategyInsightBoxProps> = ({
  strategy,
  priority,
  text,
  // Removed onTextChange from destructuring
  className,
  style,
  children
}) => {
  const { displayText, classes } = getPriorityTagClasses(priority);

  return (
    <div className={cn(
      "flex flex-col",
      "w-72 h-auto min-h-48",
      className
    )} style={style}>
      <div className="flex items-center mb-2">
        <span className={cn(
          "text-xs font-roboto-condensed px-1 rounded-sm mr-2",
          classes
        )}>
          {displayText}
        </span>
        <h4 className="text-sm font-palanquin font-semibold text-app-header">
          {strategy.id}. {strategy.name}
        </h4>
      </div>
      {/* Textarea component removed as requested */}
      {children}
    </div>
  );
};

export default StrategyInsightBox;