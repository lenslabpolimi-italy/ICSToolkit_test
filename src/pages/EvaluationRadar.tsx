"use client";

import React, { useEffect, useState } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { EvaluationLevel, Strategy } from '@/types/lcd';
import { getStrategyPriorityForDisplay, getPriorityTagClasses } from '@/utils/lcdUtils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import StrategyInsightBox from '@/components/StrategyInsightBox';
import StickyNote from '@/components/StickyNote';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ImprovementNote from '@/components/ImprovementNote'; // Import the ImprovementNote component
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

// Custom tick component for the PolarAngleAxis to display strategy name (for Improvement Radar)
const CustomAngleAxisTickImprovement = ({ x, y, payload, strategies }: any) => {
  const strategyId = payload.value.split('.')[0];
  const strategy = strategies.find((s: Strategy) => s.id === strategyId);
  if (!strategy) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Removed the text element for strategy name */}
    </g>
  );
};

// Constants for positioning StrategyInsightBoxes and their associated notes containers
const BOX_HEIGHT = 80; // h-20 is 80px
const NOTES_CONTAINER_OFFSET_Y = 16; // Margin between StrategyInsightBox and notes container
const NOTES_BOX_WIDTH = '192px'; // w-48
const NOTES_BOX_HEIGHT = '144px'; // h-36

// Adjusted positions for the 6 strategies around the radar
const insightBoxPositions: { [key: string]: { top: number | string; left?: number | string; right?: number | string; transform?: string; } } = {
  '1': { top: 20, left: '50%', transform: 'translateX(-50%)' }, // Top center, adjusted downwards
  '2': { top: 130, left: 'calc(75% + 20px)' }, // Top-right, adjusted downwards
  '3': { top: 450, left: 'calc(75% + 20px)' }, // Bottom-right, adjusted downwards
  '4': { top: 680, left: '50%', transform: 'translateX(-50%)' }, // Bottom center, adjusted downwards
  '6': { top: 130, right: 'calc(75% + 20px)' }, // Top-left, adjusted downwards
  '5': { top: 450, right: 'calc(75% + 20px)' }, // Bottom-left, adjusted downwards
};

interface ImprovementNoteData {
  id: string;
  text: string;
  strategyId: string;
  x: number;
  y: number;
}

const EvaluationRadar: React.FC = () => {
  const {
    strategies,
    evaluationChecklists,
    setRadarChartData,
    radarChartData,
    qualitativeEvaluation,
    radarEcoIdeas,
    setRadarEcoIdeas,
    updateEcoIdea,
    deleteEcoIdea,
  } = useLcd();

  const [showImprovementRadar, setShowImprovementRadar] = useState(false);
  const [improvementNotes, setImprovementNotes] = useState<ImprovementNoteData[]>([]);
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

  // Handlers for radarEcoIdeas (for the main evaluation radar)
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

  // Handlers for Improvement Notes (for the improvement radar)
  const addImprovementNote = () => {
    if (!selectedStrategyForNewNote) {
      toast.error("Please select a strategy for the new idea.");
      return;
    }
    // Generate random offsets for x and y to prevent overlapping
    const offsetX = Math.floor(Math.random() * 100) - 50; // -50 to +50
    const offsetY = Math.floor(Math.random() * 100) - 50; // -50 to +50
    const newNote: ImprovementNoteData = {
      id: `improvement-note-${Date.now()}`,
      text: '',
      strategyId: selectedStrategyForNewNote,
      x: 20 + offsetX, // Initial X position relative to the notes container
      y: 20 + offsetY, // Initial Y position relative to the notes container
    };
    setImprovementNotes(prev => [...prev, newNote]);
    toast.success("New improvement idea added!");
  };

  const handleImprovementNoteDragStop = (id: string, x: number, y: number) => {
    setImprovementNotes(prev =>
      prev.map(note => (note.id === id ? { ...note, x, y } : note))
    );
  };

  const handleImprovementNoteTextChange = (id: string, newText: string) => {
    setImprovementNotes(prev =>
      prev.map(note => (note.id === id ? { ...note, text: newText } : note))
    );
  };

  const handleImprovementNoteStrategyChange = (id: string, newStrategyId: string) => {
    setImprovementNotes(prev =>
      prev.map(note => (note.id === id ? { ...note, strategyId: newStrategyId } : note))
    );
  };

  const handleImprovementNoteDelete = (id: string) => {
    setImprovementNotes(prev => prev.filter(note => note.id !== id));
    toast.info("Improvement idea removed.");
  };

  const handleWipeImprovementNotes = () => {
    setImprovementNotes([]);
    toast.success("All improvement ideas wiped!");
  };

  const handleImprovementRadarClick = () => {
    if (!isImprovementRadarActive) {
      toast.info("Please complete the evaluation for both Concept A and Concept B to activate the Improvement Radar.");
    } else {
      setShowImprovementRadar(true);
      toast.info("Switched to Improvement Radar. Brainstorm new ideas here!");
    }
  };

  const handleBackToEvaluationRadar = () => {
    setShowImprovementRadar(false);
    toast.info("Switched back to Evaluation Radar.");
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
          ? "Brainstorm and place new ideas for improving your concepts on this radar. These ideas are independent of the initial evaluation."
          : "This radar chart displays the pursuit level of each of the 7 strategies for Concept A and B, based on your evaluations in the 'Evaluation Checklists' section."
        }
      </p>
      {!showImprovementRadar && (
        <p className="text-app-body-text mb-8">
          Below, you'll find the insights you've written for each strategy.
        </p>
      )}

      <div className="mb-8 flex justify-end gap-4">
        {showImprovementRadar ? (
          <>
            <Button
              onClick={handleBackToEvaluationRadar}
              className="bg-gray-500 hover:bg-gray-600 text-white font-roboto-condensed"
            >
              Back to Evaluation Radar
            </Button>
            <Button
              onClick={addImprovementNote}
              className="bg-green-500 hover:bg-green-600 text-white font-roboto-condensed"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Idea
            </Button>
            <Button
              onClick={handleWipeImprovementNotes}
              variant="outline"
              className="bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 font-roboto-condensed"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Wipe All
            </Button>
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
          <>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={showImprovementRadar ? improvementRadarData : data}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis
                  dataKey="strategyName"
                  tick={(props) => (
                    showImprovementRadar ? (
                      <CustomAngleAxisTickImprovement
                        {...props}
                        strategies={strategiesForRadar}
                      />
                    ) : (
                      <CustomAngleAxisTick
                        {...props}
                        strategies={strategiesForRadar}
                        qualitativeEvaluation={qualitativeEvaluation}
                      />
                    )
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

            {/* Render StrategyInsightBoxes and their associated notes containers */}
            {strategiesForRadar.map(strategy => {
              const boxPosition = insightBoxPositions[strategy.id] || {};
              const priority = getStrategyPriorityForDisplay(strategy, qualitativeEvaluation); // Always calculate priority

              return (
                <React.Fragment key={strategy.id}>
                  <StrategyInsightBox
                    strategy={strategy}
                    priority={priority} // Always pass the calculated priority
                    className="absolute"
                    style={{
                      top: boxPosition.top,
                      left: boxPosition.left,
                      right: boxPosition.right,
                      transform: boxPosition.transform,
                      zIndex: 10,
                    }}
                  />

                  {/* Conditional rendering for notes containers based on radar type */}
                  {showImprovementRadar ? (
                    <div
                      style={{
                        position: 'absolute',
                        top: `calc(${boxPosition.top}px + ${BOX_HEIGHT}px + ${NOTES_CONTAINER_OFFSET_Y}px)`,
                        left: boxPosition.left,
                        right: boxPosition.right,
                        transform: boxPosition.transform,
                        width: NOTES_BOX_WIDTH,
                        height: NOTES_BOX_HEIGHT,
                        border: '2px dashed var(--app-accent)', // Dashed border for improvement notes container
                        borderRadius: '8px',
                        padding: '8px',
                        backgroundColor: 'transparent',
                        zIndex: 5,
                      }}
                      className="relative"
                    >
                      {improvementNotes.filter(note => note.strategyId === strategy.id).length > 0 ? (
                        improvementNotes.filter(note => note.strategyId === strategy.id).map((note) => (
                          <ImprovementNote
                            key={note.id}
                            id={note.id}
                            x={note.x}
                            y={note.y}
                            text={note.text}
                            strategyId={note.strategyId}
                            strategies={strategiesForRadar}
                            onDragStop={handleImprovementNoteDragStop}
                            onTextChange={handleImprovementNoteTextChange}
                            onStrategyChange={handleImprovementNoteStrategyChange}
                            onDelete={handleImprovementNoteDelete}
                          />
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic font-roboto-condensed text-transparent">Add ideas here.</p>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
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
                        zIndex: 5,
                      }}
                      className="relative"
                    >
                      {radarEcoIdeas.filter(idea => idea.strategyId === strategy.id).length > 0 ? (
                        radarEcoIdeas.filter(idea => idea.strategyId === strategy.id).map((idea) => (
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
                  )}
                </React.Fragment>
              );
            })}
          </>
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