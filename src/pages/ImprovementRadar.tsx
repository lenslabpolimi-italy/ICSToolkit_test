"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, XCircle } from 'lucide-react';
import { Strategy } from '@/types/lcd';
import { toast } from 'sonner';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import ImprovementNote from '@/components/ImprovementNote'; // Import the ImprovementNote component
import { useLcd } from '@/context/LcdContext'; // To get strategies
import StrategyInsightBox from '@/components/StrategyInsightBox'; // Import StrategyInsightBox
import { getStrategyPriorityForDisplay, getPriorityTagClasses } from '@/utils/lcdUtils'; // For StrategyInsightBox

interface ImprovementNoteData {
  id: string;
  text: string;
  strategyId: string;
  x: number;
  y: number;
}

// Custom tick component for the PolarRadiusAxis (same as in EvaluationRadar)
const CustomRadiusTick = ({ x, y, payload }: any) => {
  const scoreToLabel: Record<number, string> = {
    1: 'Worst -',
    2: 'No Improvement =',
    3: 'Incremental Improvement +', // Changed from 'Good' to 'Incremental Improvement +'
    4: 'Excellent',
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
      {/* Removed strategy name text */}
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
  '1': { top: -104, left: '50%', transform: 'translateX(-50%)' }, // Top center
  '2': { top: 100, left: 'calc(75% + 20px)' }, // Top-right
  '3': { top: 400, left: 'calc(75% + 20px)' }, // Bottom-right
  '4': { top: 650, left: '50%', transform: 'translateX(-50%)' }, // Bottom center, adjusted for more space
  '6': { top: 100, right: 'calc(75% + 20px)' }, // Top-left
  '5': { top: 400, right: 'calc(75% + 20px)' }, // Bottom-left
};

const ImprovementRadar: React.FC = () => {
  const { strategies, qualitativeEvaluation } = useLcd(); // Get strategies and qualitativeEvaluation from context
  const navigate = useNavigate();
  const [improvementNotes, setImprovementNotes] = useState<ImprovementNoteData[]>([]);
  const [selectedStrategyForNewNote, setSelectedStrategyForNewNote] = useState(strategies[0]?.id || '');

  // Filter strategies to exclude Strategy 7 for radar display
  const strategiesForRadar = strategies.filter(s => s.id !== '7');

  // Set initial selected strategy for new notes when strategies load
  useEffect(() => {
    if (strategiesForRadar.length > 0 && !selectedStrategyForNewNote) {
      setSelectedStrategyForNewNote(strategiesForRadar[0].id);
    }
  }, [strategiesForRadar, selectedStrategyForNewNote]);

  const addImprovementNote = () => {
    if (!selectedStrategyForNewNote) {
      toast.error("Please select a strategy for the new idea.");
      return;
    }
    // Generate random offsets for x and y to prevent overlapping within the note container
    const offsetX = Math.floor(Math.random() * 50) - 25; // -25 to +25
    const offsetY = Math.floor(Math.random() * 50) - 25; // -25 to +25
    const newNote: ImprovementNoteData = {
      id: `improvement-note-${Date.now()}`,
      text: '',
      strategyId: selectedStrategyForNewNote,
      x: 10 + offsetX, // Initial X position relative to the notes container
      y: 10 + offsetY, // Initial Y position relative to the notes container
    };
    setImprovementNotes(prev => [...prev, newNote]);
    toast.success("New improvement idea added!");
  };

  const handleNoteDragStop = (id: string, x: number, y: number) => {
    setImprovementNotes(prev =>
      prev.map(note => (note.id === id ? { ...note, x, y } : note))
    );
  };

  const handleNoteTextChange = (id: string, newText: string) => {
    setImprovementNotes(prev =>
      prev.map(note => (note.id === id ? { ...note, text: newText } : note))
    );
  };

  const handleNoteStrategyChange = (id: string, newStrategyId: string) => {
    setImprovementNotes(prev =>
      prev.map(note => (note.id === id ? { ...note, strategyId: newStrategyId } : note))
    );
  };

  const handleNoteDelete = (id: string) => {
    setImprovementNotes(prev => prev.filter(note => note.id !== id));
    toast.info("Improvement idea removed.");
  };

  const handleWipeNotes = () => {
    setImprovementNotes([]);
    toast.success("All improvement ideas wiped!");
  };

  // Data for the empty radar chart (only axes and grid)
  const radarData = strategiesForRadar.map(s => ({
    strategyName: `${s.id}. ${s.name}`,
    fullMark: 4, // Max score for Excellent
  }));

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Improvement Radar</h2>
      <p className="text-app-body-text mb-4">
        Brainstorm and place new ideas for improving your concepts on this radar.
        These ideas are independent of the initial evaluation.
      </p>

      <div className="mb-8 flex justify-end gap-4">
        <Button
          onClick={() => navigate('/evaluation-radar')}
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
          onClick={handleWipeNotes}
          variant="outline"
          className="bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 font-roboto-condensed"
        >
          <XCircle className="mr-2 h-4 w-4" /> Wipe All
        </Button>
      </div>

      <div className="relative max-w-7xl mx-auto h-[700px] flex justify-center items-center mt-32">
        {strategiesForRadar.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
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
                {/* No Radar components for Concept A/B - this is a blank canvas */}
              </RadarChart>
            </ResponsiveContainer>

            {/* Render StrategyInsightBoxes and their associated notes containers */}
            {strategiesForRadar.map(strategy => {
              const priority = getStrategyPriorityForDisplay(strategy, qualitativeEvaluation);
              const boxPosition = insightBoxPositions[strategy.id] || {};

              const notesForCurrentStrategy = improvementNotes.filter(note => note.strategyId === strategy.id);

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
                zIndex: 5,
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
                      zIndex: 10,
                    }}
                  />

                  <div style={notesContainerStyle} className="relative">
                    {notesForCurrentStrategy.length > 0 ? (
                      notesForCurrentStrategy.map((note) => (
                        <ImprovementNote
                          key={note.id}
                          id={note.id}
                          x={note.x}
                          y={note.y}
                          text={note.text}
                          strategyId={note.strategyId}
                          strategies={strategiesForRadar}
                          onDragStop={handleNoteDragStop}
                          onTextChange={handleNoteTextChange}
                          onStrategyChange={handleNoteStrategyChange}
                          onDelete={handleNoteDelete}
                        />
                      ))
                    ) : (
                      null
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </>
        ) : (
          <p className="text-app-body-text">Loading strategies...</p>
        )}
      </div>

      {/* Placeholder for Strategy Insights to maintain space */}
      <div className="mt-48 pt-8">
        {/* Content removed to keep space */}
      </div>

      {/* Manual Legend for Concept A and B (removed as this is an improvement radar) */}
      <div className="flex justify-center gap-8 mt-12 mb-8 text-app-body-text font-roboto-condensed">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 block rounded-full bg-gray-200 border border-gray-400"></span>
          <span>Improvement Ideas</span>
        </div>
      </div>
    </div>
  );
};

export default ImprovementRadar;