"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, XCircle } from 'lucide-react';
import { Strategy } from '@/types/lcd';
import { toast } from 'sonner';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import ImprovementNote from './ImprovementNote'; // Import the new ImprovementNote component

interface ImprovementRadarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  strategies: Strategy[]; // Strategies to display on the radar axes
}

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
    1: 'Poor',
    2: 'Mediocre',
    3: 'Good',
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
const CustomAngleAxisTick = ({ x, y, payload, strategies }: any) => {
  const strategyId = payload.value.split('.')[0];
  const strategy = strategies.find((s: Strategy) => s.id === strategyId);
  if (!strategy) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={10} textAnchor="middle" fill="#333" fontSize={12} fontFamily="Roboto Condensed">
        {strategy.id}. {strategy.name}
      </text>
    </g>
  );
};

const ImprovementRadarDialog: React.FC<ImprovementRadarDialogProps> = ({ isOpen, onClose, strategies }) => {
  const [improvementNotes, setImprovementNotes] = useState<ImprovementNoteData[]>([]);
  const [selectedStrategyForNewNote, setSelectedStrategyForNewNote] = useState(strategies[0]?.id || '');

  // Set initial selected strategy for new notes when strategies load
  React.useEffect(() => {
    if (strategies.length > 0 && !selectedStrategyForNewNote) {
      setSelectedStrategyForNewNote(strategies[0].id);
    }
  }, [strategies, selectedStrategyForNewNote]);

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
  const radarData = strategies.map(s => ({
    strategyName: `${s.id}. ${s.name}`,
    fullMark: 4, // Max score for Excellent
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-palanquin text-app-header">Improvement Radar</DialogTitle>
          <DialogDescription className="font-roboto">
            Brainstorm and place new ideas for improving your concepts on this radar.
            These ideas are independent of the initial evaluation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow flex flex-col lg:flex-row gap-4 overflow-hidden">
          {/* Radar Chart Area (Visual Reference) */}
          <div className="relative flex-grow lg:w-1/2 h-full border border-gray-200 rounded-lg bg-gray-50 p-4 flex items-center justify-center">
            {strategies.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis
                    dataKey="strategyName"
                    tick={(props) => (
                      <CustomAngleAxisTick
                        {...props}
                        strategies={strategies}
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
            ) : (
              <p className="text-app-body-text">Loading strategies...</p>
            )}
          </div>

          {/* Improvement Notes Area */}
          <div className="relative lg:w-1/2 h-full border border-gray-200 rounded-lg bg-white p-4 overflow-auto">
            <h3 className="text-xl font-palanquin font-semibold text-app-header mb-4">Your Improvement Ideas</h3>
            <div className="flex items-center gap-2 mb-4">
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
            <div className="relative min-h-[200px] border border-gray-100 rounded-md p-2">
              {improvementNotes.length === 0 && (
                <p className="text-sm text-gray-500 italic font-roboto-condensed p-4">Click "Add Idea" to start brainstorming improvements.</p>
              )}
              {improvementNotes.map(note => (
                <ImprovementNote
                  key={note.id}
                  id={note.id}
                  x={note.x}
                  y={note.y}
                  text={note.text}
                  strategyId={note.strategyId}
                  strategies={strategies} // Pass strategies for the dropdown
                  onDragStop={handleNoteDragStop}
                  onTextChange={handleNoteTextChange}
                  onStrategyChange={handleNoteStrategyChange}
                  onDelete={handleNoteDelete}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImprovementRadarDialog;