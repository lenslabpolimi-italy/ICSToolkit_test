"use client";

import React, { useEffect, useState } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Strategy } from '@/types/lcd';
import { getStrategyPriorityForDisplay } from '@/utils/lcdUtils'; // Only need this for StrategyInsightBox
import { cn } from '@/lib/utils';
import StrategyInsightBox from '@/components/StrategyInsightBox';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ImprovementNote from '@/components/ImprovementNote';
import { PlusCircle, Trash2 } from 'lucide-react';

// Custom tick component for the PolarRadiusAxis (same as EvaluationRadar)
const CustomRadiusTick = ({ x, y, payload }: any) => {
  const scoreToLabel: Record<number, string> = {
    1: 'Worst',
    2: 'Mediocre',
    3: 'Good',
    4: 'Excellent',
  };
  const label = scoreToLabel[payload.value];

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

// Custom tick component for the PolarAngleAxis to display strategy name (for Improvement Radar)
const CustomAngleAxisTickImprovement = ({ x, y, payload, strategies }: any) => {
  const strategyId = payload.value.split('.')[0];
  const strategy = strategies.find((s: Strategy) => s.id === strategyId);
  if (!strategy) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* StrategyInsightBox will handle the display */}
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

interface ImprovementNoteData {
  id: string;
  text: string;
  strategyId: string;
  x: number;
  y: number;
}

const ImprovementRadar: React.FC = () => {
  const { strategies, qualitativeEvaluation } = useLcd();
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

  // Handlers for Improvement Notes
  const addImprovementNote = () => {
    if (!selectedStrategyForNewNote) {
      toast.error("Please select a strategy for the new idea.");
      return;
    }
    const offsetX = Math.floor(Math.random() * 100) - 50;
    const offsetY = Math.floor(Math.random() * 100) - 50;
    const newNote: ImprovementNoteData = {
      id: `improvement-note-${Date.now()}`,
      text: '',
      strategyId: selectedStrategyForNewNote,
      x: 20 + offsetX,
      y: 20 + offsetY,
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

  // Data for the empty radar chart (only axes and grid) for improvement radar
  const improvementRadarData = strategiesForRadar.map(s => ({
    strategyName: `${s.id}. ${s.name}`,
    fullMark: 4, // Max score for Excellent
  }));

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">
        Improvement Radar
      </h2>
      <p className="text-app-body-text mb-4">
        Brainstorm and place new ideas for improving your concepts on this radar. These ideas are independent of the initial evaluation.
      </p>

      <div className="mb-8 flex justify-end gap-4">
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
              </RadarChart>
            </ResponsiveContainer>

            {strategiesForRadar.map(strategy => {
              const boxPosition = insightBoxPositions[strategy.id] || {};
              const priority = getStrategyPriorityForDisplay(strategy, qualitativeEvaluation);

              return (
                <React.Fragment key={strategy.id}>
                  <StrategyInsightBox
                    strategy={strategy}
                    priority={undefined} // No priority for Improvement Radar
                    className="absolute"
                    style={{
                      top: boxPosition.top,
                      left: boxPosition.left,
                      right: boxPosition.right,
                      transform: boxPosition.transform,
                      zIndex: 10,
                    }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      top: `calc(${boxPosition.top}px + ${BOX_HEIGHT}px + ${NOTES_CONTAINER_OFFSET_Y}px)`,
                      left: boxPosition.left,
                      right: boxPosition.right,
                      transform: boxPosition.transform,
                      width: NOTES_BOX_WIDTH,
                      height: NOTES_BOX_HEIGHT,
                      border: '2px dashed var(--app-accent)',
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
                          strategies={strategies}
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
                </React.Fragment>
              );
            })}
          </>
        ) : (
          <p className="text-app-body-text">Loading strategies...</p>
        )}
      </div>

      <WipeContentButton sectionKey="improvementNotes" label="Wipe All Ideas" />
    </div>
  );
};

export default ImprovementRadar;