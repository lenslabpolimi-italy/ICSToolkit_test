"use client";

import React, { useEffect, useState } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { EvaluationLevel, Strategy } from '@/types/lcd';
import { getStrategyPriorityForDisplay, getPriorityTagClasses } from '@/utils/lcdUtils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react'; // Import icons for buttons

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

// Custom tick component for the PolarAngleAxis to display strategy name
const CustomAngleAxisTick = ({ x, y, payload, strategies }: any) => {
  const strategyId = payload.value.split('.')[0];
  const strategy = strategies.find((s: Strategy) => s.id === strategyId);

  if (!strategy) return null;

  // Adjust position for text to be outside the radar and readable
  const radiusOffset = 100; // Increased distance from the outer edge of the radar
  const angle = payload.angle; // Angle in degrees

  // Convert angle to radians for sin/cos
  const rad = (angle * Math.PI) / 180;

  // Calculate new x, y for the strategy name
  const newX = x + Math.cos(rad) * radiusOffset;
  const newY = y + Math.sin(rad) * radiusOffset;

  // Determine text anchor based on quadrant for better readability
  let textAnchor = 'middle';
  if (angle > 45 && angle <= 135) { // Bottom-right quadrant
    textAnchor = 'start';
  } else if (angle > 135 && angle <= 225) { // Bottom-left quadrant
    textAnchor = 'end';
  } else if (angle > 225 && angle <= 315) { // Top-left quadrant
    textAnchor = 'end';
  } else { // Top-right quadrant (and top center)
    textAnchor = 'start';
  }

  // For top and bottom, center the text
  if (angle === 90 || angle === 270) {
    textAnchor = 'middle';
  }

  return (
    <g>
      <text
        x={newX}
        y={newY}
        textAnchor={textAnchor}
        fill="#135C95" // app-header color
        fontSize={14}
        fontFamily="Palanquin"
        fontWeight="600"
      >
        {strategy.id}. {strategy.name}
      </text>
    </g>
  );
};


const EvaluationRadar: React.FC = () => {
  const {
    strategies,
    evaluationChecklists,
    setRadarChartData,
    radarChartData,
    qualitativeEvaluation,
    // Removed radarEcoIdeas, setRadarEcoIdeas, updateEcoIdea, deleteEcoIdea
  } = useLcd();

  const [showImprovementRadar, setShowImprovementRadar] = useState(false);
  // Removed improvementNotes, setImprovementNotes
  const [selectedStrategyForNewNote, setSelectedStrategyForNewNote] = useState(strategies[0]?.id || '');

  // Filter strategies to exclude Strategy 7 for radar display
  const strategiesForRadar = strategies.filter(s => s.id !== '7');

  // Set initial selected strategy for new improvement notes when strategies load
  useEffect(() => {
    if (strategies.length > 0 && !selectedStrategyForNewNote) {
      setSelectedStrategyForNewNote(strategies[0].id);
    }
  }, [strategies, selectedStrategyForNewNote]);

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

    const strategy = strategies.find(s => s.id === strategyId); // Use original strategies for checklist lookup
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

    // Calculate averages only for strategies to be displayed on radar
    strategiesForRadar.forEach(strategy => {
      newRadarDataA[strategy.id] = calculateStrategyAverage('A', strategy.id);
      newRadarDataB[strategy.id] = calculateStrategyAverage('B', strategy.id);
    });

    setRadarChartData({
      A: newRadarDataA,
      B: newRadarDataB,
    });
  }, [evaluationChecklists, strategies, setRadarChartData]); // Depend on original strategies to ensure all checklists are processed

  const data = strategiesForRadar.map(strategy => ({
    strategyName: `${strategy.id}. ${strategy.name}`,
    A: radarChartData.A[strategy.id] || 0,
    B: radarChartData.B[strategy.id] || 0,
    fullMark: 4, // Max score for Excellent
  }));

  // Determine if both concepts are *completely* evaluated (all strategies have score > 0)
  const allStrategiesEvaluatedA = strategiesForRadar.every(strategy =>
    (radarChartData.A[strategy.id] || 0) > 0
  );
  const allStrategiesEvaluatedB = strategiesForRadar.every(strategy =>
    (radarChartData.B[strategy.id] || 0) > 0
  );
  const isImprovementRadarActive = allStrategiesEvaluatedA && allStrategiesEvaluatedB;

  // Removed all handlers for radarEcoIdeas and Improvement Notes
  // Removed addImprovementNote, handleImprovementNoteDragStop, etc.
  // Removed handleWipeImprovementNotes

  const handleImprovementRadarClick = () => {
    if (!isImprovementRadarActive) {
      toast.info("Please complete the evaluation for both Concept A and Concept B to activate the Improvement Radar.");
    } else {
      setShowImprovementRadar(true);
    }
  };

  const handleBackToEvaluationRadar = () => {
    setShowImprovementRadar(false);
  };

  // Data for the empty radar chart (only axes and grid) for improvement radar
  const improvementRadarData = strategiesForRadar.map(s => ({
    strategyName: `${s.id}. ${s.name}`,
    fullMark: 4, // Max score for Excellent
  }));

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">
        {showImprovementRadar ? "Improvement Radar" : "Evaluation Radar"}
      </h2>
      <p className="text-app-body-text mb-4">
        {showImprovementRadar
          ? "This radar allows you to visualize potential areas for improvement."
          : "This radar chart displays the pursuit level of each of the 7 strategies for Concept A and B, based on your evaluations in the 'Evaluation Checklists' section."
        }
      </p>

      <div className="mb-8 flex justify-end gap-4">
        {showImprovementRadar ? (
          <>
            <Button
              onClick={handleBackToEvaluationRadar}
              className="bg-gray-500 hover:bg-gray-600 text-white font-roboto-condensed"
            >
              Back to Evaluation Radar
            </Button>
            {/* Removed Add Idea and Wipe All buttons for improvement notes */}
          </>
        ) : (
          <div onClick={handleImprovementRadarClick} className={!isImprovementRadarActive ? "cursor-not-allowed" : ""}>
            <Button
              disabled={!isImprovementRadarActive}
              className={cn(
                "bg-app-accent hover:bg-app-accent/90 text-white font-roboto-condensed",
                !isImprovementRadarActive && "opacity-50 pointer-events-none"
              )}
            >
              Improvement Radar
            </Button>
          </div>
        )}
      </div>

      {/* Main Radar Container - this is where both views will render */}
      <div className="relative max-w-7xl mx-auto h-[700px] flex justify-center items-center mt-32">
        {strategiesForRadar.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={showImprovementRadar ? improvementRadarData : data}>
              <PolarGrid stroke="#e0e0e0" />
              <PolarAngleAxis
                dataKey="strategyName"
                tick={(props) => (
                  <CustomAngleAxisTick
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
              {!showImprovementRadar && (
                <>
                  <Radar name="Concept A" dataKey="A" stroke="var(--app-concept-a-dark)" fill="var(--app-concept-a-light)" fillOpacity={0.6} />
                  <Radar name="Concept B" dataKey="B" stroke="var(--app-concept-b-dark)" fill="var(--app-concept-b-light)" fillOpacity={0.6} />
                </>
              )}
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-app-body-text">Loading strategies...</p>
        )}
      </div>

      {/* Manual Legend for Concept A and B (only for Evaluation Radar) */}
      {!showImprovementRadar && (
        <div className="flex justify-center gap-8 mt-12 mb-8 text-app-body-text font-roboto-condensed">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 block rounded-full" style={{ backgroundColor: 'var(--app-concept-a-light)', border: '1px solid var(--app-concept-a-dark)' }}></span>
            <span>Concept A</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 block rounded-full" style={{ backgroundColor: 'var(--app-concept-b-light)', border: '1px solid var(--app-concept-b-dark)' }}></span>
            <span>Concept B</span>
          </div>
        </div>
      )}

      {/* Wipe Content Button (only for Evaluation Radar) */}
      {!showImprovementRadar && <WipeContentButton sectionKey="radarChart" />}
    </div>
  );
};

export default EvaluationRadar;