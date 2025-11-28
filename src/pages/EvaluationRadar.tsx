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
  // Desired margin from radar edge: 32px.
  // Radar right edge is at 75% of parent width (1280px * 0.75 = 960px).
  // So, for right-side boxes, left = 960px + 32px = 992px. (992/1280 = 0.775 = 77.5%)
  // Radar left edge is at 25% of parent width (1280px * 0.25 = 320px).
  // For left-side boxes, the box's right edge should be at 320px - 32px = 288px from the left.
  // This means its 'right' property should be 1280px - 288px = 992px from the right. (992/1280 = 0.775 = 77.5%)
  // No, this is incorrect. If right edge of box is at 288px from left, then right property is (1280 - 288) = 992px.
  // This is not right.
  // If the box is on the left, its right edge should be 32px from the radar's left edge.
  // Radar left edge is at 25% from parent left.
  // So, right property of box should be (100% - 25%) + 32px = 75% + 32px.
  // This is the same as the previous calc.
  // Let's re-evaluate:
  // Radar left edge is at 25% of parent width.
  // For boxes on the left, their right edge should be at 25% + 32px from the left of the parent.
  // So, `right` property should be `100% - (25% + 32px) = 75% - 32px`.
  // Let's use explicit pixel values for clarity and convert to percentage.
  // Parent width = 1280px.
  // Radar left edge = 320px. Radar right edge = 960px.
  // For right-side boxes (2,3,4): `left` should be `960px + 32px = 992px`.
  // `992px / 1280px = 0.775 = 77.5%`. So, `left: '77.5%'`.
  // For left-side boxes (5,6,7): The box's right edge should be at `320px - 32px = 288px` from the left of the parent.
  // This means its `right` property should be `1280px - 288px = 992px`.
  // `992px / 1280px = 0.775 = 77.5%`. So, `right: '77.5%'`.

  const insightBoxPositions: { [key: string]: React.CSSProperties } = {
    '1': { top: '0', left: '50%', transform: 'translateX(-50%)' }, // Top center
    '2': { top: '5%', left: '77.5%' }, // Right side, upper
    '3': { top: '40%', left: '77.5%' }, // Right side, middle
    '4': { top: '70%', left: '77.5%' }, // Right side, lower
    '5': { top: '70%', right: '77.5%' }, // Left side, lower
    '6': { top: '40%', right: '77.5%' }, // Left side, middle
    '7': { top: '5%', right: '77.5%' }, // Left side, upper
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