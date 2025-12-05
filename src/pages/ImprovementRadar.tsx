"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Strategy } from '@/types/lcd';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'; // Added Radar here
import { cn } from '@/lib/utils';
import { useLcd } from '@/context/LcdContext';
import StrategyInsightBox from '@/components/StrategyInsightBox';
import { getStrategyPriorityForDisplay, getPriorityTagClasses } from '@/utils/lcdUtils';

// Custom tick component for the PolarRadiusAxis
const CustomRadiusTick = ({ x, y, payload }: any) => {
  const scoreToLabel: Record<number, string> = {
    1: 'Worst -',
    2: 'No Improvement =',
    3: 'Incremental Improvement +',
    4: 'Radical Improvement ++',
  };
  const label = scoreToLabel[payload.value];
  if (!label) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-10} y={0} dy={4} textAnchor="end" fill="#333" fontSize={10} fontFamily="Roboto">
        {label}
      </text>
    </g>
  );
};

// Custom tick component for the PolarAngleAxis to display strategy name
const CustomAngleAxisTickImprovement = ({ x, y, payload, strategies }: any) => {
  const strategyId = payload.value.split('.')[0];
  const strategy = strategies.find((s: Strategy) => s.id === strategyId);
  if (!strategy) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Strategy name is displayed in StrategyInsightBox, so no text here */}
    </g>
  );
};

// Constants for positioning StrategyInsightBoxes
const BOX_HEIGHT = 80; // h-20 is 80px

// Adjusted positions for the 6 strategies around the radar
const insightBoxPositions: { [key: string]: { top: number | string; left?: number | string; right?: number | string; transform?: string; } } = {
  '1': { top: -104, left: '50%', transform: 'translateX(-50%)' }, // Top center
  '2': { top: 100, left: 'calc(75% + 20px)' }, // Top-right
  '3': { top: 400, left: 'calc(75% + 20px)' }, // Bottom-right
  '4': { top: 650, left: '50%', transform: 'translateX(-50%)' }, // Bottom center, adjusted for more space
  '6': { top: 100, right: 'calc(75% + 20px)' }, // Top-left
  '5': { top: 400, right: 'calc(75% + 20px)' }, // Bottom-left
};

const ImprovementRadar: React.FC = () => {
  const { strategies, qualitativeEvaluation, radarChartData } = useLcd();
  const navigate = useNavigate();

  // Filter strategies to exclude Strategy 7 for radar display
  const strategiesForRadar = strategies.filter(s => s.id !== '7');

  // Calculate improvement data based on Concept B vs Concept A
  const improvementRadarData = strategiesForRadar.map(strategy => {
    const scoreA = radarChartData.A[strategy.id] || 0;
    const scoreB = radarChartData.B[strategy.id] || 0;

    let improvementScore: number;
    const difference = scoreB - scoreA;

    if (scoreA === 0 || scoreB === 0) { // If either concept is not evaluated, show as 'No Improvement' or 0
      improvementScore = 2; // Default to 'No Improvement =' if data is missing
    } else if (difference <= -1) { // B is worse than A
      improvementScore = 1; // Maps to 'Worst -'
    } else if (difference === 0) { // B is same as A
      improvementScore = 2; // Maps to 'No Improvement ='
    } else if (difference === 1) { // B is slightly better than A
      improvementScore = 3; // Maps to 'Incremental Improvement +'
    } else { // difference >= 2, B is significantly better than A
      improvementScore = 4; // Maps to 'Radical Improvement ++'
    }

    return {
      strategyName: `${strategy.id}. ${strategy.name}`,
      improvement: improvementScore,
      fullMark: 4,
    };
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Improvement Radar</h2>
      <p className="text-app-body-text mb-4">
        This radar chart illustrates the improvement of Concept B compared to Concept A for each strategy.
      </p>

      <div className="mb-8 flex justify-end gap-4">
        <Button
          onClick={() => navigate('/evaluation-radar')}
          className="bg-gray-500 hover:bg-gray-600 text-white font-roboto-condensed"
        >
          Back to Evaluation Radar
        </Button>
      </div>

      <div className="relative max-w-7xl mx-auto h-[700px] flex justify-center items-center mt-32">
        {strategiesForRadar.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={improvementRadarData}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis
                  dataKey="strategyName"
                  tick={(props) => (
                    <CustomAngleAxisTickImprovement
                      {...props}
                      strategies={strategiesForRadar}
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
                <Radar
                  name="Improvement"
                  dataKey="improvement"
                  stroke="#4CAF50" // Green color for improvement
                  fill="#4CAF50"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>

            {/* Render StrategyInsightBoxes */}
            {strategiesForRadar.map(strategy => {
              const priority = getStrategyPriorityForDisplay(strategy, qualitativeEvaluation);
              const boxPosition = insightBoxPositions[strategy.id] || {};

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
                      zIndex: 10,
                    }}
                  />
                </React.Fragment>
              );
            })}
          </>
        ) : (
          <p className="text-app-body-text">Loading strategies...</p>
        )}
      </div>

      {/* Manual Legend for Improvement */}
      <div className="flex justify-center gap-8 mt-12 mb-8 text-app-body-text font-roboto-condensed">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 block rounded-full bg-green-500 border border-green-700"></span>
          <span>Concept B vs Concept A Improvement</span>
        </div>
      </div>
    </div>
  );
};

export default ImprovementRadar;