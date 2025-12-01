"use client";

import React, { ReactNode } from 'react';
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
  children?: ReactNode;
}

const StrategyInsightBox: React.FC<StrategyInsightBoxProps> = ({
  strategy,
  priority,
  text,
  onTextChange,
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
        value={text}
        onChange={(e) => onTextChange(strategy.id, e.target.value)}
        className="flex-grow resize-none text-sm font-roboto-condensed border-none focus-visible:ring-0 focus-visible:ring-offset-0" // Removed border and ring
      />
      {children}
    </div>
  );
};

export default StrategyInsightBox;