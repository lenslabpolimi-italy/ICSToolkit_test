"use client";

import React, { useEffect, useState, useRef } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { EvaluationLevel, ConceptType } from '@/types/lcd';
import StrategyInsightBox from '@/components/StrategyInsightBox';
import RadarEcoIdeaNote from '@/components/RadarEcoIdeaNote';
import { getStrategyPriorityForDisplay, insightBoxPositions } from '@/utils/lcdUtils';
import { cn } from '@/lib/utils';
import RadarArrows from '@/components/RadarArrows'; // NEW: Import RadarArrows

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
  const { strategies, evaluationChecklists, setRadarChartData, radarChartData, qualitativeEvaluation, radarInsights, setRadarInsights, radarEcoIdeas, setRadarEcoIdeas } = useLcd();

  const radarContainerRef = useRef<HTMLDivElement>(null);
  const insightBoxRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [radarChartCenter, setRadarChartCenter] = useState<{ x: number; y: number } | null>(null);
  const [radarChartOuterRadius, setRadarChartOuterRadius] = useState<number>(0);
  const [insightBoxRects, setInsightBoxRects] = useState<Map<string, DOMRect>>(new Map());
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  // Map EvaluationLevel to a numerical score for the radar chart
  const evaluationToScore: Record<EvaluationLevel, number> = {
    'Poor': 1,
    'Mediocre': 2,
    'Good': 3,
    'Excellent': 4,
    'N/A': 0,
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

  // NEW: useEffect to measure dimensions for arrows
  useEffect(() => {
    const measureElements = () => {
      if (radarContainerRef.current) {
        const container = radarContainerRef.current;
        const currentContainerRect = container.getBoundingClientRect();
        setContainerRect(currentContainerRect);

        // The ResponsiveContainer is 50% width and 100% height of `container`.
        // It's also horizontally centered due to `flex justify-center`.
        const radarSvgWidth = currentContainerRect.width * 0.5;
        const radarSvgHeight = currentContainerRect.height;

        // RadarChart's cx and cy are relative to its own SVG.
        // cx="50%" means 0.5 * radarSvgWidth
        // cy="42%" means 0.42 * radarSvgHeight
        // outerRadius="80%" means 0.8 * Math.min(radarSvgWidth / 2, radarSvgHeight / 2)

        // Calculate radar chart center and radius in viewport coordinates
        const radarChartCenterViewportX = currentContainerRect.left + (currentContainerRect.width - radarSvgWidth) / 2 + (0.5 * radarSvgWidth);
        const radarChartCenterViewportY = currentContainerRect.top + (0.42 * radarSvgHeight);
        const radarChartOuterRadiusValue = 0.8 * Math.min(radarSvgWidth / 2, radarSvgHeight / 2);

        setRadarChartCenter({ x: radarChartCenterViewportX, y: radarChartCenterViewportY });
        setRadarChartOuterRadius(radarChartOuterRadiusValue);

        const newInsightBoxRects = new Map<string, DOMRect>();
        strategies.forEach(strategy => {
          const ref = insightBoxRefs.current.get(strategy.id);
          if (ref) {
            newInsightBoxRects.set(strategy.id, ref.getBoundingClientRect());
          }
        });
        setInsightBoxRects(newInsightBoxRects);
      }
    };

    // Run on mount and resize
    measureElements();
    window.addEventListener('resize', measureElements);
    return () => window.removeEventListener('resize', measureElements);
  }, [strategies, radarChartData]); // Re-measure if strategies or radar data changes

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

  // Handlers for RadarEcoIdeaNote
  const handleRadarEcoIdeaDragStop = (id: string, x: number, y: number) => {
    setRadarEcoIdeas(prev =>
      prev.map(note => (note.id === id ? { ...note, x, y } : note))
    );
  };

  const handleRadarEcoIdeaTextChange = (id: string, newText: string) => {
    setRadarEcoIdeas(prev =>
      prev.map(note => (note.id === id ? { ...note, text: newText } : note))
    );
  };

  const handleRadarEcoIdeaDelete = (id: string) => {
    setRadarEcoIdeas(prev => prev.filter(note => note.id !== id));
    toast.info("Eco-idea copy removed from radar.");
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

      <div ref={radarContainerRef} className="relative max-w-7xl mx-auto h-[800px] flex justify-center items-center mt-48">
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

              return (
                <StrategyInsightBox
                  key={strategy.id}
                  strategy={strategy}
                  priority={priority}
                  text={radarInsights[strategy.id] || ''}
                  onTextChange={handleInsightTextChange}
                  className="absolute"
                  style={positionStyle}
                  ref={el => { // Attach ref to each insight box
                    if (el) insightBoxRefs.current.set(strategy.id, el);
                    else insightBoxRefs.current.delete(strategy.id);
                  }}
                />
              );
            })}

            {/* NEW: Render RadarArrows */}
            {radarChartCenter && radarChartOuterRadius > 0 && containerRect && (
              <RadarArrows
                strategies={strategies}
                radarChartCenter={radarChartCenter}
                radarChartOuterRadius={radarChartOuterRadius}
                insightBoxRects={insightBoxRects}
                containerRect={containerRect}
              />
            )}

            {/* Render RadarEcoIdeaNotes */}
            {radarEcoIdeas.map(note => (
              <RadarEcoIdeaNote
                key={note.id}
                id={note.id}
                x={note.x}
                y={note.y}
                text={note.text}
                strategyId={note.strategyId}
                conceptType={note.conceptType}
                onDragStop={handleRadarEcoIdeaDragStop}
                onTextChange={handleRadarEcoIdeaTextChange}
                onDelete={handleRadarEcoIdeaDelete}
              />
            ))}
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