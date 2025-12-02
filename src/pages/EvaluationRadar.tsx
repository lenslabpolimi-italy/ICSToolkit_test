"use client";

import React, { useEffect, useRef } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { EvaluationLevel, Strategy } from '@/types/lcd';
import { getStrategyPriorityForDisplay, getPriorityTagClasses } from '@/utils/lcdUtils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import StrategyInsightBox from '@/components/StrategyInsightBox';
import RadarStickyNote from '@/components/RadarStickyNote';

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
const NOTES_BOX_WIDTH = '192px'; // w-48
const NOTES_BOX_HEIGHT = '144px'; // h-36

// Adjusted positions to prevent overlap with the radar chart
const insightBoxPositions: { [key: string]: { top: number | string; left?: number | string; right?: number | string; transform?: string; } } = {
  '1': { top: -100, left: '50%', transform: 'translateX(-50%)' }, // Above the radar
  '2': { top: 50, left: 'calc(50% + 320px + 20px)' }, // Top-right, outside radar's horizontal extent
  '3': { top: 250, left: 'calc(50% + 320px + 20px)' }, // Mid-right, outside radar's horizontal extent
  '4': { top: 450, left: 'calc(50% + 320px + 20px)' }, // Bottom-right, outside radar's horizontal extent
  '7': { top: 50, right: 'calc(50% + 320px + 20px)' }, // Top-left, outside radar's horizontal extent
  '6': { top: 250, right: 'calc(50% + 320px + 20px)' }, // Mid-left, outside radar's horizontal extent
  '5': { top: 450, right: 'calc(50% + 320px + 20px)' }, // Bottom-left, outside radar's horizontal extent
};

const EvaluationRadar: React.FC = () => {
  const { strategies, evaluationChecklists, setRadarChartData, radarChartData, qualitativeEvaluation, radarInsights, radarEcoIdeas, updateRadarEcoIdeaText, updateRadarEcoIdeaPosition } = useLcd();

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const notesContainerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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

  // Effect to calculate and set initial positions for newly added radar eco-ideas
  useEffect(() => {
    const mainContainer = mainContainerRef.current;
    if (!mainContainer) return;

    radarEcoIdeas.forEach(idea => {
      // Only process ideas that haven't been positioned yet (x,y are default 0,0)
      if (idea.x === 0 && idea.y === 0) {
        const targetContainer = notesContainerRefs.current[idea.strategyId];
        if (targetContainer) {
          const targetRect = targetContainer.getBoundingClientRect();
          const mainRect = mainContainer.getBoundingClientRect();

          // Calculate position relative to the main EvaluationRadar container
          const calculatedX = targetRect.left - mainRect.left + 8; // +8 for padding
          const calculatedY = targetRect.top - mainRect.top + 8; // +8 for padding

          // Update the position in the context, which will trigger a re-render
          updateRadarEcoIdeaPosition(idea.id, calculatedX, calculatedY);
        }
      }
    });
  }, [radarEcoIdeas, strategies, updateRadarEcoIdeaPosition]); // Depend on radarEcoIdeas and strategies for ref availability

  const data = strategies.map(strategy => ({
    strategyName: `${strategy.id}. ${strategy.name}`,
    A: radarChartData.A[strategy.id] || 0,
    B: radarChartData.B[strategy.id] || 0,
    fullMark: 4, // Max score for Excellent
  }));

  return (
    <div ref={mainContainerRef} className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Evaluation Radar</h2>
      <p className="text-app-body-text mb-4">
        This radar chart displays the pursuit level of each of the 7 strategies for Concept A and B,
        based on your evaluations in the "Evaluation Checklists" section.
      </p>
      <p className="text-app-body-text mb-8">
        Below, you'll find the insights you've written for each strategy.
      </p>

      <div className="relative max-w-7xl mx-auto h-[800px] flex justify-center items-center mt-48"> {/* Increased height and top margin */}
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

            {/* Render StrategyInsightBoxes and their associated notes containers (visual guides) */}
            {strategies.map(strategy => {
              const priority = getStrategyPriorityForDisplay(strategy, qualitativeEvaluation);
              const boxPosition = insightBoxPositions[strategy.id] || {};

              // Calculate the position for the notes container
              const notesContainerStyle: React.CSSProperties = {
                position: 'absolute',
                top: `calc(${boxPosition.top}px + ${BOX_HEIGHT}px + ${NOTES_CONTAINER_OFFSET_Y}px)`,
                left: boxPosition.left,
                right: boxPosition.right,
                transform: boxPosition.transform,
                width: NOTES_BOX_WIDTH,
                height: NOTES_BOX_HEIGHT,
                border: '2px solid var(--app-accent)', // Orange border from image
                borderRadius: '8px',
                padding: '8px',
                overflowY: 'auto', // Allow scrolling if many notes
                backgroundColor: 'white', // White background for the box
                zIndex: 80, // Changed zIndex to 80 to send it to the back
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              };

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
                      zIndex: 90, // Changed zIndex to 90
                    }}
                  />
                  {/* This div acts as a visual placeholder for where notes initially appear */}
                  <div
                    ref={el => notesContainerRefs.current[strategy.id] = el}
                    style={notesContainerStyle}
                  >
                    {/* Only show "No confirmed ideas yet." if there are no notes for this strategy */}
                    {!radarEcoIdeas.some(idea => idea.strategyId === strategy.id) && (
                      <p className="text-sm text-gray-500 italic font-roboto-condensed">No confirmed ideas yet.</p>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </>
        ) : (
          <p className="text-app-body-text">Loading strategies...</p>
        )}
      </div>

      {/* Render RadarStickyNotes directly within the main container, using their state-managed positions */}
      {radarEcoIdeas.length > 0 && radarEcoIdeas.map((idea) => (
        <RadarStickyNote
          key={idea.id}
          id={idea.id}
          x={idea.x} // Use the x from the context
          y={idea.y} // Use the y from the context
          text={idea.text}
          onTextChange={updateRadarEcoIdeaText}
          onDragStop={updateRadarEcoIdeaPosition}
        />
      ))}

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