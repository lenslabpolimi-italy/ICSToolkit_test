"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { EvaluationLevel } from '@/types/lcd';
import StrategyNotesBox from '@/components/StrategyNotesBox'; // New import

const BOX_WIDTH = 200;
const BOX_HEIGHT = 180;

// Define fixed positions for the 7 text boxes around the chart
// These are relative to the parent container of the chart and boxes (radarCanvasRef)
const textBoxPositions = [
  // Strategy 1 (top-left)
  { top: '5%', left: '5%' },
  // Strategy 2 (top-right)
  { top: '5%', right: '5%' },
  // Strategy 3 (mid-left)
  { top: '30%', left: '0%' },
  // Strategy 4 (mid-right)
  { top: '30%', right: '0%' },
  // Strategy 5 (bottom-left)
  { bottom: '5%', left: '5%' },
  // Strategy 6 (bottom-right)
  { bottom: '5%', right: '5%' },
  // Strategy 7 (bottom-center)
  { bottom: '0%', left: '50%', transform: 'translateX(-50%)' },
];

const EvaluationRadar: React.FC = () => {
  const { strategies, evaluationChecklists, setRadarChartData, radarChartData, radarNotes, setRadarNotes } = useLcd();
  const radarCanvasRef = useRef<HTMLDivElement>(null); // Parent for everything (chart wrapper, boxes, SVG lines)
  const rechartsWrapperRef = useRef<HTMLDivElement>(null); // Parent for ResponsiveContainer

  const [chartLayout, setChartLayout] = useState({
    canvasWidth: 0, canvasHeight: 0,
    chartOffsetX: 0, chartOffsetY: 0, // Offset of rechartsWrapperRef from radarCanvasRef
    chartInnerWidth: 0, chartInnerHeight: 0, // Dimensions of rechartsWrapperRef
    radarCx: 0, radarCy: 0, radarOuterRadius: 0, // Recharts internal cx/cy/radius
  });

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

  const calculateStrategyAverage = useCallback((concept: 'A' | 'B', strategyId: string): number => {
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
  }, [evaluationChecklists, strategies, evaluationToScore]);

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
  }, [evaluationChecklists, strategies, setRadarChartData, calculateStrategyAverage]);

  // Calculate chart dimensions and radar point coordinates
  const calculateChartLayout = useCallback(() => {
    if (radarCanvasRef.current && rechartsWrapperRef.current) {
      const canvasRect = radarCanvasRef.current.getBoundingClientRect();
      const chartWrapperRect = rechartsWrapperRef.current.getBoundingClientRect();

      const canvasWidth = canvasRect.width;
      const canvasHeight = canvasRect.height;

      // Offset of rechartsWrapperRef from radarCanvasRef's top-left corner
      const chartOffsetX = chartWrapperRect.left - canvasRect.left;
      const chartOffsetY = chartWrapperRect.top - canvasRect.top;
      const chartInnerWidth = chartWrapperRect.width;
      const chartInnerHeight = chartWrapperRect.height;

      // Recharts default cx/cy/outerRadius calculation for ResponsiveContainer
      // These are relative to chartInnerWidth/Height
      const radarCx = chartInnerWidth / 2;
      const radarCy = chartInnerHeight / 2;
      const radarOuterRadius = Math.min(chartInnerWidth, chartInnerHeight) / 2 * 0.8; // 80% of the smaller dimension's half

      setChartLayout({
        canvasWidth, canvasHeight,
        chartOffsetX, chartOffsetY,
        chartInnerWidth, chartInnerHeight,
        radarCx, radarCy, radarOuterRadius,
      });
    }
  }, []);

  useEffect(() => {
    calculateChartLayout();
    window.addEventListener('resize', calculateChartLayout);
    return () => window.removeEventListener('resize', calculateChartLayout);
  }, [calculateChartLayout]);

  const getRadarPointCoordinates = useCallback((strategyIndex: number) => {
    if (strategies.length === 0 || !chartLayout.canvasWidth) return { x: 0, y: 0 };

    const angleStep = 360 / strategies.length;
    const startAngle = 90; // Recharts starts the first axis at 90 degrees (top)
    const angleInDegrees = startAngle - strategyIndex * angleStep;
    const angleInRadians = (angleInDegrees * Math.PI) / 180;

    // Radar point relative to the chartWrapperRef's internal coordinate system
    const x_relative_to_chart = chartLayout.radarCx + chartLayout.radarOuterRadius * Math.cos(angleInRadians);
    const y_relative_to_chart = chartLayout.radarCy - chartLayout.radarOuterRadius * Math.sin(angleInRadians); // Y-axis is inverted in screen coordinates

    // Radar point relative to the radarCanvasRef's top-left corner
    const x = chartLayout.chartOffsetX + x_relative_to_chart;
    const y = chartLayout.chartOffsetY + y_relative_to_chart;

    return { x, y };
  }, [strategies, chartLayout]);

  const handleNoteChange = (strategyId: string, newText: string) => {
    setRadarNotes(prev => ({
      ...prev,
      [strategyId]: newText,
    }));
  };

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
        based on your evaluations in the "Evaluation Checklists" section. Use the text boxes to add notes for each strategy.
      </p>

      <div className="relative w-full h-[700px]" ref={radarCanvasRef}> {/* Main canvas for chart, boxes, and lines */}
        {chartLayout.canvasWidth > 0 && chartLayout.canvasHeight > 0 && strategies.length > 0 ? (
          <>
            {/* SVG for drawing lines - positioned absolutely to cover the entire canvas */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
              {strategies.map((strategy, index) => {
                const radarPoint = getRadarPointCoordinates(index);
                const boxStyle = textBoxPositions[index];

                // Calculate box's absolute pixel position (top-left corner) relative to radarCanvasRef
                let boxAbsLeft = 0;
                let boxAbsTop = 0;

                if (boxStyle.left !== undefined) {
                  boxAbsLeft = (parseFloat(boxStyle.left as string) / 100) * chartLayout.canvasWidth;
                } else if (boxStyle.right !== undefined) {
                  boxAbsLeft = chartLayout.canvasWidth - (parseFloat(boxStyle.right as string) / 100) * chartLayout.canvasWidth - BOX_WIDTH;
                }

                if (boxStyle.top !== undefined) {
                  boxAbsTop = (parseFloat(boxStyle.top as string) / 100) * chartLayout.canvasHeight;
                } else if (boxStyle.bottom !== undefined) {
                  boxAbsTop = chartLayout.canvasHeight - (parseFloat(boxStyle.bottom as string) / 100) * chartLayout.canvasHeight - BOX_HEIGHT;
                }

                // Adjust for transform: translateX(-50%) for the bottom-center box (Strategy 7)
                if (boxStyle.transform && (boxStyle.transform as string).includes('translateX(-50%)')) {
                  boxAbsLeft = (chartLayout.canvasWidth / 2) - (BOX_WIDTH / 2);
                }

                // Calculate the center of the box for line connection
                const lineStartBoxX = boxAbsLeft + BOX_WIDTH / 2;
                const lineStartBoxY = boxAbsTop + BOX_HEIGHT / 2;

                return (
                  <line
                    key={`line-${strategy.id}`}
                    x1={lineStartBoxX}
                    y1={lineStartBoxY}
                    x2={radarPoint.x}
                    y2={radarPoint.y}
                    stroke="#999"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>

            {/* Radar Chart - centered and taking up 70% of the canvas */}
            <div ref={rechartsWrapperRef} className="absolute inset-0 m-auto w-[70%] h-[70%]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis dataKey="strategyName" stroke="#333" tick={{ fill: '#333', fontSize: 12, fontFamily: 'Roboto Condensed' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 4]} tickCount={5} stroke="#333" tick={{ fill: '#333', fontSize: 10, fontFamily: 'Roboto' }} />
                  <Radar name="Concept A" dataKey="A" stroke="var(--app-concept-a-dark)" fill="var(--app-concept-a-light)" fillOpacity={0.6} />
                  <Radar name="Concept B" dataKey="B" stroke="var(--app-concept-b-dark)" fill="var(--app-concept-b-light)" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Strategy Notes Boxes - positioned absolutely around the chart */}
            {strategies.map((strategy, index) => (
              <StrategyNotesBox
                key={strategy.id}
                strategyId={strategy.id}
                strategyName={strategy.name}
                text={radarNotes[strategy.id] || ''}
                onTextChange={handleNoteChange}
                style={textBoxPositions[index]}
              />
            ))}
          </>
        ) : (
          <p className="text-app-body-text absolute inset-0 flex items-center justify-center">Loading strategies...</p>
        )}
      </div>

      <WipeContentButton sectionKey="radarChart" />
    </div>
  );
};

export default EvaluationRadar;