"use client";

import React, { useEffect } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { EvaluationLevel, Strategy } from '@/types/lcd';
import { getStrategyPriorityForDisplay, getPriorityTagClasses } from '@/utils/lcdUtils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import StrategyInsightBox from '@/components/StrategyInsightBox';
import DraggableStickyNote from '@/components/DraggableStickyNote'; // Import the new component

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
const BOX_HEIGHT = 80; // h-20 is 80px
const NOTES_CONTAINER_OFFSET_Y = 16; // Margin between StrategyInsightBox and notes container
const NOTES_BOX_WIDTH = 192; // w-48 in px
const NOTES_BOX_HEIGHT = 144; // h-36 in px

const insightBoxPositions: { [key: string]: { top: number | string; left?: number | string; right?: number | string; transform?: string; } } = {
  '1': { top: -104, left: '50%', transform: 'translateX(-50%)' },
  '2': { top: 32, left: 'calc(75% + 20px)' }, // Right side
  '3': { top: 240, left: 'calc(75% + 20px)' },
  '4': { top: 448, left: 'calc(75% + 20px)' },
  '7': { top: 32, right: 'calc(75% + 20px)' }, // Left side
  '6': { top: 240, right: 'calc(75% + 20px)' },
  '5': { top: 448, right: 'calc(75% + 20px)' },
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

      <div className="relative max-w-7xl mx-auto h-[600px] flex justify-center items-center mt-32">
        {strategies.length > 0 ? (
          <>
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

            {/* Render StrategyInsightBoxes and their associated DraggableStickyNotes */}
            {strategies.map(strategy => {
              const priority = getStrategyPriorityForDisplay(strategy, qualitativeEvaluation);
              const boxPosition = insightBoxPositions[strategy.id] || {};

              const notesForCurrentStrategy = radarEcoIdeas.filter(idea => idea.strategyId === strategy.id);

              // Calculate the initial position for the notes container
              // This is a fallback if the note doesn't have stored x, y coordinates
              let initialNotesContainerX = 0;
              let initialNotesContainerY = 0;

              // Determine initial X position
              if (boxPosition.left) {
                if (typeof boxPosition.left === 'string' && boxPosition.left.includes('%')) {
                  // For '50%', calculate relative to parent width (assuming parent is max-w-7xl, 1280px)
                  // This is a rough estimate, actual calculation might need parent ref
                  initialNotesContainerX = (1280 / 2) - (NOTES_BOX_WIDTH / 2); // Center it
                } else if (typeof boxPosition.left === 'string' && boxPosition.left.includes('calc')) {
                  // For 'calc(75% + 20px)', this is relative to the radar chart's container.
                  // We need to convert this to a pixel value relative to the parent of DraggableStickyNote.
                  // For simplicity, let's assume the 'calc' values are relative to the radar chart's center.
                  // This might need fine-tuning based on actual layout.
                  // For now, we'll use a placeholder and rely on Draggable's defaultPosition.
                  // The `Draggable` component handles `defaultPosition` relative to its parent.
                  // We need to ensure the parent of DraggableStickyNote is the `relative` div.
                  // The `top` and `left/right` values in `insightBoxPositions` are already relative to this parent.
                  // So, we can directly use them.
                } else {
                  initialNotesContainerX = parseFloat(boxPosition.left as string);
                }
              } else if (boxPosition.right) {
                // Similar logic for right, but relative to parent's right edge
                // This will be handled by Draggable's defaultPosition if we pass the right value.
              }

              // Determine initial Y position
              if (boxPosition.top) {
                initialNotesContainerY = parseFloat(boxPosition.top as string) + BOX_HEIGHT + NOTES_CONTAINER_OFFSET_Y;
              }

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
                        initialX={idea.x !== undefined ? idea.x : (boxPosition.left === '50%' ? (1280 / 2) - (NOTES_BOX_WIDTH / 2) : (boxPosition.left ? parseFloat(boxPosition.left as string) : (1280 - NOTES_BOX_WIDTH - parseFloat(boxPosition.right as string))))} // Simplified initial X calculation
                        initialY={idea.y !== undefined ? idea.y : (parseFloat(boxPosition.top as string) + BOX_HEIGHT + NOTES_CONTAINER_OFFSET_Y)} // Simplified initial Y calculation
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