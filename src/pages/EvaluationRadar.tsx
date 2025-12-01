"use client";

import React, { useEffect, useMemo } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { EvaluationLevel, Strategy, EcoIdea } from '@/types/lcd';
import { getStrategyPriorityForDisplay, getPriorityTagClasses } from '@/utils/lcdUtils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
const CustomAngleAxisTick = ({ x, y, payload, strategies, qualitativeEvaluation, cx, cy, angle, radius }: any) => {
  const strategyId = payload.value.split('.')[0]; // Extract strategy ID from "1. Strategy Name"
  const strategy = strategies.find((s: Strategy) => s.id === strategyId);

  if (!strategy) return null;

  const priority = getStrategyPriorityForDisplay(strategy, qualitativeEvaluation);
  const { displayText, classes } = getPriorityTagClasses(priority);

  // Calculate new coordinates to push text further out from the radar chart's outer edge
  const textOffset = 25; // Pixels to push text outwards
  const angleRad = angle * (Math.PI / 180); // Convert angle to radians

  const newX = cx + (radius + textOffset) * Math.cos(angleRad);
  const newY = cy + (radius + textOffset) * Math.sin(angleRad);

  // Determine text anchor based on angle for better positioning
  let textAnchor = 'middle';
  if (angle > 45 && angle <= 135) { // Top-right quadrant
    textAnchor = 'start';
  } else if (angle > 135 && angle <= 225) { // Bottom-right quadrant
    textAnchor = 'end';
  } else if (angle > 225 && angle <= 315) { // Bottom-left quadrant
    textAnchor = 'end';
  } else if (angle > 315 || angle <= 45) { // Top-left quadrant (and 0/360)
    textAnchor = 'start';
  }

  // Adjust dy for vertical positioning of strategy name and priority tag
  // Strategy name slightly above the calculated point, priority below it
  const strategyNameDy = -5;
  const priorityTagDy = 10; // Relative to the newY

  return (
    <g>
      <text x={newX} y={newY} dy={strategyNameDy} textAnchor={textAnchor} fill="#333" fontSize={12} fontFamily="Roboto">
        {payload.value} {/* Strategy ID and Name */}
      </text>
      <text x={newX} y={newY} dy={priorityTagDy} textAnchor={textAnchor} fill="#666" fontSize={10} fontFamily="Roboto">
        <tspan className={cn("px-1 rounded-sm", classes)}>{displayText}</tspan> {/* Priority */}
      </text>
    </g>
  );
};

const EvaluationRadar: React.FC = () => {
  const { strategies, evaluationChecklists, setRadarChartData, radarChartData, qualitativeEvaluation, radarInsights, ecoIdeas } = useLcd();

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

  // Group confirmed eco-ideas by strategyId
  const confirmedEcoIdeasByStrategy = useMemo(() => {
    return ecoIdeas.filter(idea => idea.isConfirmed).reduce((acc, idea) => {
      if (!acc[idea.strategyId]) {
        acc[idea.strategyId] = [];
      }
      acc[idea.strategyId].push(idea);
      return acc;
    }, {} as { [strategyId: string]: EcoIdea[] });
  }, [ecoIdeas]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Evaluation Radar</h2>
      <p className="text-app-body-text mb-4">
        This radar chart displays the pursuit level of each of the 7 strategies for Concept A and B,
        based on your evaluations in the "Evaluation Checklists" section.
      </p>
      <p className="text-app-body-text mb-8">
        Below, you'll find the insights you've written for each strategy, along with any confirmed eco-ideas from the "Eco-Ideas Boards".
      </p>

      <div className="relative max-w-7xl mx-auto h-[600px] flex justify-center items-center mt-12">
        {strategies.length > 0 ? (
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
        ) : (
          <p className="text-app-body-text">Loading strategies...</p>
        )}
      </div>

      {/* Display Strategy Insights and Confirmed Eco-Ideas */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-2xl font-palanquin font-semibold text-app-header mb-6">Strategy Insights & Confirmed Eco-Ideas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map(strategy => {
            const insightText = radarInsights[strategy.id];
            const confirmedIdeas = confirmedEcoIdeasByStrategy[strategy.id] || [];

            // Only render a card if there's an insight or confirmed ideas
            if (!insightText && confirmedIdeas.length === 0) return null;

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
                  {insightText && (
                    <div className="mb-4">
                      <h4 className="font-bold text-app-body-text mb-1">Insight:</h4>
                      <p>{insightText}</p>
                    </div>
                  )}
                  {confirmedIdeas.length > 0 && (
                    <div>
                      <h4 className="font-bold text-app-body-text mb-1">Confirmed Eco-Ideas:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {confirmedIdeas.map((idea, index) => (
                          <li key={idea.id || index} className="text-gray-700">
                            {idea.text || "Empty eco-idea"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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