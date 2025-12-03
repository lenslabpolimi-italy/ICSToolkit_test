"use client";

import React, { useEffect } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'; // Removed Legend from import
import { EvaluationLevel, Strategy } from '@/types/lcd';
import { getStrategyPriorityForDisplay, getPriorityTagClasses } from '@/utils/lcdUtils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import StrategyInsightBox from '@/components/StrategyInsightBox';
import StickyNote from '@/components/StickyNote';
import { toast } from 'sonner';

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
  const strategyId = payload.value.split('.')[0];
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

// Adjusted positions for the 5 strategies around the radar (Strategy 4 will be handled separately)
const insightBoxPositions: { [key: string]: { top: number | string; left?: number | string; right?: number | string; transform?: string; } } = {
  '1': { top: -40, left: '50%', transform: 'translateX(-50%)' }, // Top center, slightly above radar
  '2': { top: 80, left: 'calc(75% + 20px)' }, // Top-right
  '3': { top: 400, left: 'calc(75% + 20px)' }, // Bottom-right
  '6': { top: 80, right: 'calc(75% + 20px)' }, // Top-left
  '5': { top: 400, right: 'calc(75% + 20px)' }, // Bottom-left
};

const EvaluationRadar: React.FC = () => {
  const {
    strategies,
    evaluationChecklists,
    setRadarChartData,
    radarChartData,
    qualitativeEvaluation,
    radarInsights,
    radarEcoIdeas,
    setRadarEcoIdeas,
    updateEcoIdea,
    deleteEcoIdea,
  } = useLcd();

  // Filter strategies to exclude Strategy 7 for radar display
  const strategiesForRadar = strategies.filter(s => s.id !== '7');

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

  // Handlers for radarEcoIdeas
  const handleRadarEcoIdeaDragStop = (id: string, x: number, y: number) => {
    setRadarEcoIdeas(prev =>
      prev.map(note => (note.id === id ? { ...note, x, y } : note))
    );
    // No need to update original ecoIdea's x,y as radar's position is independent
  };

  const handleRadarEcoIdeaTextChange = (id: string, newText: string) => {
    // Update the text in radarEcoIdeas
    setRadarEcoIdeas(prev =>
      prev.map(note => (note.id === id ? { ...note, text: newText } : note))
    );
    // Also update the text in the original ecoIdeas
    updateEcoIdea(id, { text: newText });
  };

  const handleRadarEcoIdeaDelete = (id: string) => {
    // Delete from radarEcoIdeas
    setRadarEcoIdeas(prev => prev.filter(note => note.id !== id));
    // Also delete from original ecoIdeas, which will then trigger the useEffect to sync radarEcoIdeas
    deleteEcoIdea(id);
    toast.info("Confirmed eco-idea removed.");
  };

  const handleRadarEcoIdeaConfirmToggle = (id: string) => {
    // Find the current state of isConfirmed for this idea
    const currentIdea = radarEcoIdeas.find(idea => idea.id === id);
    if (currentIdea) {
      const newConfirmedStatus = !currentIdea.isConfirmed;
      // Update in radarEcoIdeas
      setRadarEcoIdeas(prev =>
        prev.map(note =>
          note.id === id ? { ...note, isConfirmed: newConfirmedStatus } : note
        )
      );
      // Update in original ecoIdeas, which will then trigger the useEffect to sync radarEcoIdeas
      updateEcoIdea(id, { isConfirmed: newConfirmedStatus });
      toast.info(`Eco-idea ${newConfirmedStatus ? 'confirmed' : 'unconfirmed'}.`);
    }
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

      {/* Main container for radar, strategy boxes, notes, and legend */}
      <div className="relative max-w-7xl mx-auto flex flex-col items-center mt-12"> {/* Adjusted top margin */}
        {strategiesForRadar.length > 0 ? (
          <>
            {/* Radar Chart Area (fixed height) */}
            <div className="relative w-full h-[600px]"> {/* Fixed height for the radar chart and its surrounding boxes */}
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis
                    dataKey="strategyName"
                    tick={(props) => (
                      <CustomAngleAxisTick
                        {...props}
                        strategies={strategiesForRadar}
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
                  {/* Removed <Legend /> from here to manually position it later */}
                </RadarChart>
              </ResponsiveContainer>

              {/* Render StrategyInsightBoxes (except Strategy 4) and their associated notes containers */}
              {strategiesForRadar.map(strategy => {
                if (strategy.id === '4') return null; // Strategy 4 will be rendered separately below

                const priority = getStrategyPriorityForDisplay(strategy, qualitativeEvaluation);
                const boxPosition = insightBoxPositions[strategy.id] || {};

                const notesForCurrentStrategy = radarEcoIdeas.filter(idea => idea.strategyId === strategy.id);

                // Calculate the position for the notes container
                const notesContainerStyle: React.CSSProperties = {
                  position: 'absolute',
                  top: `calc(${boxPosition.top}px + ${BOX_HEIGHT}px + ${NOTES_CONTAINER_OFFSET_Y}px)`,
                  left: boxPosition.left,
                  right: boxPosition.right,
                  transform: boxPosition.transform,
                  width: NOTES_BOX_WIDTH,
                  height: NOTES_BOX_HEIGHT,
                  border: '2px solid var(--app-accent)',
                  borderRadius: '8px',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  zIndex: 90,
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
                        zIndex: 100,
                      }}
                    />

                    <div style={notesContainerStyle} className="relative">
                      {notesForCurrentStrategy.length > 0 ? (
                        notesForCurrentStrategy.map((idea) => (
                          <StickyNote
                            key={idea.id}
                            id={idea.id}
                            x={idea.x}
                            y={idea.y}
                            text={idea.text}
                            strategyId={idea.strategyId}
                            isConfirmed={idea.isConfirmed}
                            onDragStop={handleRadarEcoIdeaDragStop}
                            onTextChange={handleRadarEcoIdeaTextChange}
                            onDelete={handleRadarEcoIdeaDelete}
                            onConfirmToggle={handleRadarEcoIdeaConfirmToggle}
                          />
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic font-roboto-condensed text-transparent">No confirmed ideas yet.</p>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Strategy 4 and its notes, positioned below the radar chart area */}
            {strategiesForRadar.find(s => s.id === '4') && (
              <div className="relative w-full flex flex-col items-center mt-8"> {/* Gap after radar */}
                {strategiesForRadar.filter(s => s.id === '4').map(strategy => {
                  const priority = getStrategyPriorityForDisplay(strategy, qualitativeEvaluation);
                  const notesForCurrentStrategy = radarEcoIdeas.filter(idea => idea.strategyId === strategy.id);
                  return (
                    <React.Fragment key={strategy.id}>
                      <StrategyInsightBox
                        strategy={strategy}
                        priority={priority}
                        className="mb-4" // Small gap after box
                      />
                      <div className="relative" style={{ width: NOTES_BOX_WIDTH, height: NOTES_BOX_HEIGHT, border: '2px solid var(--app-accent)', borderRadius: '8px', padding: '8px', backgroundColor: 'transparent', zIndex: 90 }}>
                        {notesForCurrentStrategy.length > 0 ? (
                          notesForCurrentStrategy.map((idea) => (
                            <StickyNote
                              key={idea.id}
                              id={idea.id}
                              x={idea.x}
                              y={idea.y}
                              text={idea.text}
                              strategyId={idea.strategyId}
                              isConfirmed={idea.isConfirmed}
                              onDragStop={handleRadarEcoIdeaDragStop}
                              onTextChange={handleRadarEcoIdeaTextChange}
                              onDelete={handleRadarEcoIdeaDelete}
                              onConfirmToggle={handleRadarEcoIdeaConfirmToggle}
                            />
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic font-roboto-condensed text-transparent">No confirmed ideas yet.</p>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* Manual Legend */}
            <div className="flex justify-center gap-8 mt-8"> {/* Gap after notes */}
              <div className="flex items-center">
                <div className="w-4 h-4 bg-app-concept-a-light border border-app-concept-a-dark mr-2"></div>
                <span className="text-app-body-text font-roboto-condensed">Concept A</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-app-concept-b-light border border-app-concept-b-dark mr-2"></div>
                <span className="text-app-body-text font-roboto-condensed">Concept B</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-app-body-text">Loading strategies...</p>
        )}
      </div>

      {/* Display Strategy Insights as static text (kept from previous step) */}
      <div className="mt-24 pt-8 border-t border-gray-200"> {/* Increased top margin to push the line down */}
        <h3 className="text-2xl font-palanquin font-semibold text-app-header mb-6 text-transparent">Strategy Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategiesForRadar.map(strategy => {
            const insightText = radarInsights[strategy.id];
            if (!insightText) return null;

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