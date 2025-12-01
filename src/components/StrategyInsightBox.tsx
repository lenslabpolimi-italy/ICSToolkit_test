"use client";

import React, { ReactNode } from 'react'; // Import ReactNode
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Strategy, PriorityLevel } from '@/types/lcd';
import { getPriorityTagClasses } from '@/utils/lcdUtils';

interface StrategyInsightBoxProps {
  strategy: Strategy;
  priority: PriorityLevel;
  text: string;
  onTextChange: (strategyId: string, newText: string) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode; // NEW: Add children prop
}

const StrategyInsightBox: React.FC<StrategyInsightBoxProps> = ({
  strategy,
  priority,
  text,
  onTextChange,
  className,
  style,
  children // Destructure children
}) => {
  const { displayText, classes } = getPriorityTagClasses(priority);

  return (
    <div className={cn(
      "bg-white p-3 rounded-lg shadow-md border border-gray-200 flex flex-col",
      "w-72 h-auto min-h-48", // Changed height to auto and added min-h-48
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
      <Textarea
        value={text}
        onChange={(e) => onTextChange(strategy.id, e.target.value)}
        placeholder="Write your insights here..."
        className="flex-grow resize-none text-sm font-roboto-condensed"
      />
      {children} {/* Render children here */}
    </div>
  );
};

export default StrategyInsightBox;