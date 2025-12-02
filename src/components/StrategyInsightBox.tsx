"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Strategy } from '@/types/lcd';
import { getPriorityTagClasses, StrategyPriority } from '@/utils/lcdUtils';

interface StrategyInsightBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  strategy: Strategy;
  priority: StrategyPriority;
}

const StrategyInsightBox = React.forwardRef<HTMLDivElement, StrategyInsightBoxProps>(
  ({ strategy, priority, className, style, ...props }, ref) => {
    const { displayText, classes } = getPriorityTagClasses(priority);

    return (
      <Card
        ref={ref} // Forward the ref to the Card component's underlying div
        className={cn(
          "w-48 h-20 flex flex-col justify-center items-center p-2 shadow-md",
          "bg-white border-2 border-gray-300 rounded-lg",
          className
        )}
        style={style}
        {...props}
      >
        <CardHeader className="p-0 pb-1 text-center">
          <CardTitle className="text-sm font-palanquin font-semibold text-app-header flex items-center justify-center gap-1">
            <span className={cn(
              "text-xs font-roboto-condensed px-1 rounded-sm",
              classes
            )}>
              {displayText}
            </span>
            {strategy.id}. {strategy.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 text-xs text-app-body-text font-roboto-condensed text-center">
          {/* No content needed here, just the title and priority */}
        </CardContent>
      </Card>
    );
  }
);

StrategyInsightBox.displayName = 'StrategyInsightBox';

export default StrategyInsightBox;