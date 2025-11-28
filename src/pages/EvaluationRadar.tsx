"use client";

import React, { useEffect, useState } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { EvaluationLevel } from '@/types/lcd';
import StrategyInsightBox from '@/components/StrategyInsightBox';
import { getStrategyPriorityForDisplay } from '@/utils/lcdUtils';

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
  const { strategies, evaluationChecklists, setRadarChartData, radarChartData, qualitativeEvaluation, radarInsights, setRadarInsights } = useLcd();

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

  // Define positions for the insight boxes around the radar chart
  // The parent container is max-w-7xl (1280px) and h-[800px].
  // The ResponsiveContainer for the radar is width="50%", so it's 640px wide, centered.
  // This leaves (1280 - 640) / 2 = 320px on each side.
  // The StrategyInsightBox is w-72 (288px).
  // So, there's (320 - 288) / 2 = 16px padding on each side of the boxes.
  const insightBoxPositions: { [key: string]: React.CSSProperties } = {
    '1': { top: '0', left: '50%', transform: 'translateX(-50%)' }, // Top center
    '2': { top: '5%', left: 'calc(75% + 16px)' }, // Right side, upper (adjusted from 10%)
    '3': { top: '40%', left: 'calc(75% + 16px)' }, // Right side, middle
    '4': { top: '70%', left: 'calc(75% + 16px)' }, // Right side, lower
    '5': { top: '70%', right: 'calc(75% + 16px)' }, // Left side, lower
    '6': { top: '40%', right: 'calc(75% + 16px)' }, // Left side, middle
    '7': { top: '5%', right: 'calc(75% + 16px)' }, // Left side, upper (adjusted from 10%)
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Evaluation Radar</h2>
      <p className="text-app-body-text mb-4">
        This radar chart displays the pursuit level of each of the 7 strategies for Concept A and B,
        based on your evaluations in the "Evaluation Checklists" section. Use the text boxes to add insights for each strategy.
      </p>

      <div className="relative max-w-7xl mx-auto h-[800px] flex justify-center items-center"> {/* Increased height and max-width */}
        {strategies.length > 0 ? (
          <>
            <ResponsiveContainer width="50%" height="100%" className="mt-px"> {/* Added mt-px for 1px top margin */}
              <RadarChart cx="50%" cy="42%" outerRadius="80%" data={data}> {/* Adjusted cy to 42% */}
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis tick={false} />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 4]}
                  tickCount={5}
                  stroke="#333"
                  tick={CustomRadiusTick} // Use the custom tick component
                />
                <Radar name="Concept A" dataKey="A" stroke="var(--app-concept-a-dark)" fill="var(--app-concept-a-light)" fillOpacity={0.6} />
                <Radar name="Concept B" dataKey="B" stroke="var(--app-concept-b-dark)" fill="var(--app-concept-b-light)" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>

            {/* Render StrategyInsightBoxes */}
            {strategies.map(strategy => {
              const priority = getStrategyPriorityForDisplay(strategy, qualitativeEvaluation);
              const positionStyle = insightBoxPositions[strategy.id] || {}; // Get predefined position

              return (
                <StrategyInsightBox
                  key={strategy.id}
                  strategy={strategy}
                  priority={priority}
                  text={radarInsights[strategy.id] || ''}
                  onTextChange={handleInsightTextChange}
                  className="absolute" // Use absolute positioning
                  style={positionStyle}
                />
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