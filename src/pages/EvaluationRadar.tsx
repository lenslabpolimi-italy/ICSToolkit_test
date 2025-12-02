"use client";

import React, { useEffect, useRef, useState } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { EvaluationLevel, Strategy } from '@/types/lcd';
import { getStrategyPriorityForDisplay, getPriorityTagClasses } from '@/utils/lcdUtils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import StrategyInsightBox from '@/components/StrategyInsightBox';
import DraggableStickyNote from '@/components/DraggableStickyNote';

// Custom tick component for the PolarRadiusAxis
const CustomRadiusTick = ({ x, y, payload }: any) => {
  const scoreToLabel: Record<number, string> = {
    1: 'Poor',
    2: 'Mediocre',
    3: 'Good',
    4: 'Excellent',
  };
  const label = scoreToLabel[payload.value];

  // Only render labels for scores 1-4
  if (!label) {
    return null;
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-10} y={0} dy={4} textAnchor="end" fill="#333" fontSize={10} fontFamily="Roboto">
        {label}
      </text>
    </g>
  );
};

// Custom tick component for the PolarAngleAxis to display strategy name and priority
const CustomAngleAxisTick = ({ x, y, payload, strategies, qualitativeEvaluation }: any) => {
  const strategyId = payload.value.split('.')[0]; // Extract strategy ID from "1. Strategy Name"
  const strategy = strategies.find((s: Strategy) => s.id === strategyId);

  if (!strategy) return null;

  const priority = getStrategyPriorityForDisplay(strategy, qualitativeEvaluation);
  const { displayText, classes } = getPriorityTagClasses(priority);

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Removed the text elements for strategy ID/Name and Priority */}
    </g>
  );
};

// Constants for positioning StrategyInsightBoxes and their associated notes containers
const BOX_WIDTH = 192; // w-48 in px for StrategyInsightBox
const BOX_HEIGHT = 80; // h-20 is 80px for StrategyInsightBox
const NOTES_BOX_WIDTH = 192; // w-48 in px for DraggableStickyNote
const NOTES_CONTAINER_OFFSET_Y = 16; // Margin between StrategyInsightBox and notes container

// Default parent width, will be updated dynamically
const DEFAULT_PARENT_WIDTH = 1280; 

const insightBoxPositions: { [key: string]: { top: number | string; left?: number | string; right?: number | string; transform?: string; } } = {
  '1': { top: -104, left: '50%', transform: 'translateX(-50%)' },
  '2': { top: 32, left: 'calc(75% + 20px)' }, // Right side
  '3': { top: 240, left: 'calc(75% + 20px)' },
  '4': { top: 448, left: 'calc(75% + 20px)' },
  '7': { top: 32, right: 'calc(75% + 20px)' }, // Left side
  '6': { top: 240, right: 'calc(75% + 20px)' },
  '5': { top: 448, right: 'calc(75% + 20px)' },
};

// Helper function to calculate pixel coordinates from CSS position properties
const calculatePixelPosition = (
  boxPos: typeof insightBoxPositions[keyof typeof insightBoxPositions],
  currentParentWidth: number,
  elementWidth: number
) => {
  let x = 0;
  let y = 0;

  // Calculate Y
  if (typeof boxPos.top === 'number') {
    y = boxPos.top;
  } else if (typeof boxPos.top === 'string') {
    y = parseFloat(boxPos.top);
  }

  // Function to parse a calc() string
  const parseCalc = (calcString: string, baseValue: number) => {
    let result = 0;
    const cleaned = calcString.replace(/calc\((.*)\)/, '$1').trim();
    // Regex to match numbers, percentages, px values, and their preceding operators
    const parts = cleaned.match(/([+-]?\s*\d*\.?\d+(?:%|px)?)/g) || [];

    parts.forEach(part => {
      part = part.trim();
      const operator = part.startsWith('-') ? -1 : 1;
      const value = parseFloat(part.replace(/[+-]/, '')); // Get the numeric value

      if (part.includes('%')) {
        result += operator * (baseValue * (value / 100));
      } else if (part.includes('px')) {
        result += operator * value;
      } else if (!isNaN(value)) { // Assume unitless numbers are pixels
        result += operator * value;
      }
    });
    return result;
  };

  // Calculate X
  if (boxPos.left) {
    if (typeof boxPos.left === 'string' && boxPos.left.includes('%') && !boxPos.left.includes('calc')) {
      // Simple percentage like '50%'
      x = currentParentWidth * (parseFloat(boxPos.left) / 100);
      if (boxPos.transform && boxPos.transform.includes('translateX(-50%)')) {
        x -= elementWidth / 2; // Adjust for centering transform
      }
    } else if (typeof boxPos.left === 'string' && boxPos.left.includes('calc')) {
      x = parseCalc(boxPos.left, currentParentWidth);
    } else if (typeof boxPos.left === 'number') {
      x = boxPos.left;
    }
  } else if (boxPos.right) {
    if (typeof boxPos.right === 'string' && boxPos.right.includes('calc')) {
      const rightOffset = parseCalc(boxPos.right, currentParentWidth);
      x = currentParentWidth - rightOffset - elementWidth;
    } else if (typeof boxPos.right === 'number') {
      x = currentParentWidth - boxPos.right - elementWidth;
    }
  }
  return { x, y };
};


const EvaluationRadar: React.FC = () => {
  const {
    strategies,
    evaluationChecklists,
    setRadarChartData,
    radarChartData,
    qualitativeEvaluation,
    radarInsights,
    radarEcoIdeas,
    updateRadarEcoIdeaPosition,
    updateRadarEcoIdeaText,
  } = useLcd();

  const parentRef = useRef<HTMLDivElement>(null);
  const [dynamicParentWidth, setDynamicParentWidth] = useState(DEFAULT_PARENT_WIDTH);

  useEffect(() => {
    const updateWidth = () => {
      if (parentRef.current) {
        setDynamicParentWidth(parentRef.current.offsetWidth);
      }
    };
    updateWidth(); // Set initial width
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Map EvaluationLevel to a numerical score for the radar chart
  const evaluationToScore: Record<EvaluationLevel, number> = {
    'Poor': 1,
    'Mediocre': 2,
    'Good': 3,
    'Excellent': 4,
    'N/A': 0, // N/A will be treated as 0 or not shown
    'Yes': 4,
    'Partially': 2.5,
    'No': 1,
  };

  // Function to calculate the average evaluation for a strategy
  const calculateStrategyAverage = (concept: 'A' | 'B', strategyId: string): number => {
    const conceptChecklists = evaluationChecklists[concept];
    if (!conceptChecklists) return 0;

    const strategy = strategies.find(s => s.id === strategyId);
    if (!strategy) return 0;

    let totalScore = 0;
    let count = 0;

    if (conceptChecklists.level === 'Simplified') {
      const evalLevel = conceptChecklists.strategies[strategyId] || 'N/A';
      totalScore += evaluationToScore[evalLevel];
      count = 1;
    } else if (conceptChecklists.level === 'Normal') {
      const subStrategyEvals = strategy.subStrategies.map(ss => conceptChecklists.subStrategies[ss.id] || 'N/A');
      const validScores = subStrategyEvals.map(e => evaluationToScore[e]).filter(s => s > 0);
      if (validScores.length > 0) {
        totalScore = validScores.reduce((sum, score) => sum + score, 0);
        count = validScores.length;
      }
    } else if (conceptChecklists.level === 'Detailed') {
      let guidelineScores: number[] = [];
      strategy.subStrategies.forEach(subStrategy => {
        subStrategy.guidelines.forEach(guideline => {
          const evalLevel = conceptChecklists.guidelines[guideline.id] || 'N/A';
          const score = evaluationToScore[evalLevel];
          if (score > 0) {
            guidelineScores.push(score);
          }
        });
      });
      if (guidelineScores.length > 0) {
        totalScore = guidelineScores.reduce((sum, score) => sum + score, 0);
        count = guidelineScores.length;
      }
    }

    return count > 0 ? totalScore / count : 0;
  };

  useEffect(() => {
    const newRadarDataA: { [key: string]: number } = {};
    const newRadarDataB: { [key: string]: number } = {};

    strategies.forEach(strategy => {
      newRadarDataA[strategy.id] = calculateStrategyAverage('A', strategy.id);
      newRadarDataB[strategy.id] = calculateStrategyAverage('B', strategy.id);
    });

    setRadarChartData({
      A: newRadarDataA,
      B: newRadarDataB,
    });
  }, [evaluationChecklists, strategies, setRadarChartData]);

  const data = strategies.map(strategy => ({
    strategyName: `${strategy.id}. ${strategy.name}`,
    A: radarChartData.A[strategy.id] || 0,
    B: radarChartData.B[strategy.id] || 0,
    fullMark: 4, // Max score for Excellent
  }));

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Evaluation Radar</h2>
      <p className="text-app-body-text mb-4">
        This radar chart displays the pursuit level of each of the 7 strategies for Concept A and B,
        based on your evaluations in the "Evaluation Checklists" section.
      </p>
      <p className="text-app-body-text mb-8">
        Below, you'll find the insights you've written for each strategy.
      </p>

      <div ref={parentRef} className="relative max-w-7xl mx-auto min-h-[600px] mt-32"> {/* Removed flex centering, changed h to min-h */}
        {strategies.length > 0 ? (
          <>
            <div className="w-full h-[600px] mx-auto flex justify-center items-center"> {/* New wrapper for centering radar chart */}
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis
                    dataKey="strategyName"
                    tick={(props) => (
                      <CustomAngleAxisTick
                        {...props}
                        strategies={strategies}
                        qualitativeEvaluation={qualitativeEvaluation}
                      />
                    )}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 4]}
                    tickCount={5}
                    stroke="#333"
                    tick={CustomRadiusTick}
                  />
                  <Radar name="Concept A" dataKey="A" stroke="var(--app-concept-a-dark)" fill="var(--app-concept-a-light)" fillOpacity={0.6} />
                  <Radar name="Concept B" dataKey="B" stroke="var(--app-concept-b-dark)" fill="var(--app-concept-b-light)" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Render StrategyInsightBoxes and their associated DraggableStickyNotes */}
            {strategies.map(strategy => {
              const priority = getStrategyPriorityForDisplay(strategy, qualitativeEvaluation);
              const boxPosition = insightBoxPositions[strategy.id] || {};

              const notesForCurrentStrategy = radarEcoIdeas.filter(idea => idea.strategyId === strategy.id);

              // Calculate pixel position for the StrategyInsightBox
              const { x: boxPixelX, y: boxPixelY } = calculatePixelPosition(boxPosition, dynamicParentWidth, BOX_WIDTH);

              // Calculate initial pixel position for the DraggableStickyNote
              const { x: noteBaseX } = calculatePixelPosition(boxPosition, dynamicParentWidth, NOTES_BOX_WIDTH);
              const noteInitialY = boxPixelY + BOX_HEIGHT + NOTES_CONTAINER_OFFSET_Y;

              return (
                <React.Fragment key={strategy.id}>
                  <StrategyInsightBox
                    strategy={strategy}
                    priority={priority}
                    className="absolute"
                    style={{
                      top: boxPosition.top,
                      left: boxPosition.left,
                      right: boxPosition.right,
                      transform: boxPosition.transform,
                      zIndex: 100, // Ensure insight box is on top
                    }}
                  />

                  {notesForCurrentStrategy.length > 0 && (
                    notesForCurrentStrategy.map((idea) => (
                      <DraggableStickyNote
                        key={idea.id}
                        id={idea.id}
                        initialX={idea.x !== undefined ? idea.x : noteBaseX}
                        initialY={idea.y !== undefined ? idea.y : noteInitialY}
                        text={idea.text}
                        onDragStop={updateRadarEcoIdeaPosition}
                        onTextChange={updateRadarEcoIdeaText}
                      />
                    ))
                  )}
                </React.Fragment>
              );
            })}
          </>
        ) : (
          <p className="text-app-body-text">Loading strategies...</p>
        )}
      </div>

      {/* Display Strategy Insights as static text (kept from previous step) */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map(strategy => {
            const insightText = radarInsights[strategy.id];
            if (!insightText) return null; // Only show cards for strategies with insights

            const priority = getStrategyPriorityForDisplay(strategy, qualitativeEvaluation);
            const { displayText, classes } = getPriorityTagClasses(priority);

            return (
              <Card key={strategy.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-palanquin font-semibold text-app-header flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-roboto-condensed px-1 rounded-sm",
                      classes
                    )}>
                      {displayText}
                    </span>
                    {strategy.id}. {strategy.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-app-body-text font-roboto-condensed">
                  {insightText}
                </CardContent>
              </Card>
            );
            })}
        </div>
      </div>

      <WipeContentButton sectionKey="radarChart" />
    </div>
  );
};

export default EvaluationRadar;