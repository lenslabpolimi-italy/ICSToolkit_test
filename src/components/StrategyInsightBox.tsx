"use client";

import React, { ReactNode } from 'react';
import { Textarea } from '@/components/ui/textarea'; // Re-import Textarea
import { cn } from '@/lib/utils';
import { Strategy, PriorityLevel } from '@/types/lcd';
import { getPriorityTagClasses } from '@/utils/lcdUtils';

interface StrategyInsightBoxProps {
  strategy: Strategy;
  priority: PriorityLevel;
  text: string;
  onTextChange: (strategyId: string, newText: string) => void; // Re-add onTextChange prop
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

const StrategyInsightBox: React.FC<StrategyInsightBoxProps> = ({
  strategy,
  priority,
  text,
  onTextChange, // Destructure onTextChange
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
      <Textarea
        placeholder="Add your insights here..."
        value={text}
        onChange={(e) => onTextChange(strategy.id, e.target.value)}
        rows={5}
        className="mt-2 text-sm font-roboto-condensed bg-gray-50 border-gray-200"
      />
      {children}
    </div>
  );
};

export default StrategyInsightBox;