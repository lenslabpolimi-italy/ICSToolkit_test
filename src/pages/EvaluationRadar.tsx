"use client";

import React, { useEffect, useState } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { EvaluationLevel, ConceptType } from '@/types/lcd'; // Import ConceptType
import StrategyInsightBox from '@/components/StrategyInsightBox';
import { getStrategyPriorityForDisplay } from '@/utils/lcdUtils';
import { cn } from '@/lib/utils'; // Import cn for utility classes

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

const EvaluationRadar: React.FC = () => {
  const { strategies, evaluationChecklists, setRadarChartData, radarChartData, qualitativeEvaluation, radarInsights, setRadarInsights, ecoIdeas } = useLcd(); // Get ecoIdeas from context

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

  const handleInsightTextChange = (strategyId: string, newText: string) => {
    setRadarInsights(prev => ({
      ...prev,
      [strategyId]: newText,
    }));
  };

  // Adjusted positions to place boxes in two columns around the radar chart
  const insightBoxPositions: { [key: string]: React.CSSProperties } = {
    // Strategy 1 box positioned above the radar chart with a 32px margin from the top of the radar area
    '1': { top: '-160px', left: '50%', transform: 'translateX(-50%)' },

    // Right side of the radar chart (aligned with radar's vertical extent)
    '2': { top: '32px', left: 'calc(75% + 20px)' },
    '3': { top: '240px', left: 'calc(75% + 20px)' },
    '4': { top: '448px', left: 'calc(75% + 20px)' },

    // Left side of the radar chart (aligned with radar's vertical extent)
    '7': { top: '32px', right: 'calc(75% + 20px)' },
    '6': { top: '240px', right: 'calc(75% + 20px)' },
    '5': { top: '448px', right: 'calc(75% + 20px)' },
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Evaluation Radar</h2>
      <p className="text-app-body-text mb-4">
        This radar chart displays the pursuit level of each of the 7 strategies for Concept A and B,
        based on your evaluations in the "Evaluation Checklists" section. Use the text boxes to add insights for each strategy.
      </p>
      <p className="text-app-body-text mb-8">
        Confirmed eco-ideas from the "Eco-Ideas Boards" will also appear here, grouped by concept.
      </p>

      <div className="relative max-w-7xl mx-auto h-[800px] flex justify-center items-center mt-48">
        {strategies.length > 0 ? (
          <>
            <ResponsiveContainer width="50%" height="100%">
              <RadarChart cx="50%" cy="42%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis tick={false} />
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

              // Filter confirmed eco-ideas for this strategy and concept A
              const confirmedIdeasA = ecoIdeas.filter(
                idea => idea.isConfirmed && idea.strategyId === strategy.id && idea.conceptType === 'A'
              );
              // Filter confirmed eco-ideas for this strategy and concept B
              const confirmedIdeasB = ecoIdeas.filter(
                idea => idea.isConfirmed && idea.strategyId === strategy.id && idea.conceptType === 'B'
              );

              return (
                <StrategyInsightBox
                  key={strategy.id}
                  strategy={strategy}
                  priority={priority}
                  text={radarInsights[strategy.id] || ''}
                  onTextChange={handleInsightTextChange}
                  className="absolute"
                  style={positionStyle}
                >
                  {/* Display confirmed ideas for Concept A */}
                  {confirmedIdeasA.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <h5 className="text-xs font-palanquin font-semibold text-app-concept-a-base mb-1">Concept A Ideas:</h5>
                      <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                        {confirmedIdeasA.map(idea => (
                          <li key={idea.id} className="truncate">{idea.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Display confirmed ideas for Concept B */}
                  {confirmedIdeasB.length > 0 && (
                    <div className={cn("mt-2 pt-2 border-t border-gray-100", confirmedIdeasA.length === 0 && "mt-0 pt-0 border-t-0")}>
                      <h5 className="text-xs font-palanquin font-semibold text-app-concept-b-base mb-1">Concept B Ideas:</h5>
                      <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                        {confirmedIdeasB.map(idea => (
                          <li key={idea.id} className="truncate">{idea.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </StrategyInsightBox>
              );
            })}
          </>
        ) : (
          <p className="text-app-body-text">Loading strategies...</p>
        )}
      </div>

      <WipeContentButton sectionKey="radarChart" />
    </div>
  );
};

export default EvaluationRadar;