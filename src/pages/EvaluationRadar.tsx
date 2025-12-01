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
import StaticStickyNote from '@/components/StaticStickyNote';

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

// Constants for positioning StrategyInsightBoxes
const BOX_HEIGHT = 80; // h-20 is 80px
const IDEAS_BOX_MARGIN_TOP = 16; // Margin between Strategy 1 box and ideas box
const NOTE_WIDTH = 192; // w-48
const NOTE_HEIGHT = 100; // min-h-[100px]
const NOTE_VERTICAL_SPACING = 10; // Space between stacked notes

const insightBoxPositions: { [key: string]: React.CSSProperties } = {
  '1': { top: -104, left: '50%', transform: 'translateX(-50%)' },
  '2': { top: 32, left: 'calc(75% + 20px)' }, // Right side
  '3': { top: 240, left: 'calc(75% + 20px)' },
  '4': { top: 448, left: 'calc(75% + 20px)' },
  '7': { top: 32, right: 'calc(75% + 20px)' }, // Left side
  '6': { top: 240, right: 'calc(75% + 20px)' },
  '5': { top: 448, right: 'calc(75% + 20px)' },
};

const EvaluationRadar: React.FC = () => {
  const { strategies, evaluationChecklists, setRadarChartData, radarChartData, qualitativeEvaluation, radarInsights, ecoIdeas, radarEcoIdeas, setRadarEcoIdeas } = useLcd();

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

  // Effect to synchronize radarEcoIdeas with confirmed ecoIdeas, preserving edits and calculating initial positions
  useEffect(() => {
    const allConfirmedEcoIdeas = ecoIdeas.filter(
      (idea) => idea.isConfirmed
    );

    setRadarEcoIdeas(prevRadarEcoIdeas => {
      const nextRadarEcoIdeas = [];
      const prevRadarEcoIdeasMap = new Map(prevRadarEcoIdeas.map(idea => [idea.id, idea]));

      // Temporary map to track how many notes have been placed for each strategy
      const strategyNoteCounts: { [key: string]: number } = {};

      allConfirmedEcoIdeas.forEach(confirmedIdea => {
        const existingRadarIdea = prevRadarEcoIdeasMap.get(confirmedIdea.id);
        if (existingRadarIdea) {
          // If the idea already exists in radarEcoIdeas, keep its current state (including edits and position)
          nextRadarEcoIdeas.push(existingRadarIdea);
        } else {
          // If it's a new confirmed idea, calculate an initial position relative to its strategy box
          const strategyId = confirmedIdea.strategyId;
          const strategyBoxPos = insightBoxPositions[strategyId];
          let initialX = 0;
          let initialY = 0;

          if (strategyBoxPos) {
            const radarContainerWidth = 1200; // Approximate width of the radar chart container (max-w-7xl)

            // Base Y position is below the strategy box
            initialY = (parseFloat(strategyBoxPos.top as string || '0') || 0) + BOX_HEIGHT + IDEAS_BOX_MARGIN_TOP;

            // Calculate X based on left/right/transform
            if (strategyBoxPos.left) {
              const leftVal = parseFloat(strategyBoxPos.left as string || '0');
              if (strategyBoxPos.transform?.includes('translateX(-50%)')) {
                // Centered box (Strategy 1)
                initialX = (radarContainerWidth / 2) - (NOTE_WIDTH / 2);
              } else {
                // Right side boxes (Strategies 2,3,4)
                // 'calc(75% + 20px)' -> 0.75 * radarContainerWidth + 20
                initialX = (0.75 * radarContainerWidth) + 20;
              }
            } else if (strategyBoxPos.right) {
              // Left side boxes (Strategies 5,6,7)
              // 'calc(75% + 20px)' from right -> 0.25 * radarContainerWidth - 20 - NOTE_WIDTH
              initialX = (0.25 * radarContainerWidth) - 20 - NOTE_WIDTH;
            }
          }

          // Stack notes vertically if multiple for the same strategy
          const currentNoteCount = strategyNoteCounts[strategyId] || 0;
          initialY += currentNoteCount * (NOTE_HEIGHT + NOTE_VERTICAL_SPACING);
          strategyNoteCounts[strategyId] = currentNoteCount + 1;

          nextRadarEcoIdeas.push({
            ...confirmedIdea,
            x: initialX,
            y: initialY,
          });
        }
      });

      // Filter out any ideas from prevRadarEcoIdeas that are no longer confirmed
      const confirmedIds = new Set(allConfirmedEcoIdeas.map(idea => idea.id));
      return nextRadarEcoIdeas.filter(idea => confirmedIds.has(idea.id));
    });
  }, [ecoIdeas, setRadarEcoIdeas, strategies]); // Add strategies to dependencies

  const data = strategies.map(strategy => ({
    strategyName: `${strategy.id}. ${strategy.name}`,
    A: radarChartData.A[strategy.id] || 0,
    B: radarChartData.B[strategy.id] || 0,
    fullMark: 4, // Max score for Excellent
  }));

  // Handler for text changes in StaticStickyNote, now updates radarEcoIdeas
  const handleStaticNoteTextChange = (id: string, newText: string) => {
    setRadarEcoIdeas(prev =>
      prev.map(idea => (idea.id === id ? { ...idea, text: newText } : idea))
    );
  };

  // Handler for drag stop on StaticStickyNote
  const handleStaticNoteDragStop = (id: string, x: number, y: number) => {
    setRadarEcoIdeas(prev =>
      prev.map(idea => (idea.id === id ? { ...idea, x, y } : idea))
    );
  };

  // Handler for deleting StaticStickyNote
  const handleStaticNoteDelete = (id: string) => {
    setRadarEcoIdeas(prev => prev.filter(idea => idea.id !== id));
  };

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

            {/* Render StrategyInsightBoxes */}
            {strategies.map(strategy => {
              const priority = getStrategyPriorityForDisplay(strategy, qualitativeEvaluation);
              const positionStyle = insightBoxPositions[strategy.id] || {};

              return (
                <StrategyInsightBox
                  key={strategy.id}
                  strategy={strategy}
                  priority={priority}
                  className="absolute"
                  style={positionStyle}
                />
              );
            })}

            {/* Render StaticStickyNotes for all strategies */}
            {radarEcoIdeas.map(idea => (
              <StaticStickyNote
                key={idea.id}
                idea={idea}
                onTextChange={handleStaticNoteTextChange}
                onDragStop={handleStaticNoteDragStop}
                onDelete={handleStaticNoteDelete}
              />
            ))}
          </>
        ) : (
          <p className="text-app-body-text">Loading strategies...</p>
        )}
      </div>

      {/* Display Strategy Insights as static text (kept from previous step) */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-2xl font-palanquin font-semibold text-app-header mb-6">Strategy Insights</h3>
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